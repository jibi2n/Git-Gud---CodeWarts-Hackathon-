# Use Case 002 — Competency Extraction with Human Review

**Owners:** Role 1 & 4 (ML/AI) + Role 3 (UI)
**Status:** Draft
**Plan:** [plans/PLAN_USE_CASE_002.md](../../plans/PLAN_USE_CASE_002.md) *(to be written)*

## User Story

As a user who has just spoken her story, I want to see the competencies the system recognized, in language I can actually use, with the ability to confirm, reject, edit, or add competencies before they become my profile.

## User Flow

1. The user accepts a transcript (UC-001 done).
2. The backend extracts competencies via `POST /extract` using XLM-RoBERTa for Taglish competency identification, plus an LLM-assisted formal-vocabulary rephrasing pass.
3. Each competency carries an `evidenceSpan` pointing back to a quote in the transcript and a `confidence` score.
4. The frontend `<CompetencyEditor>` shows each competency as a card. The user can confirm, reject, edit the label (Taglish + English), or add a competency manually.
5. AI-extracted competencies carry a visible **"Nahanap ng AI — pakitingnan"** label until the user confirms them. Only confirmed competencies feed UC-003 and the PDF export.

## Acceptance Criteria

- [ ] At least three competencies extracted from a typical Taglish onboarding story.
- [ ] No inflated competency names (e.g., a sari-sari operator is not labeled "CFO").
- [ ] Each competency includes `evidenceSpan` traceable to the transcript.
- [ ] Each competency includes a `confidence` score in [0, 1].
- [ ] Golden evals in [evals/](../../evals/) cover at least one Taglish sample (hackathon scope per DESIGN.md §1.2). Filipino-only and English-only samples are tracked as post-hackathon.
- [ ] LLM rephrasing prompt lives in [apps/service/prompts/](../../apps/service/prompts/), never inlined.

## Out of Scope (Hackathon)

- Cross-language competency extraction (Filipino-only, English-only) — Taglish only for hackathon.
- Vector-based dedup across sessions.

## Open Questions

- What is the threshold for "implied" vs. "inferred" competency, and how do we surface that distinction to the user?
