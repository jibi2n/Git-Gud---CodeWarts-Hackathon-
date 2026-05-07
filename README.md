# Boses

> Oral-to-digital competency bridge for Filipino informal-sector workers.

Boses ("voice" in Filipino) turns spoken Taglish stories into recognized competencies, a single-track TESDA readiness score, and job archetype suggestions, with a clean PDF profile the user can take to interviews.

This repository follows a **Software Factory** model. Specs come before plans, plans come before code, and every PR passes through an agentic review loop. See [AGENTS.md](AGENTS.md) for the operating contract.

> **Scope:** [DESIGN.md](DESIGN.md) §1.2 sets the hackathon scope. [SDD.md](SDD.md) describes the wider post-hackathon vision. When the two conflict, DESIGN.md wins for hackathon work.

## Repository Layout

```
.
├── AGENTS.md                      # Operating contract for humans + agents
├── SDD.md                         # System Design Document (post-hackathon vision)
├── DESIGN.md                      # Frontend contract (hackathon scope authority)
├── ROLES.md                       # Per-role editing guide (who edits what)
├── .agents/skills/                # Reusable agent workflows
├── .cursor/rules/                 # Cursor-compatible rule examples
├── apps/
│   ├── service/                   # FastAPI ML service (Python)
│   └── web/                       # Next.js 14 frontend (TypeScript)
├── docs/
│   ├── system-overview.md         # Authoritative data contracts (DESIGN.md ref)
│   ├── architecture.md            # Current implementation snapshot
│   └── decisions/                 # ADRs
├── specs/use-cases/               # Intended product behavior
├── plans/                         # Implementation strategy before code
├── mcp/                           # External tool policy
├── evals/                         # Golden-example evaluations for LLM code
├── scripts/                       # Factory validation + helpers
└── .github/workflows/             # CI gates
```

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
| **1 & 4. ML/AI Engineer** | Taglish competency extraction (XLM-RoBERTa), LLM prompt engineering, FastAPI model serving |
| **2. CV + Data Pipeline Engineer** | Vision OCR for informal credentials, Whisper integration, single-track TESDA readiness scoring |
| **3. Frontend Engineer** | Next.js app, voice / camera UI, profile editor, PDF export, demo flow |

## References

- [AGENTS.md](AGENTS.md) — operating contract
- [DESIGN.md](DESIGN.md) — frontend contract (hackathon scope authority)
- [SDD.md](SDD.md) — system design (post-hackathon vision)
- [docs/system-overview.md](docs/system-overview.md) — data contracts
- [ROLES.md](ROLES.md) — what each role edits
- [mcp/policy.md](mcp/policy.md) — approved external tools
