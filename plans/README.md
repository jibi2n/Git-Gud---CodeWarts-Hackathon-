# plans/

Implementation plans, one per use case. Each plan is named `PLAN_USE_CASE_NNN.md` and references the spec it implements.

Specs are durable. Plans are disposable — a plan may be rewritten as understanding improves.

Each plan lists:
- The spec it implements
- Files to be created or modified
- Sequencing (commits or PRs)
- Risks and unknowns
- Testing strategy

Use the `spec-to-plan` skill (see [.agents/skills/spec-to-plan/SKILL.md](../.agents/skills/spec-to-plan/SKILL.md)) to draft a plan from a spec.
