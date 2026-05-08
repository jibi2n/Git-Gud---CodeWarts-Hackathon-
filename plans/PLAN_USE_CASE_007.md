# PLAN_USE_CASE_007 — Nearby Job Map (2km)

Spec: [specs/use-cases/use-case-007-job-map.md](../specs/use-cases/use-case-007-job-map.md)

## Goal

Show a “Nearby jobs” section on Profile after processing that can render a map and a list of job links within 2km of the user.

## Constraints

- No new jobs API integrations in hackathon scope; use existing job suggestions as the seed.
- Location is requested via browser permission and is not persisted to backend.
- Map provider should be optional; fall back to list-only if missing.

## Files to Change

- apps/web/app/profile/[sessionId]/page.tsx
- apps/web/locales/tl.ts
- mcp/policy.md

## Implementation Strategy

1. Add UI copy for the map section (title, CTA, permission denied text).
2. In the Profile page:
   - Add a “Use my location” CTA to request `navigator.geolocation`.
   - Create derived “nearby job pins” within 2km based on existing `jobSuggestions`.
   - Render a static map image when `NEXT_PUBLIC_MAPBOX_TOKEN` exists; otherwise, render list-only.
   - Ensure each job pin/link opens a job listing search online.
3. Update `mcp/policy.md` to explicitly allow the map domain used by the frontend.

## Validation

- Typecheck/diagnostics for TypeScript errors.
- Manual verify:
  - Location allowed: map + list renders
  - Location denied: fallback message + list still usable
  - Map token missing: list-only fallback
