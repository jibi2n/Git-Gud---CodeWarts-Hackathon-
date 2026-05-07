# Agent Instructions — Build PantawidAral

You are building a hackathon prototype called **PantawidAral**: a dropout risk prediction and intervention support tool for DSWD social workers managing 4Ps (Pantawid Pamilyang Pilipino Program) families in the Philippines.

---

## Read Before Building

Read these files in this exact order before writing any code:

1. `01_PROJECT_OVERVIEW.md` — what the project is, who it serves, why it exists
2. `02_RUBRIC_AND_CONSTRAINTS.md` — the criteria your build is graded against
3. `03_SYSTEM_DESIGN.md` — the technical design document (this is the binding spec)
4. `04_BUILD_ORDER.md` — the hour-by-hour build plan
5. `05_DATA_SPECIFICATIONS.md` — synthetic data, ML pipeline, prompts
6. `06_DO_NOT_BUILD.md` — out-of-scope features; reject if asked

After reading all six, confirm understanding by stating the project's one-line purpose and the architectural constraint that defines the product.

---

## Operating Rules

### Rule 1: The SDD is binding
If you are uncertain about any decision, return to `03_SYSTEM_DESIGN.md`. Do not invent. Do not "improve." Build what is specified.

### Rule 2: Time discipline
This is a 6-hour hackathon build. Follow `04_BUILD_ORDER.md` strictly. If hour 3 arrives and you are still on hour 2 work, cut scope per the cut order in that document. Do not extend.

### Rule 3: The ethics layer is not optional
The architectural access boundary (predictions never exposed to schools/teachers) is the single most important feature. It is the rubric differentiator. Never weaken or skip it.

### Rule 4: Pre-cached responses for demo personas
Three children (Mark, Sofia, Joshua) have hand-tuned demo data and pre-generated LLM narrations. The system must serve their data instantly from cache when `DEMO_MODE=true`. This is a reliability requirement, not a shortcut.

### Rule 5: Locked copy strings
Specific UI strings are locked in `03_SYSTEM_DESIGN.md` Section 13. Do not paraphrase them. They appear exactly as written or not at all.

### Rule 6: Synthetic data only
The ML pipeline trains on synthetic data designed to reflect documented Philippine dropout patterns. Do not attempt to scrape real DSWD or DepEd data. Do not use real children's names. Do not represent the synthetic data as real anywhere in the UI.

---

## Tech Stack Lock

Use exactly these technologies. Do not substitute without explicit user permission.

- **Frontend:** Next.js 14 (App Router) + TypeScript + TailwindCSS + shadcn/ui
- **Backend:** Next.js API routes (same project)
- **ML training:** Python 3.11 + scikit-learn + LightGBM + SHAP (offline, in `/ml`)
- **ML inference:** Pre-computed predictions loaded from JSON (no live inference required for demo)
- **LLM:** Anthropic Claude (`claude-sonnet-4-5`) for case note narration
- **Charts:** Recharts
- **Hosting:** Vercel
- **No database.** Static JSON files in `/data` only.

---

## What You Are Building

A vertical-slice prototype where:

1. A user logs in as Ate Marivic, a Municipal Link
2. Sees a caseload of 12 flagged children out of 247 4Ps families
3. Clicks any child to see a plain-language case note, top risk drivers, and recommended interventions
4. Can navigate to a "Who Can See This" screen showing the access matrix
5. Can navigate to an Impact Projection screen showing modeled outcomes

That is the entire user-facing scope. Build only this.

---

## Definition of Done

The build is complete when all eight items in `03_SYSTEM_DESIGN.md` Section 15 are satisfied. Confirm each one explicitly before declaring complete.

---

## Begin

After reading all six files, your first action is to scaffold the project structure as specified in `03_SYSTEM_DESIGN.md` Section 4. Then proceed through `04_BUILD_ORDER.md` hour by hour.

If at any point you are blocked, paused, or uncertain, stop and report the blocker rather than improvising.
