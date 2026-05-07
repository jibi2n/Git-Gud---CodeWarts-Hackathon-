# Skill: spec-to-plan

**When to invoke:** a spec exists in `specs/use-cases/use-case-NNN-*.md` and there is no corresponding `plans/PLAN_USE_CASE_NNN.md`, or the existing plan is stale.

## Inputs

- Path to the spec file
- Current state of the repo

## Steps

1. Read the spec end-to-end. Identify the user flow, acceptance criteria, out-of-scope items, and open questions.
2. Read [AGENTS.md](../../../AGENTS.md), [SDD.md](../../../SDD.md), [DESIGN.md](../../../DESIGN.md), and [ROLES.md](../../../ROLES.md) for binding constraints.
3. Read [mcp/policy.md](../../../mcp/policy.md) for the external-service allowlist.
4. Map every acceptance criterion to a concrete file or module (existing or new).
5. Identify the role(s) responsible per [ROLES.md](../../../ROLES.md).
6. Sequence the work into commits or PRs. Prefer thin vertical slices that produce a demoable result.
7. Call out risks, unknowns, and the testing strategy (unit, integration, golden eval).
8. Write the plan to `plans/PLAN_USE_CASE_NNN.md` with sections: `Spec`, `Files`, `Sequencing`, `Risks`, `Testing`.

## Output

A plan file the team can review and a list of open questions that block implementation.

## Forbidden

- Writing code as part of this skill. Plans only.
- Bypassing the role-ownership rules in ROLES.md.
