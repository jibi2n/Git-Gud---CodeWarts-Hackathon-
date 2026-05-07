from fastapi.testclient import TestClient

from apps.service.main import app


def test_chat_demo_mode(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    client = TestClient(app)
    r = client.post(
        "/chat",
        json={
            "messages": [{"role": "user", "content": "What cert for pipeline welding?"}],
            "profile": {"skills": ["SMAW"], "specializations": ["Pipeline"]},
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert "reply" in data
    assert isinstance(data["reply"], str)
    assert len(data["reply"]) > 0

