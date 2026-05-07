# Use Case 003 — TESDA Readiness + Job Suggestions

**Owners:** Role 2 (scoring + suggestions logic) + Role 3 (UI)
**Status:** Draft
**Plan:** [plans/PLAN_USE_CASE_003.md](../../plans/PLAN_USE_CASE_003.md) *(to be written)*

> **Hackathon scope** per [DESIGN.md](../../DESIGN.md) §1.2: one TESDA track only, no company map, no pin-based job browser. The wider three-pathway scope (TESDA + Jobs + Businesses) in [SDD.md](../../SDD.md) §4.3 is **post-hackathon**.

## User Story

As a user with a confirmed competency profile, I want to see how ready I am for one TESDA certification, plus job archetypes I plausibly qualify for, so I have a concrete next step.

## User Flow

1. After the user confirms competencies (UC-002 done), the frontend posts the final competency list to `POST /score`.
2. The backend returns a `ReadinessScore` for the configured TESDA track (matched competencies, missing competencies, score 0–100) and a list of `JobSuggestion` archetypes with reasoning.
3. The UI renders a `<ReadinessScoreCard>` and 2–4 `<JobSuggestionCard>` items.
4. The user may proceed to PDF export.

## Acceptance Criteria

- [ ] `POST /score` returns a readiness score, a list of matched competencies, and a list of missing competencies for the configured TESDA track.
- [ ] At least 2 job archetypes are returned with at least one reasoning sentence each.
- [ ] The score and reasoning are derived from the user's confirmed competency list, not the raw transcript.
- [ ] Only **user-confirmed** competencies are sent to `/score` and included in the PDF.
- [ ] Score algorithm is rule-based and inspectable in [apps/service/pathways/](../../apps/service/pathways/).

## Out of Scope (Hackathon)

- Job map / company pins (DESIGN.md non-goal).
- Multiple TESDA tracks (one only for hackathon).
- Business-idea recommendations (post-hackathon).

## Open Questions

- Which TESDA track? Resolved in [DESIGN.md](../../DESIGN.md) §16, Q1 — needs Day-1 team decision.
- What is the minimum competency match count below which we should refuse to produce a score (rather than mislead the user)?
