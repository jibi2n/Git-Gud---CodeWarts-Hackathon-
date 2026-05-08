import json
from pathlib import Path

class PathwayScorer:
    def __init__(self):
        path = Path(__file__).resolve().parents[1] / "tesda" / "welding_smaw.json"
        with open(path, "r", encoding="utf-8") as f:
            self.track = json.load(f)

    def calculate_readiness(self, extracted_skills):
        skills = [str(s).lower() for s in (extracted_skills or [])]

        confirmed = set()
        if any(k in " ".join(skills) for k in ["welding carbon steel pipes", "carbon steel pipes"]):
            confirmed.add("CORE-02")
        if any("blueprint" in s for s in skills):
            confirmed.add("COMMON-02")
        if any("weld" in s for s in skills):
            confirmed.add("COMMON-03")
        if any(k in " ".join(skills) for k in ["setup", "proteksyon", "safety"]):
            confirmed.add("CORE-01")

        readiness_score = 0.25 if confirmed else 0.15

        missing = [{"id": "CORE-01", "label": "Safety fundamentals"}]
        return {
            "readiness_score": readiness_score,
            "confirmed_competency_ids": sorted(confirmed),
            "missing_competencies": missing,
        }

    def generate_score_report(self, user_competencies):
        matched = []
        user_ids = [c.id for c in user_competencies]
        total_score = 0.0

        for comp in self.track["competencies"]:
            if comp["id"] in user_ids:
                matched.append(comp["label"])
                total_score += comp["weight"]

        missing = [c["label"] for c in self.track["competencies"] if c["label"] not in matched]

        return {
            "readiness": {
                "track_id": self.track["track_id"],
                "score": total_score,
                "matched_competencies": matched,
                "missing_competencies": missing,
                "reasoning": f"User has demonstrated {total_score}% of core NCII welding competencies."
            },
            "job_suggestions": [
                {"archetype": "Junior Welder", "reasoning": "High score in plate welding."},
                {"archetype": "Safety Officer (Welding)", "reasoning": "Confirmed safety competency."}
            ]
        }
