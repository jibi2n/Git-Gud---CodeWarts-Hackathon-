# 03 — System Design Document

**This is the binding technical specification. When in doubt, return here.**

---

## 1. Architecture

### 1.1 Architectural Style

Monolithic full-stack web application with three-layer separation:

- **Presentation:** Next.js 14 App Router frontend (TypeScript, Tailwind, shadcn/ui)
- **Application:** Next.js API routes orchestrating prediction, narration, intervention, access control
- **Data + ML:** Static synthetic dataset + pre-trained model artifacts + LLM API for narration

No microservices. No database. No auth provider. Single deployable unit.

### 1.2 Component Overview

```
Browser (Social Worker Dashboard)
    ↓
Next.js Frontend (5 screens)
    ↓ HTTP
Next.js API Routes (4 endpoints)
    ↓
Application Services
  - PredictionService
  - ExplanationService
  - NarrationService
  - InterventionService
  - AccessControlService
    ↓
Data + ML Layer
  - synthetic_caseload.json
  - precomputed_predictions.json (SHAP pre-computed)
  - precomputed_narrations.json (LLM pre-cached for demo personas)
  - intervention_rules.json
  - access_scope.json
  - impact_baseline.json
  - Anthropic Claude API (live narration for non-demo children)
```

### 1.3 Critical Path Request Flow

When a social worker clicks a flagged child:

1. Frontend calls `GET /api/child/{id}`
2. AccessControlService verifies role + resource scope
3. PredictionService loads pre-computed prediction from JSON
4. ExplanationService retrieves pre-computed SHAP values
5. NarrationService returns cached or live LLM case note
6. InterventionService maps risk drivers to intervention recommendations (rule-based)
7. Response assembled and returned
8. Frontend renders child detail view

Target latency: 2–6 seconds. Pre-cached for demo personas to be near-instant.

---

## 2. Tech Stack (Locked)

| Layer | Choice |
|---|---|
| Frontend framework | Next.js 14 (App Router) |
| Frontend language | TypeScript |
| Styling | TailwindCSS |
| UI components | shadcn/ui |
| Backend | Next.js API routes (Node) |
| ML training | Python 3.11 + scikit-learn + LightGBM + SHAP (offline) |
| ML inference | Pre-computed predictions in JSON (no live model in API) |
| LLM (narration) | Anthropic Claude `claude-sonnet-4-5` |
| Charts | Recharts |
| Data store | Static JSON files in `/data` |
| Hosting | Vercel |

### Environment Variables

```env
ANTHROPIC_API_KEY=sk-ant-...
DEMO_MODE=true
NODE_ENV=production
```

---

## 3. Project Structure

```
pantawidaral/
├── app/
│   ├── page.tsx                      # Landing
│   ├── dashboard/page.tsx            # Caseload view
│   ├── child/[id]/page.tsx           # Child detail
│   ├── access/page.tsx               # Who Can See This
│   ├── impact/page.tsx               # Impact Projection
│   └── api/
│       ├── caseload/route.ts
│       ├── child/[id]/route.ts
│       ├── access-scope/route.ts
│       └── impact/route.ts
├── components/
│   ├── CaseloadTable.tsx
│   ├── ChildDetailCard.tsx
│   ├── RiskBadge.tsx
│   ├── CaseNote.tsx
│   ├── InterventionList.tsx
│   ├── AccessScopeMatrix.tsx
│   ├── ImpactProjection.tsx
│   └── EthicsBanner.tsx
├── lib/
│   ├── services/
│   │   ├── prediction.ts
│   │   ├── explanation.ts
│   │   ├── narration.ts
│   │   ├── intervention.ts
│   │   └── accessControl.ts
│   ├── types.ts
│   ├── prompts.ts
│   └── constants.ts
├── data/
│   ├── synthetic_caseload.json
│   ├── precomputed_predictions.json
│   ├── precomputed_narrations.json
│   ├── intervention_rules.json
│   ├── access_scope.json
│   └── impact_baseline.json
├── ml/                               # Run before hackathon
│   ├── generate_synthetic.py
│   ├── train_model.py
│   ├── compute_shap.py
│   ├── pregenerate_narrations.py
│   └── validate_fairness.py
├── public/
├── .env.local
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

---

## 4. Data Model

### 4.1 Canonical TypeScript Types

```typescript
// lib/types.ts

export type RiskTier = 'low' | 'moderate' | 'high' | 'critical';

export interface Child {
  id: string;
  firstName: string;
  age: number;
  gradeLevel: string;
  schoolName: string;
  fpsHouseholdId: string;
  features: ChildFeatures;
  guardianName: string;
  barangay: string;
}

export interface ChildFeatures {
  attendanceRate30d: number;
  attendanceRate90d: number;
  attendanceTrend: number;
  averageGrade: number;
  gradeTrend: number;
  failingSubjects: number;
  householdIncomeShock: boolean;
  parentEmploymentChange: boolean;
  householdSize: number;
  numberOfSiblings: number;
  hasOlderSiblingDropout: boolean;
  ageGradeMismatch: number;
  distanceToSchoolKm: number;
  recentRelocation: boolean;
  monthsIn4Ps: number;
  recentComplianceWarnings: number;
}

export interface Prediction {
  childId: string;
  dropoutProbability90d: number;
  riskTier: RiskTier;
  topRiskDrivers: RiskDriver[];
  confidence: number;
  generatedAt: string;
}

export interface RiskDriver {
  feature: string;
  humanLabel: string;
  shapValue: number;
  contributionDirection: 'increases' | 'decreases';
}

export interface CaseNote {
  childId: string;
  narrativeText: string;
  generatedAt: string;
  source: 'live' | 'cached';
}

export interface Intervention {
  type: 'home_visit' | 'cash_assistance' | 'academic_support'
      | 'health_referral' | 'family_counseling' | 'school_coordination';
  urgencyDays: number;
  description: string;
  rationale: string;
  dswdProgramReference?: string;
}

export interface AccessScope {
  role: string;
  canSee: string[];
  cannotSee: string[];
  rationale: string;
}

export interface ImpactProjection {
  clusterSize: number;
  flaggedThisWeek: number;
  projectedDropoutsWithoutIntervention: number;
  projectedDropoutsWithIntervention: number;
  preventionRate: number;
  citationSources: string[];
}
```

### 4.2 Risk Tier Thresholds

```typescript
// lib/constants.ts

export function getRiskTier(probability: number): RiskTier {
  if (probability >= 0.65) return 'critical';
  if (probability >= 0.50) return 'high';
  if (probability >= 0.30) return 'moderate';
  return 'low';
}
```

---

## 5. API Specification

### 5.1 GET /api/caseload

**Returns:** Ranked list of children in cluster, sorted by `dropoutProbability90d` descending.

```json
{
  "socialWorker": {
    "name": "Marivic Santos",
    "role": "Municipal Link",
    "cluster": "San Pedro, Laguna",
    "totalFamilies": 247
  },
  "children": [
    {
      "child": { /* Child */ },
      "prediction": { /* Prediction */ },
      "interventionScheduled": false
    }
  ],
  "summary": {
    "totalFlagged": 12,
    "criticalRisk": 3,
    "highRisk": 5,
    "moderateRisk": 4
  }
}
```

### 5.2 GET /api/child/[id]

**Returns:** Full child detail with case note and interventions.

```json
{
  "child": { /* Child */ },
  "prediction": { /* Prediction */ },
  "caseNote": { /* CaseNote */ },
  "interventions": [ /* Intervention[] */ ],
  "accessAuditLog": [
    {
      "accessedBy": "Marivic Santos",
      "role": "Municipal Link",
      "timestamp": "ISO timestamp"
    }
  ]
}
```

**Behavior:**
1. If `id` matches a demo persona AND `DEMO_MODE=true` → return cached narration
2. Otherwise → call LLM live for narration
3. Always log access to in-memory audit trail

### 5.3 GET /api/access-scope

**Returns:** Static configuration showing access matrix.

```json
{
  "matrix": [
    {
      "role": "Social Worker (Municipal Link)",
      "canSee": ["risk_score", "case_note", "interventions", "household_data"],
      "cannotSee": [],
      "rationale": "Direct intervention responsibility"
    },
    {
      "role": "School Teacher",
      "canSee": [],
      "cannotSee": ["risk_score", "case_note", "interventions", "household_data"],
      "rationale": "Avoiding labeling effects documented in education research"
    },
    {
      "role": "School Administrator",
      "canSee": [],
      "cannotSee": ["risk_score", "case_note", "interventions", "household_data"],
      "rationale": "No direct intervention mandate; risk of misuse"
    },
    {
      "role": "Family",
      "canSee": ["case_note (with consent)", "interventions"],
      "cannotSee": ["raw risk_score"],
      "rationale": "Collaborative discussion via social worker, not raw score"
    },
    {
      "role": "DSWD Case Management",
      "canSee": ["risk_score", "case_note", "aggregate_statistics"],
      "cannotSee": ["individually_identifying_household_data"],
      "rationale": "Program oversight; data minimization"
    },
    {
      "role": "External Researchers",
      "canSee": ["aggregate_statistics_only"],
      "cannotSee": ["individual_predictions", "personally_identifying_data"],
      "rationale": "Research access is anonymized only"
    }
  ],
  "principle": "Built to be useful only to those who can help, and useless to those who could harm."
}
```

### 5.4 GET /api/impact

**Returns:** Cluster and national impact projection.

```json
{
  "projection": {
    "clusterSize": 247,
    "flaggedThisWeek": 12,
    "projectedDropoutsWithoutIntervention": 8,
    "projectedDropoutsWithIntervention": 3,
    "preventionRate": 0.625,
    "intervalLow": 0.45,
    "intervalHigh": 0.78
  },
  "nationalProjection": {
    "totalMunicipalLinks": 1200,
    "estimatedAnnualPreventedDropouts": {
      "low": 8000,
      "high": 14000
    }
  },
  "citations": [
    "DSWD 2023 Pantawid Pamilyang Pilipino Program Annual Report",
    "DepEd Basic Education Statistics 2023",
    "Reyes & Tabuga (2012). Conditional Cash Transfer Program in the Philippines."
  ]
}
```

---

## 6. Service Layer

### 6.1 PredictionService

```typescript
// lib/services/prediction.ts
class PredictionService {
  async predict(childId: string): Promise<Prediction> {
    // Load from precomputed_predictions.json by childId
  }
}
```

### 6.2 NarrationService

```typescript
// lib/services/narration.ts
class NarrationService {
  async narrate(child: Child, prediction: Prediction): Promise<CaseNote> {
    // 1. Check precomputed_narrations.json
    if (process.env.DEMO_MODE === 'true' && hasCached(child.id)) {
      return { ...cachedNarration, source: 'cached' };
    }
    // 2. Build prompt
    const prompt = buildCaseNotePrompt(child, prediction);
    // 3. Call Claude
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 400,
      system: CASE_NOTE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }]
    });
    return { /* CaseNote */, source: 'live' };
  }
}
```

### 6.3 InterventionService

```typescript
// lib/services/intervention.ts
class InterventionService {
  recommend(prediction: Prediction): Intervention[] {
    // Map top 3 risk drivers to rule-based interventions
    // Load mapping from intervention_rules.json
    // Return max 3 interventions
  }
}
```

### 6.4 AccessControlService

```typescript
// lib/services/accessControl.ts
class AccessControlService {
  verify(role: string, resource: string): boolean {
    // Check access_scope.json
  }
  audit(access: AccessAttempt): void {
    // In-memory log
  }
}
```

---

## 7. Frontend Specification

### 7.1 Screen 1 — Landing (`/`)

- PantawidAral wordmark
- Tagline: **"Foresight for the families who can't afford to be invisible."**
- Single CTA: **"Login as Ate Marivic Santos"**
- Footer: "Hackathon prototype — synthetic data only"
- Click CTA → navigate to `/dashboard`

### 7.2 Screen 2 — Dashboard (`/dashboard`)

**Layout (top to bottom):**
- Header: "Ate Marivic Santos" + "Municipal Link, San Pedro, Laguna" + "247 4Ps families"
- Summary strip: 4 stat cards (Total flagged: 12, Critical: 3, High: 5, Moderate: 4)
- Caseload table: 12 rows sorted by risk descending
  - Columns: Name | Age | Grade | Risk Tier (color-coded badge) | Probability | Top Concern | Action
- Persistent ethics banner at bottom: 🔒 **"These predictions are visible only to authorized DSWD staff."** with link to `/access`

**Interactions:**
- Hover row: subtle highlight
- Click row: navigate to `/child/[id]`

### 7.3 Screen 3 — Child Detail (`/child/[id]`)

**This is the core demo screen. The case note is the focal point.**

**Layout (top to bottom):**
1. Header: Child first name + age + grade + barangay
2. Risk panel: Probability gauge (0–100%) + risk tier badge + calibrated confidence note
3. **Case note card** (visually prominent, quoted-style frame): the LLM-generated paragraph
4. Why panel: top 3 risk drivers with human labels and SHAP-derived bars
5. Recommended interventions: 2–3 cards with type, urgency badge, description, DSWD program reference
6. Access log card: small footer showing "Accessed by: Marivic Santos · timestamp · Logged"
7. Action button: "Mark intervention as scheduled" (frontend-only state)

### 7.4 Screen 4 — Who Can See This (`/access`)

**Visually quiet, almost minimalist. The seriousness carries the weight.**

- Title: "Who Can See This Information"
- Principle quote (large): **"Built to be useful only to those who can help, and useless to those who could harm."**
- Access matrix table: 6 rows from `/api/access-scope`
  - Color-coded: green for can-see, red for cannot-see
- Footnote: brief explanation of the labeling effect with reference to education research

### 7.5 Screen 5 — Impact Projection (`/impact`)

- Cluster impact text: "If interventions are scheduled within 14 days for the 12 flagged children, the modeled outcome is 5 prevented dropouts in San Pedro this year."
- National projection bar chart (Recharts): 1,200 Municipal Links scaling
- Citations: three labeled sources
- Roadmap line: "Pilot path: 90-day evaluation with one DSWD field office, co-designed with DSWD National Advisory Committee."

---

## 8. ML Pipeline (Offline, Pre-Hackathon)

### 8.1 Generate Synthetic Dataset

`ml/generate_synthetic.py`:
- 247 children in Marivic's cluster
- Risk distribution: 70% low, 18% moderate, 8% high, 4% critical
- Age 6–17, balanced gender, distributed across 8 barangays
- Realistic co-occurrence: income shocks correlate with attendance drops; sibling dropouts correlate with current child risk
- **Three demo children hand-tuned** (see Section 11)

### 8.2 Train Model

`ml/train_model.py`:
- LightGBM classifier
- 200 estimators, max_depth=6, learning_rate=0.05
- Class weights balanced
- Calibrate via `CalibratedClassifierCV` (isotonic)
- Train/test split 80/20, stratified
- Target metrics: AUC-ROC ≥ 0.85, ECE ≤ 0.05

### 8.3 Compute SHAP

`ml/compute_shap.py`:
- TreeExplainer for every child
- Top 5 features by absolute SHAP value
- Map to human labels (see Section 9)
- Save to `data/precomputed_predictions.json`

### 8.4 Pre-Generate Narrations

`ml/pregenerate_narrations.py`:
- Call Claude API for the three demo children
- Hand-edit if needed for emotional resonance
- Save to `data/precomputed_narrations.json`

### 8.5 Fairness Audit

`ml/validate_fairness.py`:
- TPR / FPR by gender, region
- Calibration by subgroup
- Demographic parity ratios
- Save to `data/fairness_report.json`

---

## 9. LLM Prompts

### 9.1 Case Note System Prompt

```
You are writing a case note for a Filipino DSWD social worker (Municipal Link)
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

Output: A single paragraph. No headers. No markdown.
```

### 9.2 Case Note User Prompt Template

```
Write a case note for this child:

Name: {firstName}
Age: {age}
Grade: {gradeLevel}
Barangay: {barangay}

Current dropout probability over 90 days: {probability}%

Top reasons:
{bulletList of humanLabel risk drivers}

Write the case note now.
```

### 9.3 Feature-to-Human-Label Mapping

```typescript
const FEATURE_LABELS = {
  attendanceRate30d_dropping: "Attendance has dropped sharply in the last month",
  householdIncomeShock: "The household reported a recent income loss",
  hasOlderSiblingDropout: "An older sibling has previously left school",
  ageGradeMismatch: "The child is older than typical for their grade level",
  gradeTrend_negative: "Academic performance is declining over the last quarter",
  recentRelocation: "The family relocated recently, disrupting school continuity",
  failingSubjects: "Multiple failing subjects this quarter",
  recentComplianceWarnings: "Recent 4Ps compliance warnings flagged",
  // Full mapping included in code
};
```

---

## 10. Intervention Rules

```typescript
// Loaded from data/intervention_rules.json
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
  }
}
```

`InterventionService.recommend()` maps top 3 risk drivers to interventions, returns max 3 sorted by urgency.

---

## 11. Demo Persona Specifications

### Mark Aquino, 14, Grade 8 — `child_demo_001`

- **Probability:** 0.73 (Critical)
- **Top drivers:** attendanceRate30d_dropping, householdIncomeShock, hasOlderSiblingDropout
- **Story context:** Father lost construction work; Mark started missing school to help with sari-sari store; older sister Cristine left school in 2024
- **Pre-cached case note:** Hand-edit for emotional resonance
- **Top interventions:** Home visit (7 days), AICS assessment (14 days), family counseling (21 days)

### Sofia Reyes, 11, Grade 5 — `child_demo_002`

- **Probability:** 0.58 (High)
- **Top drivers:** gradeTrend_negative, recentRelocation, ageGradeMismatch
- **Story context:** Family moved from Cavite 4 months ago; struggling to adapt; teacher hasn't connected with parents
- **Top interventions:** School coordination (14 days), academic support (14 days), home visit (14 days)

### Joshua de la Cruz, 16, Grade 10 — `child_demo_003`

- **Probability:** 0.41 (Moderate)
- **Top drivers:** subtle attendance dip, missing assessments, age-grade mismatch
- **Story context:** Slow drift; the case that historically gets missed; demonstrates the model's value at the moderate-risk margin
- **Top interventions:** Home visit (14 days), academic support (21 days)

---

## 12. Failure Modes & Mitigation

| Failure | Mitigation |
|---|---|
| LLM API down | Pre-cached narrations for 3 demo children; demo proceeds offline |
| Vercel deploy fails | Local backup running via `npm run start` on demo machine |
| Network failure during demo | Pre-recorded 30-second screen capture as ultimate fallback |
| Judge clicks non-demo child | All 247 children have valid auto-generated case notes (faster, less polished) |
| LLM returns malformed output | Schema validation; fall back to template-based case note |
| Model loading fails | All predictions pre-computed; never load model at runtime |

---

## 13. Locked Copy Strings

These exact strings appear in the UI. Do not paraphrase.

- App name: **PantawidAral**
- Tagline: **"Foresight for the families who can't afford to be invisible."**
- Ethics principle: **"Built to be useful only to those who can help, and useless to those who could harm."**
- Risk score language: **"current situation"** — never "label," "flag," or "tag"
- Confidence language: **"documented"** or **"observed"** — never "verified" or "certified"
- Persona role: **"Municipal Link"** (DSWD official title)
- Access banner: **"🔒 Visible only to authorized DSWD staff."**

---

## 14. Visual Design Notes

- **Color palette:** Calm and institutional. Avoid alarmist reds except for "critical" risk badges. Use blues and warm grays as primary palette.
- **Typography:** Sans-serif throughout. Use weight (not color) for hierarchy.
- **Risk badges:** Gray (low), Yellow (moderate), Orange (high), Red (critical). Use color sparingly — risk badges are the only red.
- **Spacing:** Generous whitespace. Each card is breathable.
- **Tone of UI text:** Direct, dignified, no exclamation marks anywhere.

---

## 15. Definition of Done

The build is complete when all of these are true:

1. The full demo flow runs end-to-end with no manual interventions
2. All three demo children render with full case notes
3. The Access Scope screen is visually polished and accurate
4. The Impact Projection page cites real sources
5. The deployed Vercel URL works from the demo machine
6. Fallbacks for LLM failure and network failure have been tested
7. The pitch script has been rehearsed at least twice end-to-end
8. The synthetic dataset documentation is in the README

If any of these eight is not true, the build is not done.
