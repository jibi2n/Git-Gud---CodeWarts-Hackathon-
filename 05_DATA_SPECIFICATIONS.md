# 05 — Data Specifications

Detailed specifications for all data files and ML pipeline components.

---

## 1. Synthetic Caseload Generator

`ml/generate_synthetic.py` produces `data/synthetic_caseload.json`.

### Specifications

- **Total children:** 247
- **Cluster:** "San Pedro, Laguna" (single cluster for entire dataset)
- **Social worker:** Marivic Santos
- **Distribution:** 8 barangays in San Pedro

### Risk Distribution Targets

| Tier | Count | Probability Range |
|---|---|---|
| Low | 173 (70%) | 0.00–0.30 |
| Moderate | 44 (18%) | 0.30–0.50 |
| High | 20 (8%) | 0.50–0.65 |
| Critical | 10 (4%) | 0.65–1.00 |

### Demographic Distribution

- **Age:** 6–17, weighted slightly toward 10–14 (peak dropout ages)
- **Gender:** approximately balanced
- **Grade levels:** Grade 1 through Grade 12
- **Months in 4Ps:** uniformly distributed 6–120 months

### Realistic Co-occurrence Rules

When generating, enforce these patterns to ensure the synthetic data reflects documented Philippine dropout dynamics:

- Children with `householdIncomeShock=true` should have `attendanceRate30d` reduced by 10–25% relative to baseline
- Children with `hasOlderSiblingDropout=true` should have ~2x baseline dropout probability
- Children with `recentRelocation=true` should show `gradeTrend < -2` more often
- Children aged 14+ should have higher baseline dropout probability than younger children
- Children with `failingSubjects >= 3` should rarely have `riskTier='low'`

### Filipino Naming

Use realistic Filipino first names appropriate to the age range. Keep names simple and recognizable. Do not use real children's names. Do not reference public figures.

Example first names to draw from: Mark, Sofia, Joshua, Maria, Juan, Andrea, Miguel, Princess, John Lloyd, Aira, Kim, Justin, Nicole, Carlo, Rhea, Patrick, Ella, Christian, Erika, Ralph.

Surnames: use common Filipino surnames like Santos, Reyes, Cruz, Garcia, Torres, Aquino, dela Cruz, Mendoza, Castillo, Ramos, Gonzales, Bautista, Villanueva, Pascual, Domingo.

### The Three Demo Children (Hand-Tuned)

These three children must exist with these exact specifications for demo reliability:

#### `child_demo_001` — Mark Aquino

```json
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
    "attendanceRate30d": 0.71,
    "attendanceRate90d": 0.87,
    "attendanceTrend": -0.25,
    "averageGrade": 78.0,
    "gradeTrend": -2.5,
    "failingSubjects": 1,
    "householdIncomeShock": true,
    "parentEmploymentChange": true,
    "householdSize": 6,
    "numberOfSiblings": 4,
    "hasOlderSiblingDropout": true,
    "ageGradeMismatch": 0,
    "distanceToSchoolKm": 2.1,
    "recentRelocation": false,
    "monthsIn4Ps": 84,
    "recentComplianceWarnings": 1
  }
}
```

Pre-computed prediction: probability 0.73, riskTier "critical".

#### `child_demo_002` — Sofia Reyes

```json
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
    "attendanceRate30d": 0.89,
    "attendanceRate90d": 0.92,
    "attendanceTrend": -0.05,
    "averageGrade": 71.0,
    "gradeTrend": -6.0,
    "failingSubjects": 2,
    "householdIncomeShock": false,
    "parentEmploymentChange": false,
    "householdSize": 5,
    "numberOfSiblings": 2,
    "hasOlderSiblingDropout": false,
    "ageGradeMismatch": 1,
    "distanceToSchoolKm": 0.8,
    "recentRelocation": true,
    "monthsIn4Ps": 36,
    "recentComplianceWarnings": 0
  }
}
```

Pre-computed prediction: probability 0.58, riskTier "high".

#### `child_demo_003` — Joshua de la Cruz

```json
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
    "attendanceRate30d": 0.83,
    "attendanceRate90d": 0.88,
    "attendanceTrend": -0.08,
    "averageGrade": 76.0,
    "gradeTrend": -1.5,
    "failingSubjects": 1,
    "householdIncomeShock": false,
    "parentEmploymentChange": false,
    "householdSize": 4,
    "numberOfSiblings": 1,
    "hasOlderSiblingDropout": false,
    "ageGradeMismatch": 1,
    "distanceToSchoolKm": 3.4,
    "recentRelocation": false,
    "monthsIn4Ps": 72,
    "recentComplianceWarnings": 0
  }
}
```

Pre-computed prediction: probability 0.41, riskTier "moderate".

---

## 2. Pre-Computed Predictions

`data/precomputed_predictions.json` contains a prediction object for every child in the caseload.

### Schema

```json
{
  "child_demo_001": {
    "childId": "child_demo_001",
    "dropoutProbability90d": 0.73,
    "riskTier": "critical",
    "topRiskDrivers": [
      {
        "feature": "attendanceRate30d",
        "humanLabel": "Attendance has dropped sharply in the last month",
        "shapValue": 0.18,
        "contributionDirection": "increases"
      },
      {
        "feature": "householdIncomeShock",
        "humanLabel": "The household reported a recent income loss",
        "shapValue": 0.15,
        "contributionDirection": "increases"
      },
      {
        "feature": "hasOlderSiblingDropout",
        "humanLabel": "An older sibling has previously left school",
        "shapValue": 0.11,
        "contributionDirection": "increases"
      }
    ],
    "confidence": 0.82,
    "generatedAt": "2026-05-07T08:00:00Z"
  }
}
```

For non-demo children, generate predictions automatically from the trained model with realistic SHAP values.

---

## 3. Pre-Cached Narrations

`data/precomputed_narrations.json` contains hand-tuned LLM narrations for the three demo children.

### Mark Aquino — Pre-Cached Narration

> Mark, age 14, has missed roughly one in three school days over the past month — a sharp departure from his usually consistent attendance. His household reported a recent income disruption tied to his father's loss of construction work, and his older sister Cristine left school in 2024 under similar pressures. Mark has not raised concerns to his teachers, but the pattern suggests he is beginning to take on family responsibilities that compete with school. A home visit within the next week would help understand whether emergency assistance and school re-engagement support could keep him enrolled this quarter.

### Sofia Reyes — Pre-Cached Narration

> Sofia, age 11, has shown a marked academic decline this quarter, with two failing subjects and a six-point drop in average grade since the family relocated from Cavite four months ago. Her attendance remains strong, but the academic trend and adjustment context warrant attention before disengagement begins. She is one year over-age for Grade 5, which adds to the risk profile. Coordinating with her new school's guidance office and offering structured academic catch-up support over the next two weeks would address the most immediate drivers.

### Joshua dela Cruz — Pre-Cached Narration

> Joshua, age 16, is showing early-stage drift signals: a modest dip in attendance, one failing subject, and missing assessments in two of four quarters this year. None of these alone would typically trigger concern, but together they reflect the pattern that historically precedes Grade 10 dropout. He is over-age for his grade level, having been held back once. A home visit in the next two weeks, paired with targeted academic support, can address these signals before they compound.

---

## 4. Intervention Rules

`data/intervention_rules.json` maps risk drivers to intervention recommendations.

```json
{
  "attendanceRate30d_dropping": {
    "type": "home_visit",
    "urgencyDays": 7,
    "description": "Schedule a home visit to understand recent absences",
    "rationale": "Attendance trend reversal is most effective when addressed early"
  },
  "householdIncomeShock": {
    "type": "cash_assistance",
    "urgencyDays": 14,
    "description": "Assess eligibility for DSWD AICS emergency assistance",
    "rationale": "Income shock is a documented dropout precursor",
    "dswdProgramReference": "DSWD Assistance to Individuals in Crisis Situations (AICS)"
  },
  "hasOlderSiblingDropout": {
    "type": "family_counseling",
    "urgencyDays": 21,
    "description": "Engage family on educational continuity; reference older sibling's experience",
    "rationale": "Sibling dropout patterns indicate household-level factors",
    "dswdProgramReference": "Family Development Sessions (FDS)"
  },
  "gradeTrend_negative": {
    "type": "academic_support",
    "urgencyDays": 14,
    "description": "Coordinate with school guidance counselor for academic catch-up support",
    "rationale": "Grade decline often signals untreated learning gap"
  },
  "recentRelocation": {
    "type": "school_coordination",
    "urgencyDays": 14,
    "description": "Verify enrollment continuity and connect family to new school's guidance office",
    "rationale": "Relocation disrupts continuity and increases dropout risk"
  },
  "ageGradeMismatch": {
    "type": "academic_support",
    "urgencyDays": 21,
    "description": "Identify learning gap source; coordinate remedial support with school",
    "rationale": "Age-grade mismatch reflects accumulated unaddressed challenges"
  },
  "failingSubjects": {
    "type": "academic_support",
    "urgencyDays": 14,
    "description": "Connect family to subject-specific tutoring or peer learning groups",
    "rationale": "Multiple failing subjects accelerate disengagement"
  },
  "recentComplianceWarnings": {
    "type": "home_visit",
    "urgencyDays": 7,
    "description": "Discuss compliance warnings with family to understand barriers",
    "rationale": "Compliance issues often signal underlying household stress"
  }
}
```

---

## 5. Access Scope Configuration

`data/access_scope.json` is the static matrix served by `/api/access-scope`.

```json
{
  "matrix": [
    {
      "role": "Social Worker (Municipal Link)",
      "canSee": ["risk_score", "case_note", "interventions", "household_data"],
      "cannotSee": [],
      "rationale": "Direct intervention responsibility; the role for whom this tool is built"
    },
    {
      "role": "DSWD Supervisor",
      "canSee": ["risk_score", "case_note", "interventions"],
      "cannotSee": ["raw_household_data_outside_caseload"],
      "rationale": "Oversight and case escalation support"
    },
    {
      "role": "DSWD Case Management",
      "canSee": ["risk_score", "case_note", "aggregate_statistics"],
      "cannotSee": ["individually_identifying_household_data"],
      "rationale": "Program oversight; data minimization applies"
    },
    {
      "role": "Family",
      "canSee": ["case_note (with consent)", "interventions"],
      "cannotSee": ["raw_risk_score"],
      "rationale": "Collaborative discussion via social worker, not raw score"
    },
    {
      "role": "School Teacher",
      "canSee": [],
      "cannotSee": ["risk_score", "case_note", "interventions", "household_data"],
      "rationale": "Avoiding labeling effects documented in education research; teachers given at-risk labels often invest less in flagged students"
    },
    {
      "role": "School Administrator",
      "canSee": [],
      "cannotSee": ["risk_score", "case_note", "interventions", "household_data"],
      "rationale": "No direct intervention mandate; risk of misuse for enrollment decisions"
    },
    {
      "role": "External Researchers",
      "canSee": ["aggregate_statistics_only"],
      "cannotSee": ["individual_predictions", "personally_identifying_data"],
      "rationale": "Research access is anonymized, aggregated, and IRB-reviewed only"
    }
  ],
  "principle": "Built to be useful only to those who can help, and useless to those who could harm."
}
```

---

## 6. Impact Baseline Data

`data/impact_baseline.json` provides the numbers for the impact projection screen.

```json
{
  "clusterLevel": {
    "clusterSize": 247,
    "flaggedThisWeek": 12,
    "projectedDropoutsWithoutIntervention": 8,
    "projectedDropoutsWithIntervention": 3,
    "preventionRate": 0.625,
    "intervalLow": 0.45,
    "intervalHigh": 0.78
  },
  "nationalLevel": {
    "totalMunicipalLinks": 1200,
    "averageCaseloadPerLink": 240,
    "estimatedFlaggedAnnually": 144000,
    "estimatedAnnualPreventedDropouts": {
      "low": 8000,
      "high": 14000,
      "central": 11000
    }
  },
  "citations": [
    {
      "label": "DSWD 2023 Pantawid Pamilyang Pilipino Program Annual Report",
      "type": "government_report"
    },
    {
      "label": "DepEd Basic Education Statistics 2023",
      "type": "government_report"
    },
    {
      "label": "Reyes & Tabuga (2012). Conditional Cash Transfer Program in the Philippines: Is It Reaching the Extremely Poor? PIDS Discussion Paper.",
      "type": "academic_research"
    }
  ],
  "methodology": "Prevention rates are modeled estimates based on documented intervention efficacy in published Philippine social work literature. Production deployment requires validation against real DSWD outcome data."
}
```

---

## 7. ML Training Configuration

For `ml/train_model.py`:

```python
MODEL_CONFIG = {
    "model_type": "lightgbm",
    "n_estimators": 200,
    "max_depth": 6,
    "learning_rate": 0.05,
    "class_weight": "balanced",
    "random_state": 42
}

CALIBRATION_CONFIG = {
    "method": "isotonic",
    "cv": 5
}

TARGET_METRICS = {
    "auc_roc_min": 0.85,
    "ece_max": 0.05,
    "fairness_disparity_max": 0.10
}
```

---

## 8. Feature-to-Label Mapping (Full)

```python
FEATURE_LABELS = {
    "attendanceRate30d_low": "Attendance has dropped sharply in the last month",
    "attendanceRate30d_high": "Attendance has remained strong",
    "attendanceTrend_negative": "Attendance is on a declining trajectory",
    "attendanceTrend_positive": "Attendance is recovering",
    "averageGrade_low": "Overall academic performance is below grade-level expectations",
    "gradeTrend_negative": "Academic performance is declining over the last quarter",
    "gradeTrend_positive": "Academic performance is improving",
    "failingSubjects_high": "Multiple failing subjects this quarter",
    "householdIncomeShock_true": "The household reported a recent income loss",
    "parentEmploymentChange_true": "A parent recently lost or changed employment",
    "householdSize_high": "Large household size indicating possible resource strain",
    "hasOlderSiblingDropout_true": "An older sibling has previously left school",
    "ageGradeMismatch_high": "The child is older than typical for their grade level",
    "distanceToSchoolKm_high": "Significant distance to school adds daily friction",
    "recentRelocation_true": "The family relocated recently, disrupting school continuity",
    "recentComplianceWarnings_high": "Recent 4Ps compliance warnings flagged"
}
```

---

## 9. Pre-Hackathon Verification Checklist

Before Hour 1 begins, verify all of these:

- [ ] `data/synthetic_caseload.json` exists with 247 children
- [ ] Three demo children have exact specifications matching Section 1
- [ ] `data/precomputed_predictions.json` exists with one entry per child
- [ ] Each demo child's prediction matches the spec (probability and tier)
- [ ] `data/precomputed_narrations.json` exists with three narrations
- [ ] `data/intervention_rules.json` exists matching Section 4
- [ ] `data/access_scope.json` exists matching Section 5
- [ ] `data/impact_baseline.json` exists matching Section 6
- [ ] `data/fairness_report.json` exists with audit results
- [ ] All files validate as parseable JSON
