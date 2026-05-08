# MCP / External Tool Policy

This document is the **closed allowlist** of external services that Boses may call. Any code path that calls a domain not listed here is a policy violation and must be flagged by the agentic reviewer.

Adding a new tool requires a use case spec, an implementation plan, an entry in this file, and approval from the governance lead. See [AGENTS.md](../AGENTS.md) §9.

## Approved Services (Hackathon)

| Service | Purpose | Data sent | Permissions | Fallback on failure |
|---|---|---|---|---|
| **OpenAI Whisper API** | Voice transcription | Audio file (≤24h retained), language hint | API key, transcribe only | Surface "Hindi ka naintindihan ng Boses" + re-record (DESIGN.md §7.1) |
| **OpenAI API** *(or)* **Anthropic API** | LLM for formal-vocabulary rephrasing on extracted competencies | Transcript text only — never raw audio, never PII beyond what is in the transcript | API key, completions/messages only | Cached prompts → degrade to rule-based rephrasing |
| **HuggingFace Inference / model hub** | XLM-RoBERTa for Taglish competency extraction | Transcript text | Read-only model download / inference token | Fall back to LLM-based extraction |
| **Vision OCR provider** *(decide Day 1: OpenAI Vision or Google Cloud Vision)* | OCR of informal credential photos | Image bytes; deleted after extraction | API key, OCR only | Skip that document, log it, continue (DESIGN.md §7.1) |
| **Mapbox Static Images API** *(optional)* | Map image for nearby job pins | Approx user lat/lng + map viewport derived from location | Public token (client-side) | Fall back to list-only job links |
| **Google Maps (web)** *(links only)* | Open directions/job locations in browser | User lat/lng in URL when user taps a link | No API key | Show text-only job links |
| **Supabase** | Object storage (audio, images), Postgres (sessions, profiles, competencies) | All user data per consent flow | Anon key for client uploads to scoped buckets; service role key server-side only | N/A — required dependency |

## Forbidden by default

- Any analytics or telemetry SaaS that ingests user content (DESIGN.md §11.3 — no GA / PostHog / Mixpanel on the demo build).
- Any model-training endpoint — user data is **never** used to train external models.
- Any service that does not offer a documented data-deletion API.
- Any frontend → external-AI direct call. All AI traffic flows through the FastAPI service via Next.js API routes.
- Any third-party script outside Supabase and the FastAPI service (CSP-enforced per DESIGN.md §11.3).

## Data Flow Constraints

- **Raw audio**: only ever leaves the backend en route to Whisper. Deleted within 24h. Never sent to the LLM provider.
- **Transcript**: may be sent to the LLM provider. Never sent to the vision provider.
- **Image bytes**: deleted after OCR. Never sent to Whisper or the LLM.
- **PII**: minimized at every boundary. Phone number is a session key only — it does not leave the backend.

## Post-Hackathon (referenced from SDD.md, not in scope)

The following services are part of the wider SDD.md vision but are **not** approved for hackathon:

- Mapbox / Google Maps — job map is a non-goal (DESIGN.md §1.2). Add to this allowlist before Phase 2 work begins.

## Review Cadence

This policy is reviewed at the end of each phase (see [SDD.md](../SDD.md) §9 roadmap). The governance lead is accountable for keeping it current.
