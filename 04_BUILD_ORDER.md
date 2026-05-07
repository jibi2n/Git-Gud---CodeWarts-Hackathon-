# 04 — Build Order

This is the binding hour-by-hour plan. Follow it strictly.

---

## Pre-Hackathon (Hour 0)

These run before the build clock starts. All scripts in `/ml`.

1. `python ml/generate_synthetic.py` → produces `data/synthetic_caseload.json`
2. `python ml/train_model.py` → trains LightGBM, exports model artifact
3. `python ml/compute_shap.py` → produces `data/precomputed_predictions.json`
4. `python ml/pregenerate_narrations.py` → produces `data/precomputed_narrations.json` for the three demo children
5. `python ml/validate_fairness.py` → produces `data/fairness_report.json`

By Hour 0 end: all artifacts in `/data` exist. Verified by inspection.

---

## Hour 1 — Skeleton

**Goal:** Project structure exists and renders. All API routes return stub data.

- Initialize Next.js 14 with App Router, TypeScript, Tailwind, shadcn/ui
- Set up project structure per Section 3 of System Design
- Define all canonical types in `lib/types.ts`
- Create all 4 API routes returning hardcoded stub responses matching the schemas
- Create the 5 page components as empty shells with placeholder text
- Configure Tailwind colors and base typography
- Deploy hello-world to Vercel; verify URL works

**Deliverable:** All API routes respond with valid JSON. All pages render placeholder content.

---

## Hour 2 — Data Layer Wiring

**Goal:** Real data flows from JSON files through services to API routes.

- Implement `PredictionService` to load from `precomputed_predictions.json`
- Implement `AccessControlService` reading from `access_scope.json`
- Wire `/api/caseload` to return all flagged children sorted by probability
- Wire `/api/child/[id]` to return prediction (without narration yet)
- Wire `/api/access-scope` to return the static matrix
- Wire `/api/impact` to return projection from `impact_baseline.json`

**Deliverable:** All API endpoints return real data from JSON files. Verified via direct curl/browser test.

---

## Hour 3 — Narration & Interventions

**Goal:** Case notes and interventions render correctly.

- Implement `NarrationService` with cache-first logic for demo personas
- Configure Anthropic client with system prompt per Section 9 of System Design
- Test live narration on a non-demo child to verify fallback works
- Implement `InterventionService` reading from `intervention_rules.json`
- Update `/api/child/[id]` to include caseNote and interventions
- Verify all three demo children return cached narrations

**Deliverable:** Click any flagged child via API and receive complete response with case note and interventions.

---

## Hour 4 — Frontend Wiring

**Goal:** All five screens are functional with real data.

- Build `CaseloadTable` component, wire to `/api/caseload`
- Build `ChildDetailCard` with case note prominently displayed
- Build `RiskBadge` with four-tier color system
- Build `InterventionList` rendering recommended interventions
- Build `AccessScopeMatrix` for the access screen
- Build `EthicsBanner` as persistent footer
- Wire navigation between all five screens

**Deliverable:** Full demo flow runs in the browser. Click → click → click works end-to-end.

---

## Hour 5 — Polish

**Goal:** Demo looks professional. Visual hierarchy is clear. No rough edges.

- Refine spacing, typography, color usage per Section 14 of System Design
- Add loading states for the (cached, but rendered) narration
- Add the Recharts bar chart on the Impact screen
- Verify locked copy strings are exact (Section 13 of System Design)
- Run full demo rehearsal once
- Identify rough edges; fix the worst three

**Deliverable:** Demo flow looks polished enough for judges. Pitch can be rehearsed against it.

---

## Hour 6 — Demo Hardening

**Goal:** Build is shippable. Fallbacks tested. Final deploy verified.

- Test LLM-offline path (turn off Anthropic API key, verify cached responses still work)
- Deploy final version to Vercel
- Test deployed URL from demo machine specifically (not dev machine)
- Take screenshots of every screen for ultimate fallback
- Record 30-second screen capture of full demo flow
- Verify all 8 items in Definition of Done (Section 15 of System Design)
- Final pitch rehearsal end-to-end

**Deliverable:** Shippable URL. Pitch rehearsed. Fallbacks tested.

---

## Cut Order If Behind Schedule

Apply cuts in this order if running over time. Never violate the access boundary.

1. **First cut:** Live LLM mode — use only cached narrations for all children, even non-demo. Saves Hour 3 LLM debugging time.
2. **Second cut:** National projection chart — replace with text-only impact statement. Saves Hour 5 chart polish.
3. **Third cut:** Fairness audit display — mention verbally in pitch only, do not render in UI. Saves Hour 5 polish.
4. **Fourth cut:** Animation and transitions — keep static UI only. Saves Hour 5 polish.

**Never cut:**
- The Access Scope screen
- The case note rendering on child detail
- The risk tier badges
- The ethics banner

These four are the rubric-defining features.

---

## Stretch Goals (If Hour 5–6 Has Slack)

Each pushes a rubric criterion higher. Pursue only if the core build is solid.

1. **Field-mode mobile view** — large touch targets, simplified single-child view, tested on phone viewport. Pushes Inclusivity 3 → 4.
2. **Operational plan one-pager** — embedded in `/impact` page, covers ownership, retraining, drift handling. Pushes Sustainability 4 → 5.
3. **Research citation in case notes** — add a small "Why this matters" expandable showing the labeling-effect citation inline. Pushes Innovation 4 → 5.

---

## Pacing Discipline

If at any hour boundary you are behind schedule:
- **Do not extend the hour.** Cut scope per the cut order above.
- **Do not skip the next hour's setup work.** Hours build on each other.
- **Do not add features.** The spec is complete. New ideas during the build are scope creep.

The build wins on completion plus polish. Half-finished features score worse than cut features.
