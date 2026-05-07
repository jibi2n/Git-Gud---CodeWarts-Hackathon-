# Use Case 004 — TESDA Readiness Score (Single Track)

**Owners:** Role 2 (model) + Role 3 (UI)
**Status:** Draft
**Plan:** [plans/PLAN_USE_CASE_004.md](../../plans/PLAN_USE_CASE_004.md) *(to be written)*

> **Hackathon scope** per [DESIGN.md](../../DESIGN.md) §1.2: one TESDA track only. The track is decided Day 1 (DESIGN.md §16, Q1).

## User Story

As a user considering the configured TESDA track, I want an honest readiness score and a list of matched / missing competencies so I can decide whether to pursue the certification.

## User Flow

1. After the user confirms competencies (UC-002), the frontend calls `POST /score` with the final competency list (UC-003 wraps this).
2. The backend returns a `ReadinessScore` containing `score` (0–100), `matchedCompetencies`, `missingCompetencies`, and a short `reasoning`.
3. The UI renders this in `<ReadinessScoreCard>` with strengths and "areas to develop."
4. A visible disclaimer notes that the estimate is a guide, not a guarantee.

## Acceptance Criteria

- [ ] `POST /score` returns a `ReadinessScore` with `score`, `matched`, `missing`, and `reasoning` fields.
- [ ] At least one strength and one area-to-develop are listed when both are non-empty.
- [ ] Disclaimer is visible, not buried.
- [ ] Score algorithm is rule-based and inspectable in [apps/service/pathways/](../../apps/service/pathways/).
- [ ] TESDA competency taxonomy lives in [apps/service/tesda/](../../apps/service/tesda/) as JSON, sourced from publicly available TESDA Training Regulations.

## Out of Scope (Hackathon)

- Multi-track readiness scoring (DESIGN.md non-goal).
- Learned-model passing-rate predictions (post-pilot).
- Personalized prep recommendations.

## Open Questions

- Below what `matched` count should we refuse to produce a score (vs. produce one that misleads)?
- Do we surface the missing competencies as "next steps" links, or only as text?
