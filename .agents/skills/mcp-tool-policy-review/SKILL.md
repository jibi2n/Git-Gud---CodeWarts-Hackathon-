# Skill: mcp-tool-policy-review

**When to invoke:** a PR introduces a new external service, or modifies [mcp/policy.md](../../../mcp/policy.md), or the agentic reviewer flags a call to an undeclared domain.

## Inputs

- The PR diff
- Current `mcp/policy.md`

## Steps

1. Identify all outbound network calls in the diff (HTTP clients, SDK imports, env vars referencing external endpoints).
2. For each, check if the domain or service is listed in `mcp/policy.md`.
3. For any not listed: produce a finding requiring either (a) removal, or (b) a policy entry covering purpose, data sent, permissions, and fallback.
4. Verify that no raw audio is sent to any service other than the declared transcription provider.
5. Verify that no PII beyond what is necessary flows to each declared service.
6. Verify that the frontend does not call any external AI service directly (AGENTS.md §6).

## Output

A pass/fail with explicit findings per call site. A failing review blocks merge until the policy is updated by the governance lead.
