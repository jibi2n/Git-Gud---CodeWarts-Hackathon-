# PLAN — USE CASE 007 (LLM-Based Scoring)

Spec: `specs/use-cases/use-case-007-llm-scoring.md`

## Goal

Switch the ML service `/score` endpoint to use an LLM-generated readiness score and job suggestions when configured, with a deterministic fallback when not configured.

## Constraints

- Preserve the existing `/score` request and response models.
- Keep credentials server-side only.
- Prompts must be versioned and stored in `apps/service/prompts/` (no inline prompts).
- On LLM failure, fall back to `PathwayScorer.generate_score_report`.

## Implementation Steps

1. Add prompt file `apps/service/prompts/score_welding.md` instructing JSON-only output matching `ScoreResponse`.
2. Add a small OpenAI wrapper `apps/service/llm/openai_score.py`:
   - Loads prompt file.
   - Calls OpenAI Chat Completions with JSON output mode.
   - Returns a Python dict that can be validated by the existing Pydantic models.
3. Update `apps/service/main.py` `/score` handler:
   - If `OPENAI_API_KEY` exists, attempt LLM scoring.
   - If the call fails or response is invalid, fall back to `scorer_engine.generate_score_report`.
4. Add/extend tests:
   - Ensure `/score` works in demo mode (no API key) and returns the expected shape.

## Files

- Create:
  - `apps/service/prompts/score_welding.md`
  - `apps/service/llm/openai_score.py`
  - `apps/service/tests/test_score.py`
- Modify:
  - `apps/service/main.py`

## Verification

- Run: `python -m pytest -q` in `apps/service`.

