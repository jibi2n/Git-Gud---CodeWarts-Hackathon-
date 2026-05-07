# Architecture

This is the living architecture document — current implementation state. The data contracts live in [system-overview.md](system-overview.md). The post-hackathon vision lives in [SDD.md](../SDD.md).

## Current Topology (Hackathon)

```
                 ┌──────────────────────────────┐
                 │  Next.js 14  (apps/web)      │
                 │  Mobile-first, Taglish-only  │
                 │  MediaRecorder, getUserMedia │
                 │  Zustand stores              │
                 │  @react-pdf/renderer         │
                 └──────────┬───────────────────┘
                            │ HTTPS
            ┌───────────────┴────────────────┐
            │                                │
            ▼                                ▼
   ┌────────────────┐             ┌──────────────────────┐
   │   Supabase     │             │  FastAPI ML Service  │
   │   ─ Storage    │             │  apps/service/       │
   │     (audio,    │             │  ─ transcription/    │
   │      images)   │             │  ─ skills/ (XLM-R)   │
   │   ─ Postgres   │             │  ─ llm/ + prompts/   │
   │     (sessions, │             │  ─ vision/           │
   │      profiles) │             │  ─ tesda/            │
   └────────────────┘             │  ─ pathways/         │
                                  └──┬──────┬──────┬─────┘
                                     │      │      │
                            ┌────────▼─┐ ┌─▼────┐ ┌▼──────┐
                            │ Whisper  │ │ LLM  │ │Vision │
                            │   API    │ │OAI/AN│ │  OCR  │
                            └──────────┘ └──────┘ └───────┘
```

External services are limited to the allowlist in [../mcp/policy.md](../mcp/policy.md).

## Data Contracts

See [system-overview.md](system-overview.md). The Pydantic models in [apps/service/main.py](../apps/service/main.py) and the TypeScript types in `apps/web/types/api.ts` (Role 3 to create) must mirror that document.

## Drift Log

*Empty. When the implementation drifts from system-overview.md or DESIGN.md, record it here with a date and a link to the PR.*
