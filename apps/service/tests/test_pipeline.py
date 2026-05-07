import pytest
from apps.service.pathways.scorer import PathwayScorer

@pytest.fixture
def pathway_scorer():
    return PathwayScorer()

def test_filipino_only_transcription_scoring(pathway_scorer):
    # Mocking extraction logic: "Gumagawa ako ng proteksyon gamit ang welding mask para iwas-aksidente."
    extracted_skills = ["proteksyon", "welding mask", "iwas-aksidente", "safety"]
    
    result = pathway_scorer.calculate_readiness(extracted_skills)
    assert result["readiness_score"] >= 0.10  # Standard safety score criteria matching
    assert "CORE-01" in result["missing_competencies"][0]["id"] or any(
        m["id"] == "COMMON-01" for m in result["missing_competencies"]
    ) == False

def test_english_only_transcription_scoring(pathway_scorer):
    # Mocking extraction logic: "I am experienced in welding carbon steel pipes and reading blueprint drawings."
    extracted_skills = ["welding carbon steel pipes", "blueprint drawings"]
    
    result = pathway_scorer.calculate_readiness(extracted_skills)
    assert "CORE-02" in result["confirmed_competency_ids"]
    assert "COMMON-02" in result["confirmed_competency_ids"]

def test_taglish_code_switching_scoring(pathway_scorer):
    # Mocking extraction logic: "Nagse-setup ako ng cutting equipment bago ako mag-weld ng plates."
    extracted_skills = ["setup ng cutting equipment", "weld ng plates"]
    
    result = pathway_scorer.calculate_readiness(extracted_skills)
    assert "CORE-01" in result["confirmed_competency_ids"]
    assert "COMMON-03" in result["confirmed_competency_ids"]