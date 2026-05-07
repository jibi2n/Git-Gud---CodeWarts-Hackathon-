# prompts/

**Owner:** Role 1 & 4 (ML/AI Engineer)

One file per prompt, named after the function that uses it.

Hard rule (AGENTS.md §6): **prompts are never inlined into Python code.** Inlining hides them from version control diffs and the agentic reviewer, and makes evaluation impossible.

Filename convention: `<function_name>.md` (e.g. `extract_skills.md`, `rephrase_skill.md`).

Each file includes the prompt body, the model it targets, and the expected output schema.
