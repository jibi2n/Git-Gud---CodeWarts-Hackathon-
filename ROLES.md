# ROLES.md

This is the per-role editing guide for the four-person Boses team. It tells each role exactly which directories and files they own, what they should edit during the hackathon, and what to leave alone.

The roles described here are the **technical execution roles** for the hackathon build. They are aligned with — but more specific than — the higher-level domain ownerships in [AGENTS.md](AGENTS.md) §3. When a question of authority arises, AGENTS.md governs; this file governs the day-to-day "what do I touch."

> **Hackathon scope is set by [DESIGN.md](DESIGN.md) §1.2.** Anything in [SDD.md](SDD.md) that DESIGN.md marks as a non-goal (job map, multiple TESDA tracks, multi-language toggle, business-idea pathway) is **post-hackathon**. Don't build it.

> **Rule of thumb:** edit your own surfaces freely. Touching another role's surface requires a comment on the PR tagging that owner.

---

## Role 1 & 4 — ML/AI Engineer (the moat)

Two team members share this role. This is the technical innovation surface — the part judges will probe hardest. Your thesis work on XLM-RoBERTa for code-switched Taglish is literally this role; do not waste that competitive advantage on plumbing.

**You own:**
- Taglish competency extraction with XLM-RoBERTa (zero-shot or fine-tuned)
- Prompt engineering for the LLM-assisted formal-vocabulary rephrasing layer
- Model serving via FastAPI

**Edit these directories / files:**

| Path | What to put here |
|---|---|
| [apps/service/skills/](apps/service/skills/) | XLM-RoBERTa loader, inference wrapper, embedding utilities, competency extraction module |
| [apps/service/llm/](apps/service/llm/) | Provider-agnostic LLM client wrapper (OpenAI / Anthropic), retry + rate limit logic |
| [apps/service/prompts/](apps/service/prompts/) | One file per prompt, named after the function that uses it. **Never inline prompts in Python.** |
| [apps/service/main.py](apps/service/main.py) | Implement `POST /extract` (and any internal `/embed` if needed). Coordinate with Role 2 on the merged response shape. |
| [evals/](evals/) | Golden-example evals for competency extraction — Taglish samples are required for the hackathon (Filipino-only and English-only are post-hackathon per DESIGN.md §1.2). |
| [apps/service/tests/](apps/service/tests/) | Unit + integration tests for your modules |
| [specs/use-cases/use-case-002-skill-recognition.md](specs/use-cases/use-case-002-skill-recognition.md) | Spec author / maintainer |

**Coordinate (don't unilaterally edit):**
- `apps/service/pathways/` — Role 2 owns scoring; you provide the embedding/extraction
- `mcp/policy.md` — adding a new model provider or HuggingFace endpoint requires a governance entry first
- [docs/system-overview.md](docs/system-overview.md) — Pydantic shapes for `/extract` are in here; keep them in sync with `apps/service/`

**Do not touch:**
- `apps/web/` — that is Role 3
- `apps/service/vision/` and `apps/service/transcription/` — that is Role 2

**First-day checklist:**
1. Get HuggingFace `xlm-roberta-base` (or your fine-tuned checkpoint) loading inside `apps/service/skills/`.
2. Implement `POST /extract` so it returns competencies with `evidenceSpan` and `confidence` for a Taglish transcript.
3. Write the first golden eval in `evals/extract_taglish.json`.
4. Lift one prompt out of any code-as-string and into `apps/service/prompts/`.

---

## Role 2 — CV + Data Pipeline Engineer

The second ML-flavored role, but lighter on novel modeling, heavier on integration and pipeline glue. You build the FastAPI endpoints around vision and audio inputs, then the data science layer that maps confirmed competencies to the configured TESDA track.

**You own:**
- Computer vision for informal credential OCR (vision API integration)
- Whisper transcription integration
- Readiness scoring: confirmed competencies → TESDA track score + missing competencies + job archetypes

**Edit these directories / files:**

| Path | What to put here |
|---|---|
| [apps/service/vision/](apps/service/vision/) | Vision API wrapper, image preprocessing, OCR result normalization |
| [apps/service/transcription/](apps/service/transcription/) | Whisper API wrapper, audio format conversion, **24h raw-audio deletion enforcement** |
| [apps/service/tesda/](apps/service/tesda/) | One TESDA track for hackathon (decided Day 1). JSON taxonomy + skill-to-competency mapping. |
| [apps/service/pathways/](apps/service/pathways/) | Rule-based readiness scorer + job-archetype suggester |
| [apps/service/main.py](apps/service/main.py) | Implement `POST /transcribe`, `POST /vision`, `POST /score` |
| [apps/service/tests/](apps/service/tests/) | Tests including at least one Taglish transcription sample |
| [specs/use-cases/use-case-001-voice-onboarding.md](specs/use-cases/use-case-001-voice-onboarding.md) | Spec author / maintainer (transcription side) |
| [specs/use-cases/use-case-004-tesda-passing-rate.md](specs/use-cases/use-case-004-tesda-passing-rate.md) | Spec author / maintainer |
| [specs/use-cases/use-case-005-document-vision.md](specs/use-cases/use-case-005-document-vision.md) | Spec author / maintainer |

**Coordinate (don't unilaterally edit):**
- `apps/service/skills/` — Role 1&4 owns extraction; you consume confirmed competencies for scoring
- `mcp/policy.md` — adding a vision provider needs a policy entry first
- [docs/system-overview.md](docs/system-overview.md) — Supabase tables and the FastAPI request/response shapes for `/transcribe`, `/vision`, `/score` are in here

**Do not touch:**
- `apps/web/` — that is Role 3
- `apps/service/llm/` and `apps/service/prompts/` — that is Role 1&4

**First-day checklist:**
1. Get Whisper transcribing one Taglish sample end-to-end via `POST /transcribe`.
2. Implement the 24-hour raw-audio deletion job (a cron stub in code is fine; the contract matters).
3. With the team, decide the one TESDA track for the hackathon, and stand up its competency taxonomy in `apps/service/tesda/<track>.json`.
4. Stub `POST /score` with a rule-based scorer that returns a `ReadinessScore` + 2–4 `JobSuggestion` items.

---

## Role 3 — Frontend Engineer (Next.js + TypeScript lead)

This person makes or breaks the demo. A working ML pipeline with a broken UI loses to a mediocre ML pipeline with a polished UI every single time at hackathons.

**You own:**
- The entire Next.js 14 client (`apps/web/`) — voice recording, document camera, processing screen, profile editor, PDF export, the demo flow
- shadcn/ui setup and the visual identity defined in [DESIGN.md](DESIGN.md)
- [DESIGN.md](DESIGN.md) — primary author; this is the frontend contract

**Stack (locked by DESIGN.md §3):** Next.js 14 App Router · TypeScript strict · Tailwind · shadcn/ui · Zustand · react-hook-form + zod · @react-pdf/renderer · @supabase/supabase-js · MediaRecorder · lucide-react.

**Edit these directories / files:**

| Path | What to put here |
|---|---|
| [apps/web/](apps/web/) | The whole Next.js app — pages, components, stores, lib, locales |
| `apps/web/app/` | App router pages: landing, `/record`, `/documents`, `/processing`, `/profile/[sessionId]`, PDF route |
| `apps/web/components/` | shadcn primitives + recorder, camera, processing, profile, pdf, shared |
| `apps/web/stores/` | The three Zustand stores defined in DESIGN.md §6 |
| [DESIGN.md](DESIGN.md) | UI / accessibility / Taglish-tone contract |
| [specs/use-cases/use-case-003-career-pathways.md](specs/use-cases/use-case-003-career-pathways.md) | Spec author / maintainer (UI side) |

**Coordinate (don't unilaterally edit):**
- `apps/service/main.py` — backend route shapes: agree on request/response shapes with Role 1&4 and Role 2 before wiring
- [docs/system-overview.md](docs/system-overview.md) — the data contract you consume; if you need a field, propose it here first
- `mcp/policy.md` — Supabase + the LLM/Whisper/vision providers must already be listed before frontend wiring

**Do not touch:**
- Anything inside `apps/service/` other than reading types from `docs/system-overview.md`
- The validate-factory script

**First-day checklist:**
1. `npx create-next-app@latest .` inside `apps/web/` (TypeScript, Tailwind, App Router, src dir).
2. Install and configure shadcn/ui per DESIGN.md §8.
3. Build the consent gate on landing (DESIGN.md §11.1) and the `POST /api/session` route.
4. Build `<VoiceRecorder>` per the DESIGN.md §5.3 contract — single ≥56px record button, MediaRecorder Blob output.
5. Wire Supabase Storage upload, then call `POST /api/transcribe` (which forwards to FastAPI).
6. **Critical: never call OpenAI, Anthropic, or Whisper directly from the frontend.** All AI traffic flows through the FastAPI service via Next.js API routes (AGENTS.md §6, DESIGN.md §11.3).

---

## Shared surfaces (everyone may edit, but with caution)

| Path | Notes |
|---|---|
| [AGENTS.md](AGENTS.md) | Governance lead approves changes |
| [SDD.md](SDD.md) | Substantial changes need team approval. SDD = post-hackathon vision; DESIGN.md = hackathon scope. |
| [docs/system-overview.md](docs/system-overview.md) | Authoritative data contracts. Role 1&4 + Role 2 keep this in sync with `apps/service/`. |
| [README.md](README.md) | Keep accurate; mismatch with reality is a documentation bug |
| [docs/](docs/) | Promote recurring lessons here |
| [docs/decisions/](docs/decisions/) | One file per decision (ADR-style) |
| [.agents/skills/](.agents/skills/) | New skills require a PR |
| [Makefile](Makefile) | Touch with care; CI depends on these targets |

## When two roles disagree

1. Re-read [AGENTS.md](AGENTS.md) §3 — domain owner has final call.
2. If the question crosses domains, the governance lead arbitrates.
3. If you are the agent: surface the disagreement, do not try to "split the difference" silently.
