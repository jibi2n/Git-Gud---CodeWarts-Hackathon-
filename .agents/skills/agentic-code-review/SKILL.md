# Skill: agentic-code-review

**When to invoke:** every PR, automatically.

## Inputs

- The PR diff
- The referenced spec (`specs/use-cases/use-case-NNN-*.md`)
- The referenced plan (`plans/PLAN_USE_CASE_NNN.md`)

## Review Checklist

### Drift
- Does the diff match the plan?
- Are there changes not justified by the spec?

### Tests
- Are there unit tests for new logic?
- For LLM-touching code: is there a golden eval in [evals/](../../../evals/)?
- For transcription: are Filipino, English, and Taglish samples covered?

### Contract violations (AGENTS.md)
- Any frontend code calling external AI directly? **Forbidden** (§6).
- Any inlined prompts? **Forbidden** (§6).
- Any new external service not listed in [mcp/policy.md](../../../mcp/policy.md)? **Forbidden** (§9).
- Any raw audio retention beyond 24h without consent? **Forbidden** (§6).
- Hardcoded API keys? **Forbidden** (§14).

### Accessibility (DESIGN.md)
- Tap targets ≥ 48 × 48?
- Reduced-motion respected?
- No required text input for primary flow?
- Filipino / Taglish / English equally supported?

### Roles (ROLES.md)
- Is the author touching another role's surface without coordination?

## Output

A PR comment with categorized findings (`drift`, `tests`, `contract`, `a11y`, `roles`) and explicit pass/fail per category. A human reviewer must still approve the merge.
