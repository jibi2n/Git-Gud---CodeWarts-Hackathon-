# PLAN — USE CASE 006 (Welding Modules Expansion)

Spec: `specs/use-cases/use-case-006-welding-modules.md`

## Goal

Add four modular, user-facing welding demo modules (Profile, Jobs, Advice, Chat) while preserving the existing voice demo flow and staying within repository policy (no frontend → external AI; no new external map provider).

## Constraints / Non-goals

- Do not modify critical system files (`AGENTS.md`, `DESIGN.md`, `SDD.md`, `mcp/policy.md`) unless unavoidable.
- No external map provider (Mapbox/Google) integration. Use an in-app “map surface” for markers.
- Keep OpenAI keys server-only; frontend uses local API routes.

## Implementation Strategy (High-level)

### A) Web app modules (Next.js)

1. Add a “Modules” hub page and routes:
   - `/modules` (hub)
   - `/welding/profile`
   - `/welding/jobs`
   - `/welding/advice`
   - `/welding/chat`

2. Add a new persisted Zustand store for welding profile and UI preferences.
   - Keep separate from existing `session-store`, `capture-store`, `profile-store`.

3. Implement synthetic job generator:
   - Input: user location (lat/lng) + fixed radius (50 miles)
   - Output: deterministic-ish random list (seeded) of job listings with coordinates
   - UI: an in-app “map” component (SVG/canvas/div) with markers + a job list panel.

4. Implement advice portal:
   - Static welding demo content: certifications (AWS/API/ASME), training programs, business ideas.
   - Search/filter UI for certifications and training entries.

5. Implement chat UI:
   - Conversation history persisted locally.
   - Calls `/api/chat` with messages + profile context.

### B) API endpoints (Next.js API routes)

- `/api/welding/profile`:
  - GET/POST: return/store profile in local demo mode (or pass-through when backend exists).
- `/api/welding/jobs`:
  - POST: generate jobs server-side (ensures consistent data and isolates logic).
- `/api/welding/advice`:
  - GET: return the welding demo advice dataset (searchable client-side).
- `/api/welding/chat`:
  - POST: proxy to ML service `/chat` when configured; otherwise return a safe demo response.

### C) Backend service (FastAPI)

1. Add `/chat` endpoint to `apps/service/main.py`.
2. Implement OpenAI call using the existing `openai` dependency.
3. Use a versioned prompt in `apps/service/prompts/` (no inline prompt strings).
4. Include safe fallback when `OPENAI_API_KEY` is missing (demo response).

## Files to Create / Modify

**Web**
- Create:
  - `apps/web/app/modules/page.tsx`
  - `apps/web/app/welding/profile/page.tsx`
  - `apps/web/app/welding/jobs/page.tsx`
  - `apps/web/app/welding/advice/page.tsx`
  - `apps/web/app/welding/chat/page.tsx`
  - `apps/web/app/api/welding/profile/route.ts`
  - `apps/web/app/api/welding/jobs/route.ts`
  - `apps/web/app/api/welding/advice/route.ts`
  - `apps/web/app/api/welding/chat/route.ts`
  - `apps/web/stores/welding-profile-store.ts`
  - `apps/web/lib/welding-demo-data.ts`
  - `apps/web/lib/welding-jobs.ts`
  - `apps/web/components/welding/WeldingMap.tsx`
  - `apps/web/components/welding/WeldingChat.tsx`

**Service**
- Modify:
  - `apps/service/main.py` (add `/chat` endpoint + models)
- Create:
  - `apps/service/prompts/chat_welding.md`
  - `apps/service/llm/openai_chat.py` (thin wrapper around OpenAI, reads prompt file)

## Sequencing

1. Implement web store + pages scaffolding, keep them navigable from `/modules`.
2. Implement jobs generator + map UI + `/api/welding/jobs`.
3. Implement advice portal + `/api/welding/advice`.
4. Implement chat UI + `/api/welding/chat` (demo fallback).
5. Implement FastAPI `/chat` + prompt + OpenAI wrapper.
6. Verify gates: web lint/typecheck/build; service pytest (existing tests + minimal new test for /chat demo path).

## Testing Strategy

- Web: `npm run lint`, `npm run typecheck`, `npm run build`.
- Service: `pytest` with a new test ensuring `/chat` returns a response in demo mode (no API key).

## Risks

- Map provider policy: mitigated by using an internal map surface with markers.
- Environment mismatches: mitigate by clear `.env` guidance and demo fallbacks for chat.

