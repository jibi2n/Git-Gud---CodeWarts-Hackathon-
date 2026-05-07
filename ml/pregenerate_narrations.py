"""
Pre-generate LLM case note narrations for the three demo children.
Produces data/precomputed_narrations.json.
Run: python ml/pregenerate_narrations.py  (requires OPENAI_API_KEY in env)
"""
import json
import os
from pathlib import Path
from datetime import datetime

from openai import OpenAI

SYSTEM_PROMPT = """You are writing a case note for a Filipino DSWD social worker (Municipal Link)
who manages 4Ps families. The note describes one child's current dropout risk situation.

Tone requirements:
- Dignified, never patronizing
- Factual, never alarmist
- Action-oriented, never fatalistic
- Written in English with natural Filipino case-work conventions
- 3 to 5 sentences, no longer

Content requirements:
- Lead with what's happening with this specific child (concrete, not statistical)
- Reference the data driving the concern, in plain language
- End with what the social worker should consider
- Never mention the model, AI, or "the system"
- Never use the words "verified" or "certified" — use "documented" or "observed"
- Never refer to the child's risk as a "label" or "flag" — use "current situation"

Output: A single paragraph. No headers. No markdown."""

DEMO_CHILDREN = [
    {
        "id": "child_demo_001",
        "prompt": """Write a case note for this child:

Name: Mark
Age: 14
Grade: Grade 8
Barangay: Barangay San Roque

Current dropout probability over 90 days: 73%

Top reasons:
- Attendance has dropped sharply in the last month (from 96% to 71%)
- The household reported a recent income loss (father lost construction work)
- An older sibling has previously left school (sister Cristine, 2024)

Write the case note now."""
    },
    {
        "id": "child_demo_002",
        "prompt": """Write a case note for this child:

Name: Sofia
Age: 11
Grade: Grade 5
Barangay: Barangay Magsaysay

Current dropout probability over 90 days: 58%

Top reasons:
- Academic performance is declining over the last quarter (84 to 71 average)
- The family relocated recently, disrupting school continuity (from Cavite, 4 months ago)
- The child is older than typical for their grade level

Write the case note now."""
    },
    {
        "id": "child_demo_003",
        "prompt": """Write a case note for this child:

Name: Joshua
Age: 16
Grade: Grade 10
Barangay: Barangay Cuyab

Current dropout probability over 90 days: 41%

Top reasons:
- Attendance is on a declining trajectory (subtle dip, 88% to 83%)
- The child is older than typical for their grade level (held back once)
- One failing subject this quarter

Write the case note now."""
    }
]

HAND_EDITED_NARRATIONS = {
    "child_demo_001": "Mark, age 14, has missed roughly one in three school days over the past month — a sharp departure from his usually consistent attendance. His household reported a recent income disruption tied to his father's loss of construction work, and his older sister Cristine left school in 2024 under similar pressures. Mark has not raised concerns to his teachers, but the pattern suggests he is beginning to take on family responsibilities that compete with school. A home visit within the next week would help understand whether emergency assistance and school re-engagement support could keep him enrolled this quarter.",
    "child_demo_002": "Sofia, age 11, has shown a marked academic decline this quarter, with two failing subjects and a six-point drop in average grade since the family relocated from Cavite four months ago. Her attendance remains strong, but the academic trend and adjustment context warrant attention before disengagement begins. She is one year over-age for Grade 5, which adds to the risk profile. Coordinating with her new school's guidance office and offering structured academic catch-up support over the next two weeks would address the most immediate drivers.",
    "child_demo_003": "Joshua, age 16, is showing early-stage drift signals: a modest dip in attendance, one failing subject, and missing assessments in two of four quarters this year. None of these alone would typically trigger concern, but together they reflect the pattern that historically precedes Grade 10 dropout. He is over-age for his grade level, having been held back once. A home visit in the next two weeks, paired with targeted academic support, can address these signals before they compound.",
}


def generate_with_llm(child, client):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=400,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": child["prompt"]},
        ],
    )
    return response.choices[0].message.content.strip()


def main():
    api_key = os.environ.get("OPENAI_API_KEY")
    ts = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

    output = {}
    for child in DEMO_CHILDREN:
        child_id = child["id"]

        if child_id in HAND_EDITED_NARRATIONS:
            text = HAND_EDITED_NARRATIONS[child_id]
            print(f"Using hand-edited narration for {child_id}")
        elif api_key:
            client = OpenAI(api_key=api_key)
            text = generate_with_llm(child, client)
            print(f"Generated live narration for {child_id}")
        else:
            print(f"No API key — using fallback for {child_id}")
            text = HAND_EDITED_NARRATIONS.get(child_id, "Case note pending.")

        output[child_id] = {
            "childId": child_id,
            "narrativeText": text,
            "generatedAt": ts,
            "source": "cached"
        }

    Path("data").mkdir(exist_ok=True)
    with open("data/precomputed_narrations.json", "w") as f:
        json.dump(output, f, indent=2)

    print(f"Saved {len(output)} narrations → data/precomputed_narrations.json")


if __name__ == "__main__":
    main()
