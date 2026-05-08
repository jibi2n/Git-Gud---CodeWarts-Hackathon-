from __future__ import annotations

import json
from pathlib import Path

from openai import OpenAI


PROMPTS_DIR = Path(__file__).resolve().parents[1] / "prompts"


def load_prompt(name: str) -> str:
    return (PROMPTS_DIR / name).read_text(encoding="utf-8")


def score_welding(*, api_key: str, competencies: list[dict]) -> dict:
    system_prompt = load_prompt("score_welding.md")

    client = OpenAI(api_key=api_key)
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": json.dumps({"competencies": competencies}, ensure_ascii=False),
            },
        ],
        temperature=0.3,
        max_tokens=500,
    )

    content = (resp.choices[0].message.content or "").strip()
    return json.loads(content)

