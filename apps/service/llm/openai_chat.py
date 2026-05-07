from __future__ import annotations

from pathlib import Path
from typing import Any

from openai import OpenAI


PROMPTS_DIR = Path(__file__).resolve().parents[1] / "prompts"


def load_prompt(name: str) -> str:
    path = PROMPTS_DIR / name
    return path.read_text(encoding="utf-8")


def chat_welding(
    *,
    api_key: str,
    messages: list[dict[str, str]],
    profile_context: dict[str, Any] | None,
) -> str:
    system_prompt = load_prompt("chat_welding.md")

    context_lines: list[str] = []
    if profile_context:
        skills = profile_context.get("skills")
        specs = profile_context.get("specializations")
        location = profile_context.get("location_label")
        if isinstance(location, str) and location.strip():
            context_lines.append(f"Location: {location.strip()}")
        if isinstance(skills, list):
            safe_skills = [str(s).strip() for s in skills if str(s).strip()]
            if safe_skills:
                context_lines.append("Skills: " + ", ".join(safe_skills[:20]))
        if isinstance(specs, list):
            safe_specs = [str(s).strip() for s in specs if str(s).strip()]
            if safe_specs:
                context_lines.append("Specializations: " + ", ".join(safe_specs[:20]))

    system = system_prompt
    if context_lines:
        system = system_prompt + "\n\nUser profile context:\n" + "\n".join(context_lines)

    client = OpenAI(api_key=api_key)
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": system}, *messages],
        temperature=0.4,
        max_tokens=400,
    )

    return (resp.choices[0].message.content or "").strip()

