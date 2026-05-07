import json
import os

class PathwayScorer:
    def __init__(self):
        # Load the decided hackathon track
        path = "apps/service/tesda/welding_smaw.json"
        with open(path, 'r') as f:
            self.track = json.load(f)

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
