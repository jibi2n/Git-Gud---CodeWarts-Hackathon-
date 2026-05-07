# system-overview.md

**Status:** authoritative for system architecture and data contracts (referenced by [DESIGN.md](../DESIGN.md) §0).
**Owners:** Role 1 & 4 + Role 2 keep the FastAPI side in sync; Role 3 keeps `apps/web/types/api.ts` in sync.
**Companion docs:** [SDD.md](../SDD.md) is the post-hackathon vision; [DESIGN.md](../DESIGN.md) is the frontend contract.

This document defines **what flows where, in what shape**, for the hackathon build. If `apps/service/main.py` and this file disagree, fix one and update the other in the same PR.

---

## 1. Components

| Component | Lives in | Owner |
|---|---|---|
| Next.js 14 client | `apps/web/` | Role 3 |
| FastAPI ML service | `apps/service/` | Role 1 & 4 (extraction), Role 2 (transcription / vision / scoring) |
| Supabase Storage | managed | Role 3 (client uploads), Role 2 (server-side cleanup) |
| Supabase Postgres | managed | Role 3 (sessions, profiles), Role 2 (TESDA reference data) |
| External AI providers | OpenAI / Anthropic / Whisper / Vision OCR / HuggingFace | Role 1 & 4 + Role 2 |

The frontend **never** calls external AI providers directly. The flow is always: Client → Next.js API route → FastAPI service → external provider.

---

## 2. End-to-End Flow

```
1. POST /api/session             {phone}        -> {sessionId}
2. (client uploads audio to Supabase Storage)   -> {audioUrl}
3. POST /api/transcribe          {audioUrl, sessionId}
     forwards to FastAPI POST /transcribe
                                                -> {transcript}
4. POST /api/extract             {transcript, sessionId}
     forwards to FastAPI POST /extract
                                                -> {competencies[]}
5. (per document)
   POST /api/vision              {imageUrl, sessionId}
     forwards to FastAPI POST /vision
                                                -> {inferredCompetencies[]}
6. (client merges 4 + 5, dedupes by english_label, keeps higher confidence)
7. (user confirms / edits / rejects in <CompetencyEditor>)
8. POST /api/score               {sessionId, competencies: confirmed}
     forwards to FastAPI POST /score
                                                -> {readiness, jobSuggestions[]}
9. GET  /api/profile/[sessionId]                -> {profile}
10. GET /api/pdf/[sessionId]                    -> application/pdf stream
```

---

## 3. FastAPI Endpoints (canonical shapes)

The Pydantic models live in [apps/service/main.py](../apps/service/main.py). Frontend TypeScript types must mirror these field-for-field.

### `POST /transcribe`  *(Role 2)*

```jsonc
// Request
{ "audio_url": "https://...supabase.co/.../session-xyz.webm",
  "session_id": "ses_abc123" }

// Response
{ "transcript": "Nagmamaneho ako ng tricycle, tapos ako rin yung nagaayos ng makina pag may sira.",
  "duration_sec": 47.2 }
```

Constraints:
- Whisper is the provider (mcp/policy.md).
- Raw audio object referenced by `audio_url` is deleted within 24h of a successful response (AGENTS.md §6).

### `POST /extract`  *(Role 1 & 4)*

```jsonc
// Request
{ "transcript": "...",
  "session_id": "ses_abc123" }

// Response
{ "competencies": [
    { "id": "c_001",
      "taglish_label": "Pag-aayos ng makina ng motor",
      "english_label": "Small engine repair",
      "confidence": 0.82,
      "evidence_span": "ako rin yung nagaayos ng makina pag may sira" }
  ] }
```

Constraints:
- XLM-RoBERTa identifies competency-bearing spans. LLM rephrases into formal English. Prompts live in `apps/service/prompts/`.
- No inflation: a tricycle dispatcher is not labeled "logistics director."

### `POST /vision`  *(Role 2)*

```jsonc
// Request
{ "image_url": "https://...supabase.co/.../doc-1.jpg",
  "session_id": "ses_abc123" }

// Response
{ "inferred_competencies": [
    { "id": "c_v001",
      "taglish_label": "Welder Level II (TESDA)",
      "english_label": "TESDA Welder NC II",
      "confidence": 0.65,
      "evidence_span": "TESDA Certificate of Competency NC II" }
  ],
  "raw_text": "REPUBLIC OF THE PHILIPPINES ... CERTIFICATE OF COMPETENCY ..." }
```

Constraints:
- Image bytes deleted after OCR (mcp/policy.md).
- Vision provider chosen Day 1 and added to `mcp/policy.md`.

### `POST /score`  *(Role 2)*

```jsonc
// Request
{ "session_id": "ses_abc123",
  "competencies": [ /* user-confirmed list (subset of 4+5 merge) */ ] }

// Response
{ "readiness": {
    "track_id": "tesda_welder_nc_ii",
    "score": 62.0,
    "matched_competencies": ["Small engine repair", "Tool handling"],
    "missing_competencies": ["Arc welding fundamentals", "Welding safety"],
    "reasoning": "Strong tool fluency and mechanical aptitude. Missing formal welding-process exposure." },
  "job_suggestions": [
    { "archetype": "Apprentice welder",
      "reasoning": "Mechanical aptitude maps directly; entry-level role does not require prior arc experience." },
    { "archetype": "Motorcycle mechanic",
      "reasoning": "Existing engine-repair experience is the main qualification." }
  ] }
```

Constraints:
- Rule-based scorer for hackathon (Role 2).
- One TESDA `track_id` for hackathon — decided Day 1.

---

## 4. Supabase Schema (hackathon)

```sql
-- sessions
create table sessions (
  id              text primary key,        -- "ses_..." opaque ID
  phone_number    text not null,
  consent_voice   boolean not null default false,
  consent_image   boolean not null default false,
  consent_at      timestamptz,
  created_at      timestamptz not null default now()
);

-- profiles (one per session, nullable until /score returns)
create table profiles (
  session_id      text primary key references sessions(id) on delete cascade,
  competencies    jsonb not null default '[]'::jsonb,  -- final user-confirmed list
  readiness       jsonb,                                -- ReadinessScore object
  job_suggestions jsonb not null default '[]'::jsonb,   -- JobSuggestion[]
  updated_at      timestamptz not null default now()
);

-- audit_log (consent + deletions, RA 10173)
create table audit_log (
  id              bigserial primary key,
  session_id      text references sessions(id) on delete set null,
  event           text not null,              -- "consent_granted" | "audio_deleted" | "data_deleted"
  payload         jsonb,
  at              timestamptz not null default now()
);
```

Storage buckets:

| Bucket | Contents | TTL | Access |
|---|---|---|---|
| `audio` | Raw recordings (`.webm`) | **24h hard delete** | client upload via signed URL; service-role read |
| `documents` | Captured images | Deleted after OCR completes | client upload via signed URL; service-role read |

---

## 5. Environment Variables

| Var | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | web | Client SDK |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | web | Client SDK |
| `SUPABASE_SERVICE_ROLE_KEY` | web (server only) | API routes |
| `ML_SERVICE_URL` | web (server only) | FastAPI base URL |
| `ML_SERVICE_API_KEY` | web (server only) + service | Shared secret for FastAPI |
| `OPENAI_API_KEY` *(or `ANTHROPIC_API_KEY`)* | service | LLM provider |
| `WHISPER_API_KEY` | service | Transcription |
| `VISION_API_KEY` | service | OCR (provider TBD) |
| `HF_TOKEN` | service | XLM-RoBERTa model download (if private checkpoint) |

The frontend has **no** keys for OpenAI / Anthropic / Whisper / Vision. Enforced at code review.

---

## 6. Open Questions (track in `docs/decisions/`)

1. Which TESDA track for the hackathon? (DESIGN.md §16, Q1)
2. Vision provider — OpenAI Vision or Google Cloud Vision? (DESIGN.md §16 implicit)
3. Phone number verification — OTP or session-key only? (DESIGN.md §16, Q2)
4. PDF generation — server-side `/api/pdf` or client-side download? (DESIGN.md §16, Q4)
5. Below what `matched` count does `/score` refuse to produce a score? (UC-004)
