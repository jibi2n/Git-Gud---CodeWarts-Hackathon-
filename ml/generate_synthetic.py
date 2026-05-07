"""
Generate synthetic 4Ps family caseload data for San Pedro, Laguna.
Produces data/synthetic_caseload.json with 247 children.
Run: python ml/generate_synthetic.py
"""
import json
import random
from pathlib import Path

random.seed(42)

FIRST_NAMES = [
    "Maria", "Juan", "Andrea", "Miguel", "Princess", "Aira", "Kim", "Justin",
    "Nicole", "Carlo", "Rhea", "Patrick", "Ella", "Christian", "Erika", "Ralph",
    "Ana", "Jose", "Ramon", "Elena", "Benita", "Fernando", "Rosario", "Gloria",
    "Antonio", "Emma", "Luis", "Diana", "Cynthia", "Albert"
]
LAST_NAMES = [
    "Santos", "Garcia", "Torres", "Mendoza", "Castillo", "Ramos", "Gonzales",
    "Bautista", "Villanueva", "Pascual", "Domingo", "Dizon", "Flores", "Herrera",
    "Aguilar", "Perez", "Fernandez", "Rivera", "Robles", "Salazar", "Soriano",
    "Galang", "Hidalgo", "Navarro", "Abad", "Austria", "Del Rosario", "Ocampo",
    "Bernardo", "Manalo"
]
BARANGAYS = [
    "Barangay San Roque", "Barangay Magsaysay", "Barangay Cuyab", "Barangay Langgam",
    "Barangay Cabilang Baybay", "Barangay Nueva", "Barangay Sampaguita", "Barangay San Vicente"
]
GUARDIAN_PREFIXES = ["Nanay", "Tatay", "Lola", "Kuya"]

GRADE_FOR_AGE = {
    6: "Grade 1", 7: "Grade 2", 8: "Grade 3", 9: "Grade 4", 10: "Grade 5",
    11: "Grade 6", 12: "Grade 7", 13: "Grade 8", 14: "Grade 9", 15: "Grade 10",
    16: "Grade 11", 17: "Grade 12"
}


def school_for_age(age, idx):
    if age <= 11:
        return ["San Pedro Elementary School", "Sampaguita Elementary School", "San Pedro Central School"][idx % 3]
    return ["San Pedro National High School", "Cuyab National High School"][idx % 2]


def generate_low_risk_child(i, ni):
    fn = FIRST_NAMES[ni % len(FIRST_NAMES)]
    ln = LAST_NAMES[ni % len(LAST_NAMES)]
    age = 6 + (ni % 12)
    barangay = BARANGAYS[ni % len(BARANGAYS)]
    school = school_for_age(age, ni)
    guardian_prefix = GUARDIAN_PREFIXES[ni % len(GUARDIAN_PREFIXES)]

    att30 = round(0.88 + (ni % 10) * 0.009, 3)
    att90 = round(att30 + 0.02, 3)
    trend = round(((ni % 5) - 2) * 0.01, 3)

    return {
        "id": f"child_{i:04d}",
        "firstName": fn,
        "lastName": ln,
        "age": age,
        "gradeLevel": GRADE_FOR_AGE[age],
        "schoolName": school,
        "fpsHouseholdId": f"4PS-LAG-{i:05d}",
        "barangay": barangay,
        "guardianName": f"{guardian_prefix} {ln}",
        "features": {
            "attendanceRate30d": att30,
            "attendanceRate90d": att90,
            "attendanceTrend": trend,
            "averageGrade": 80.0 + (ni % 15),
            "gradeTrend": round(((ni % 5) - 2) * 0.3, 2),
            "failingSubjects": 0,
            "householdIncomeShock": False,
            "parentEmploymentChange": False,
            "householdSize": 3 + (ni % 5),
            "numberOfSiblings": ni % 4,
            "hasOlderSiblingDropout": False,
            "ageGradeMismatch": 0,
            "distanceToSchoolKm": round(0.5 + (ni % 30) * 0.1, 1),
            "recentRelocation": False,
            "monthsIn4Ps": 12 + (ni % 11) * 10,
            "recentComplianceWarnings": 0,
        }
    }


DEMO_CHILDREN = [
    {
        "id": "child_demo_001",
        "firstName": "Mark",
        "lastName": "Aquino",
        "age": 14,
        "gradeLevel": "Grade 8",
        "schoolName": "San Pedro National High School",
        "fpsHouseholdId": "4PS-LAG-00247",
        "barangay": "Barangay San Roque",
        "guardianName": "Rosario Aquino",
        "features": {
            "attendanceRate30d": 0.71, "attendanceRate90d": 0.87,
            "attendanceTrend": -0.25, "averageGrade": 78.0, "gradeTrend": -2.5,
            "failingSubjects": 1, "householdIncomeShock": True,
            "parentEmploymentChange": True, "householdSize": 6,
            "numberOfSiblings": 4, "hasOlderSiblingDropout": True,
            "ageGradeMismatch": 0, "distanceToSchoolKm": 2.1,
            "recentRelocation": False, "monthsIn4Ps": 84, "recentComplianceWarnings": 1
        }
    },
    {
        "id": "child_demo_002",
        "firstName": "Sofia",
        "lastName": "Reyes",
        "age": 11,
        "gradeLevel": "Grade 5",
        "schoolName": "San Pedro Elementary School",
        "fpsHouseholdId": "4PS-LAG-00118",
        "barangay": "Barangay Magsaysay",
        "guardianName": "Linda Reyes",
        "features": {
            "attendanceRate30d": 0.89, "attendanceRate90d": 0.92,
            "attendanceTrend": -0.05, "averageGrade": 71.0, "gradeTrend": -6.0,
            "failingSubjects": 2, "householdIncomeShock": False,
            "parentEmploymentChange": False, "householdSize": 5,
            "numberOfSiblings": 2, "hasOlderSiblingDropout": False,
            "ageGradeMismatch": 1, "distanceToSchoolKm": 0.8,
            "recentRelocation": True, "monthsIn4Ps": 36, "recentComplianceWarnings": 0
        }
    },
    {
        "id": "child_demo_003",
        "firstName": "Joshua",
        "lastName": "dela Cruz",
        "age": 16,
        "gradeLevel": "Grade 10",
        "schoolName": "San Pedro National High School",
        "fpsHouseholdId": "4PS-LAG-00072",
        "barangay": "Barangay Cuyab",
        "guardianName": "Pedro dela Cruz",
        "features": {
            "attendanceRate30d": 0.83, "attendanceRate90d": 0.88,
            "attendanceTrend": -0.08, "averageGrade": 76.0, "gradeTrend": -1.5,
            "failingSubjects": 1, "householdIncomeShock": False,
            "parentEmploymentChange": False, "householdSize": 4,
            "numberOfSiblings": 1, "hasOlderSiblingDropout": False,
            "ageGradeMismatch": 1, "distanceToSchoolKm": 3.4,
            "recentRelocation": False, "monthsIn4Ps": 72, "recentComplianceWarnings": 0
        }
    }
]


def main():
    low_risk_children = [generate_low_risk_child(i, ni) for ni, i in enumerate(range(13, 248))]

    output = {
        "metadata": {
            "cluster": "San Pedro, Laguna",
            "socialWorkerName": "Marivic Santos",
            "socialWorkerRole": "Municipal Link",
            "totalFamilies": 247,
            "totalFlagged": 12,
            "generatedAt": "2026-05-07T08:00:00Z",
            "dataType": "synthetic",
            "note": "Synthetic data. Not real DSWD records."
        },
        "flaggedChildren": DEMO_CHILDREN,
        "allChildren": DEMO_CHILDREN + low_risk_children[:235]
    }

    out_path = Path("data/synthetic_caseload.json")
    out_path.parent.mkdir(exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"Generated {len(output['allChildren'])} children → {out_path}")


if __name__ == "__main__":
    main()
