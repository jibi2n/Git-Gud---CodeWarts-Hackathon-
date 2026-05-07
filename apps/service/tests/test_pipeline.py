import pytest
from types import SimpleNamespace

from apps.service.pathways.scorer import PathwayScorer

@pytest.fixture
def pathway_scorer():
    return PathwayScorer()

def _c(cid: str):
    return SimpleNamespace(id=cid)


def test_score_report_matches_known_competencies(pathway_scorer):
    report = pathway_scorer.generate_score_report([_c("w-01"), _c("w-02")])
    assert report["readiness"]["track_id"] == "welding-smaw-nc2"
    assert report["readiness"]["score"] == 60.0
    assert "Weld Carbon Steel Plates" in report["readiness"]["matched_competencies"]
    assert "Apply Safety Practices" in report["readiness"]["matched_competencies"]
    assert len(report["job_suggestions"]) >= 1


def test_score_report_missing_when_no_inputs(pathway_scorer):
    report = pathway_scorer.generate_score_report([])
    assert report["readiness"]["score"] == 0.0
    assert len(report["readiness"]["missing_competencies"]) == 4
