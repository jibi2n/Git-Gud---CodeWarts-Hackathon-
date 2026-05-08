# Use Case 007 — Nearby Job Map (2km)

**Owners:** Role 3 (UI) + Role 2 (jobs data)
**Status:** Draft
**Plan:** [plans/PLAN_USE_CASE_007.md](../../plans/PLAN_USE_CASE_007.md)

## User Story

As a user, I want to see job opportunities on a map within 2km of my current location so I can quickly find nearby work options after my session is processed.

## User Flow

1. After processing completes and the user lands on the Profile page, the UI asks for location permission.
2. If permission is granted, the UI shows a map centered on the user and pins for job opportunities within 2km.
3. The user can tap a job to open the job listing online.
4. If permission is denied or unavailable, the UI falls back to a non-map list of job suggestions with links.

## Acceptance Criteria

- [ ] Map section appears on Profile after processing.
- [ ] Location permission is requested only when the user triggers it (explicit action).
- [ ] Only jobs within 2km are shown on the map/list.
- [ ] Each job opens an online job listing page when tapped.
- [ ] Feature works without breaking the rest of the flow when map provider is not configured.

## Out of Scope (Hackathon)

- Real-time job aggregation from a third-party jobs API.
- Employer verification or anti-exploitation vetting.
- Storing user location on the backend.

## Open Questions

- Which map provider do we standardize on (Mapbox vs Google Maps)?
- What is the canonical jobs dataset/source for the MVP (seeded data vs curated partners vs scraping)?
