# llm/

**Owner:** Role 1 & 4 (ML/AI Engineer)

Provider-agnostic LLM client. The single seam through which the service talks to OpenAI or Anthropic. Swap providers here, never in feature code.

Responsibilities:
- Auth + retry + rate limit
- Loading prompts from [../prompts/](../prompts/) by name
- Logging prompt + response for evals (no PII beyond transcript)
