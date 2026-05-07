# AGENTS.md

This document is the operating contract for every human contributor and every AI agent that touches this repository. Anyone working on Boses, wherein "anyone" includes the four-person team, the agentic code reviewer, and any AI assistant invoked through Cursor, Claude Code, or similar, is bound by the rules in this document.

The point of this contract is to make sure that we move from vibe coding towards vibe engineering, basically that we keep a repeatable factory loop running even under hackathon pressure, since the discipline is what makes the difference between a working demo and a maintainable product.

## 1. Project Context

Boses, meaning "voice" in Filipino, is an oral-to-digital competency bridge designed to solve the diploma gap in the Philippines. Roughly 40 percent of the Filipino labor force works in the informal sector, wherein a lot of workers possess high-value skills like logistics coordination, micro-accounting, or crisis management, but lack the resumes or diplomas to prove them.

Boses turns spoken stories into professional potential through voice capture in Filipino, Taglish, and English, skill recognition with encouragement, career pathway suggestions covering TESDA certificates, jobs, and possible businesses, and a job map showing nearby companies the user may apply to.

The target user is a Filipino informal-sector worker, possibly with low literacy, possibly in a remote area, possibly with intermittent connectivity, and almost certainly underestimating the value of his or her own skills. Every design and engineering decision in this repository must be evaluated against whether it serves this user.

## 2. Operating Principles

The factory loop is non-negotiable. Every feature must pass through the following stages in order:

1. A spec is written in `specs/use-cases/` describing intended behavior, user flow, and acceptance criteria, before any code is written.
2. An agent or contributor invokes the `spec-to-plan` skill to produce a plan in `plans/` covering implementation strategy, files to touch, sequencing, and risks.
3. The plan is reviewed by at least one human team member who is not the author.
4. Implementation happens against the approved plan, with tests written either before or alongside the code.
5. `make test`, `make lint`, and `make validate-factory` must pass locally before pushing.
6. Every pull request triggers the `agentic-code-review` skill, wherein the AI reviewer inspects the diff against the spec and plan, and flags drift, missing tests, or violations of this document.
7. Recurring lessons are promoted into `docs/`, `.agents/skills/`, `.cursor/rules/`, or new tests, towards the goal that the same mistake is not made twice.

Skipping the spec or plan stage is forbidden, even for small changes, since a "small change" with no spec is the most common path to scope drift.

## 3. Roles and Ownership

The team has four members, each owning a domain wherein the owner is responsible for spec authorship, plan review, and implementation oversight.

The AI and ML lead owns voice transcription, skill extraction, the encouragement layer, the TESDA passing-rate model, and all LLM and MCP integrations on the backend.

The backend and infrastructure lead owns API design, the database schema, the company and jobs data model, Docker setup, and CI configuration.

The frontend and UX lead owns the voice capture flow, the playback-and-confirm step, the profile and resume export feature, the map UI, and is the primary author of `DESIGN.md`.

The product, pitch, and governance lead owns the higher-level product spec, the ethical framework, the sustainability plan, this `AGENTS.md` document, agentic code review enforcement, factory metrics tracking, and user research.

Every member is expected to participate in code review regardless of domain, since cross-domain review is what catches the issues a single owner misses.

## 4. Stack and Conventions

The backend lives in `apps/service/` and uses Python with FastAPI, Pydantic for request and response models, and pytest for tests. Database access goes through raw SQL using `psycopg` rather than an ORM, since the team is deliberately practicing raw SQL fluency. PostgreSQL is the primary data store, with `pgvector` extension enabled for semantic skill matching.

The frontend lives in `apps/web/` and uses Next.js with TypeScript, Tailwind CSS for styling, and React Query for data fetching. A Flutter mobile client may be added later in `apps/mobile/`, but the web client is the MDP target.

Voice transcription uses the OpenAI Whisper API, wherein the choice is justified by Whisper's reasonable handling of Taglish code-switching, which most other speech-to-text providers force into a single language. The LLM layer for skill extraction and encouragement uses the OpenAI or Anthropic API behind a thin wrapper in `apps/service/llm/`, so that the provider can be swapped without touching feature code.

Code style follows `ruff` for Python and `eslint` plus `prettier` for TypeScript, with configurations checked into the repo. No clever or experimental patterns without a documented justification in `docs/decisions/`.

## 5. Specs and Plans Contract

Specs live in `specs/use-cases/` and are named `use-case-NNN-short-description.md`. Each spec contains, at minimum, the user story, the user flow step by step, the acceptance criteria, the out-of-scope items, and any open questions. Specs are written in plain language so that a non-technical reviewer, basically the PM or a mentor, can understand and approve them.

Plans live in `plans/` and are named `PLAN_USE_CASE_NNN.md`. Each plan references the spec it implements, lists the files to be created or modified, sequences the work into commits or PRs, calls out risks and unknowns, and proposes a testing strategy.

Specs are durable, plans are disposable. A plan may be rewritten as understanding improves, but a spec is a contract that requires explicit team approval to change.

## 6. Implementation Rules

No direct calls to OpenAI, Anthropic, Whisper, or any external AI service from frontend code. All LLM and transcription access flows through the backend, which gives us a single place to enforce rate limiting, logging, prompt versioning, and content filtering.

No personally identifiable information, voice recordings, or transcripts may be sent to any third party that is not declared in `mcp/policy.md`. The list of approved external services is the closed set; adding to it requires a PR that updates `mcp/policy.md` and is reviewed by the governance lead.

Raw audio is deleted within 24 hours of successful transcription, unless the user has explicitly opted in to retention through the consent flow described in `DESIGN.md`. Transcripts may be retained but must be deletable on user request through a documented endpoint.

Every prompt sent to an LLM is versioned and stored in `apps/service/prompts/`, with the prompt file named after the function that uses it. Prompts are not inlined into Python code, since this makes them invisible to the agentic reviewer and impossible to evaluate.

## 7. Testing and CI Gates

Three gates must pass before any PR is mergeable: `make test`, `make lint`, and `make validate-factory`. The validate-factory script checks that every feature has a spec, every spec has a plan, and every plan has at least one referencing PR.

LLM-touching code requires at least one golden-example evaluation in `evals/`, wherein a known input is run through the chain and the output is checked against a manually-graded expected result. This catches prompt regressions that unit tests miss.

Tests for voice transcription must include at least one Filipino-only sample, one English-only sample, and one Taglish code-switching sample, since the language handling is the core differentiator and it is exactly the kind of thing that quietly breaks when a model is updated.

## 8. Agentic Code Review Loop

Every PR is reviewed by the `agentic-code-review` skill before a human merges it. The reviewer agent has read access to the diff, the referenced spec, and the referenced plan, and is expected to comment on drift between the diff and the plan, missing tests, violations of `AGENTS.md` or `DESIGN.md`, and accessibility regressions.

A human reviewer must still approve the merge. The agent is a force multiplier, not a substitute. If the agent and the human disagree, the disagreement is logged in the PR and resolved by the relevant domain owner.

## 9. MCP and Tool Boundaries

External tools are governed by `mcp/policy.md`, which lists each approved tool, the data that may flow to it, the permissions it has, and the fallback behavior on failure. The current approved set is OpenAI Whisper API for transcription, OpenAI or Anthropic API for LLM calls, Mapbox or Google Maps for the job map, and a self-hosted PostgreSQL plus pgvector for storage.

Adding a new external tool requires a use case, a plan, and an explicit entry in `mcp/policy.md`. No agent may invoke an undeclared tool, and the validate-factory script flags any code path that calls an external domain not listed in policy.

## 10. Data Handling and Privacy

User voice data is biometric, which means it is treated with the highest level of caution. The consent flow is oral, since written consent does not work for low-literacy users, and the consent recording is itself stored as evidence of the user's agreement.

Users may delete all their data through a documented endpoint, and deletion is hard delete, not soft delete, towards the goal that we do not retain data beyond what the user expects.

Aggregated, anonymized analytics may be used to improve the product, but no individual user's voice, transcript, or skill profile may be used to train any model without an explicit and documented consent that is separate from the consent to use the service.

## 11. Inclusivity and Accessibility Rules

Every UI surface must work without reading, basically the user must be able to navigate using voice cues and large tappable elements alone. This is enforced by `DESIGN.md` and verified during agentic review.

Filipino, Taglish, and English are first-class languages with equal support. Adding support for at least one regional language, likely Cebuano given its speaker count, is a stretch goal for the MDP and a hard requirement for any post-hackathon version.

Offline-first behavior is required for voice capture, wherein recording must work without network and queue for upload when connectivity returns, since a lot of target users have intermittent connectivity.

## 12. Commits and Pull Requests

Commit messages follow conventional commits format, basically `feat:`, `fix:`, `docs:`, `chore:`, and so on, with a short summary on the first line and details in the body. PRs reference the spec and plan they implement in the description, and the description includes a checklist of acceptance criteria from the spec.

Branch names follow the pattern `<owner-initials>/<use-case-id>-<short-description>`, for example `jp/uc-001-voice-onboarding`.

The main branch is protected. Force pushes are disabled, direct pushes are disabled, and merges require at least one human approval and a passing CI run.

## 13. Lessons Learned

Recurring issues, unexpected debugging, prompt failures, and accessibility findings are promoted into the appropriate factory surface. A lesson that recurs twice becomes a documentation entry. A lesson that recurs three times becomes a skill, a rule, or an automated test.

The governance lead reviews the lessons log weekly and proposes promotions. The team approves promotions in standup or asynchronously through PR.

## 14. Forbidden Practices

The following are forbidden regardless of time pressure or perceived expedience: skipping spec authorship, merging a PR without agentic review, hardcoding API keys, sending raw audio to undeclared services, retaining voice recordings beyond 24 hours without consent, calling LLMs from the frontend, training any model on user data without separate consent, and disabling CI gates.

A team member who notices a forbidden practice is expected to flag it, and the practice must be reverted before any further work proceeds.
