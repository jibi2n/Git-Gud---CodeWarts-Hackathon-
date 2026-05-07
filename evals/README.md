# evals/

Golden-example evaluations for LLM-touching code. Required by [AGENTS.md](../AGENTS.md) §7.

Each eval is a JSON file with:
- `name` — short identifier
- `input` — the input passed to the chain
- `expected` — manually graded expected output (or rubric)
- `language` — one of `fil`, `en`, `taglish`

Coverage rule: any eval set covering skill extraction or transcription **must** include at least one Filipino-only, one English-only, and one Taglish sample.
