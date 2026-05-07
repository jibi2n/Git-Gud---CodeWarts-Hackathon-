# sana.AI

> Oral-to-digital competency bridge for Filipino informal-sector workers.

sana.AI turns a spoken Taglish story and optional credential photos into recognized competencies, a TESDA Welding SMAW NC II readiness score, and job archetypes — all without a resume, a diploma, or English fluency.

This repository follows a **Software Factory** model. Specs come before plans, plans come before code, and every PR passes through an agentic review loop. See [AGENTS.md](AGENTS.md) for the operating contract.

> **Scope:** [DESIGN.md](DESIGN.md) §1.2 sets the hackathon scope. [SDD.md](SDD.md) describes the wider post-hackathon vision. When the two conflict, DESIGN.md wins for hackathon work.

## How It Works

1. User gives consent for voice recording and document scanning.
2. User records a voice story in Filipino, Taglish, or English (up to 3 minutes).
3. User optionally photographs up to 5 informal credential images.
4. The ML pipeline runs: Whisper transcription → LLM competency extraction → GPT-4o vision OCR → rule-based TESDA readiness scoring.
5. User sees competency cards she can confirm or dismiss, a TESDA readiness score, and matched job archetypes.

## Repository Layout

```
.
├── AGENTS.md                      # Operating contract for humans + agents
├── SDD.md                         # System Design Document (post-hackathon vision)
├── DESIGN.md                      # Frontend contract (hackathon scope authority)
├── ROLES.md                       # Per-role editing guide (who edits what)
├── .agents/skills/                # Reusable agent workflows
├── apps/
│   ├── service/                   # FastAPI ML service (Python)
│   │   ├── main.py                # API routes + Pydantic models
│   │   ├── transcription/         # Whisper integration + deletion policy
│   │   ├── extraction/            # LLM competency extraction
│   │   ├── vision/                # GPT-4o credential OCR
│   │   ├── pathways/              # Rule-based TESDA readiness scorer
│   │   └── tesda/                 # TESDA track manifests (welding_smaw.json)
│   └── web/                       # Next.js 14 frontend (TypeScript)
│       ├── app/                   # Pages: /, /record, /documents, /processing, /profile
│       ├── components/            # VoiceRecorder, DocumentCamera, ConsentGate, UI
│       ├── stores/                # Zustand stores (session, capture, profile)
│       ├── lib/                   # ML client, Supabase client, demo fixtures
│       ├── locales/tl.ts          # All UI copy — no hardcoded strings in components
│       └── types/api.ts           # TypeScript mirrors of Pydantic response shapes
├── docs/
│   ├── system-overview.md         # Authoritative data contracts (DESIGN.md ref)
│   ├── architecture.md            # Current implementation snapshot
│   └── decisions/                 # ADRs
├── specs/use-cases/               # Intended product behavior
├── plans/                         # Implementation strategy before code
├── mcp/                           # External tool policy
├── evals/                         # Golden-example evaluations for LLM outputs
├── scripts/                       # Factory validation + helpers
└── .github/workflows/             # CI gates
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Zustand |
| Backend | FastAPI, Python, Pydantic |
| Transcription | OpenAI Whisper API |
| Extraction | OpenAI LLM (competencies from transcript) |
| Vision | OpenAI GPT-4o (credential OCR) |
| Storage | Supabase Storage (audio + images) |
| Database | Supabase PostgreSQL |
| Deployment | Vercel (web) + hosted FastAPI service |

## Quick Start

```bash
make test
make lint
make validate-factory
```

## The Factory Loop

1. Write a spec in [specs/use-cases/](specs/use-cases/).
2. Invoke `spec-to-plan` to produce a [plans/](plans/) document.
3. A teammate (not the author) reviews the plan.
4. Implement against the plan with tests.
5. `make test`, `make lint`, `make validate-factory` must pass locally.
6. Open the PR — `agentic-code-review` runs automatically.
7. Promote recurring lessons into [docs/](docs/), skills, rules, or tests.

## Roles

Four roles, summarized — full editing guide in [ROLES.md](ROLES.md):

| Role | Owner of |
|------|----------|
| **1 & 4. ML/AI Engineer** | LLM competency extraction, prompt engineering, FastAPI model serving |
| **2. CV + Data Pipeline Engineer** | Vision OCR for credential images, Whisper integration, TESDA readiness scoring |
| **3. Frontend Engineer** | Next.js app, voice/camera UI, competency cards, processing pipeline, profile view |

## References

- [AGENTS.md](AGENTS.md) — operating contract
- [DESIGN.md](DESIGN.md) — frontend contract (hackathon scope authority)
- [SDD.md](SDD.md) — system design (post-hackathon vision)
- [docs/system-overview.md](docs/system-overview.md) — data contracts
- [ROLES.md](ROLES.md) — what each role edits
- [mcp/policy.md](mcp/policy.md) — approved external tools
