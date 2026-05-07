## PLAN_USE_CASE_002 — Competency Extraction with Human Review

Spec: `specs/use-cases/use-case-002-skill-recognition.md`

### Goal
- Implement `POST /extract` so a Taglish transcript produces TESDA-aligned competency IDs with `confidence` and `evidence_span`.

### Scope (hackathon)
- Single TESDA track: `apps/service/tesda/welding_smaw.json`
- XLM-RoBERTa similarity matching from transcript segments to catalog labels
- Fallback keyword matcher when transformers are disabled/unavailable

### Files
- Update:
  - `apps/service/extraction/extractor_service.py`
  - `apps/service/main.py`
  - `apps/service/pathways/scorer.py`
- Add:
  - `apps/service/tests/conftest.py`
  - `apps/service/tests/test_extract.py`

### Testing
- `python -m pytest -q` from repo root
- Validate `/extract` returns `w-01..w-04` when the transcript mentions welding, safety/PPE, drawings, and material prep
