from fastapi.testclient import TestClient

from apps.service.main import app


def test_score_fallback_without_openai(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    client = TestClient(app)
    r = client.post(
        "/score",
        json={"session_id": "ses_test", "competencies": []},
    )
    assert r.status_code == 200
    data = r.json()
    assert "readiness" in data
    assert "job_suggestions" in data
    assert "score" in data["readiness"]

