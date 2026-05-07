# 02 — Rubric and Constraints

## The Hackathon Rubric (35 points total)

This project is graded against seven criteria, each scored 1–5. Every architectural and product decision in the spec is shaped by this rubric. Read it carefully.

### 1. Problem–SDG Alignment (5 pts)
*"The problem statement clearly maps to a specific SDG target; alignment is substantiated, not decorative."*

**Our position:** Direct mapping to SDG 4 (Quality Education), SDG 1 (No Poverty), SDG 10 (Reduced Inequalities), and SDG 16 (Strong Institutions). Each tied to measurable outcomes the product can affect.

### 2. Solution Innovativeness (5 pts)
*"The solution presents a novel or significantly improved approach; not a repackaged existing tool."*

**Our position:** The architectural refusal to expose predictions to schools (with citation to labeling-effect research), the role-scoped access matrix as a visible product feature, and the separation of prediction from narration are the three core innovations.

### 3. Technical Execution (5 pts)
*"The prototype is functional end-to-end; the tech stack is appropriate and implementation is sound."*

**Our position:** A real ML pipeline with calibration, SHAP explainability, fairness audit, ONNX export, and a clean service-layer architecture. Functional end-to-end means: log in, see caseload, click child, see case note, see access matrix, see impact — every step works.

### 4. Inclusivity & Accessibility (5 pts)
*"Design accounts for marginalized, low-literacy, or low-infrastructure users; universal design principles are applied."*

**Our position:** The protected subjects (4Ps families) are the most marginalized population in the country. The end user (social worker) operates in a low-resource government office with basic equipment. The interface is designed to be usable on a basic laptop, with clear typography, no jargon, and minimal cognitive load.

### 5. Social Impact Potential (5 pts)
*"A credible theory of change is presented; measurable outcomes are identified and realistic."*

**Our position:** Clearest measurable outcome of any project class — dropout rate within 4Ps families, already tracked by DSWD. Real baseline data exists. Real scaling math: 1,200 Municipal Links × intervention efficacy × cluster size = 8,000–14,000 prevented dropouts annually.

### 6. Ethical Consideration (5 pts)
*"Data privacy, consent, and potential unintended harms are acknowledged and mitigated in the design."*

**Our position:** Ethics is the architecture. Access scope is enforced at the data layer. Data minimization is structural. The harm catalog is enumerated. Family deletion right is honored. The system is built to be useful only to those who can help, and useless to those who could harm.

### 7. Sustainability & Scalability (5 pts)
*"The team presents a credible post-hackathon plan: funding model, growth pathway, and operational capacity."*

**Our position:** No revenue model needed because the funding model is government adoption. Pilot pathway: 90-day evaluation with one DSWD field office, evaluation framework co-designed with DSWD National Advisory Committee. Operational capacity: leverages existing 1,200-person Municipal Link network.

## Target Score

**30/35** is the realistic ceiling for the prototype as specified. With three additions if time allows, we can push toward 33+:
- Field-mode mobile view (Inclusivity 3 → 4)
- Operational plan one-pager (Sustainability 4 → 5)
- Real research citation in case notes (Innovation 4 → 5)

These are stretch goals, not requirements.

## Architectural Constraints That Cannot Be Violated

These constraints exist because they protect rubric scores. Violating any of them costs points.

### C1: The Access Boundary
Predictions about a child are visible only to:
- The Municipal Link assigned to that family
- Their direct DSWD supervisor
- DSWD case management staff (in aggregate form only)
- The family itself, if they consent and only mediated by the Municipal Link

Predictions are **never** visible to schools, teachers, school administrators, LGU general staff, or external researchers without anonymization. This is enforced at the data layer.

### C2: Synthetic Data Only
The prototype trains and runs on synthetic data designed to reflect documented Philippine dropout patterns. No real DSWD records, no real DepEd records, no real children's names. The synthetic origin is disclosed in the README and pitch.

### C3: The Model Does Not Generate Predictions From Free Text
The model is a tabular classifier with bounded inputs. The LLM only narrates the outputs of the tabular model. The LLM is never given authority to flag children, change risk scores, or recommend interventions outside the rule-based system. This separation is auditable.

### C4: Fairness Is Audited
The build includes a fairness audit comparing model performance across gender, region, and household composition. Results are reported in a `fairness_report.json` and visualized in the impact screen.

### C5: Every Prediction Has A Reason
SHAP values are computed for every flagged child. No child is flagged without an explanation. The explanations are translated to human-readable labels using a fixed mapping (no LLM creativity in the explanation layer).

### C6: Locked Copy Strings
Specific UI strings are mandated and must appear exactly as written. See `03_SYSTEM_DESIGN.md` Section 13.

### C7: Demo Reliability
Three demo children have pre-cached LLM narrations. When `DEMO_MODE=true`, their case notes load instantly from disk, never depending on a live API call. This is a reliability requirement.
