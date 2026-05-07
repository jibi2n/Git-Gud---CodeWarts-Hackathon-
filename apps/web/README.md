# apps/web

**Owner:** Role 3 (Frontend Engineer)

Next.js + TypeScript + Tailwind + shadcn/ui frontend.

## Bootstrap

```bash
cd apps/web
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
npx shadcn@latest init
```

## Hard rules

- **Never** call OpenAI, Anthropic, or Whisper from frontend code. All AI traffic goes through `apps/service/` (AGENTS.md §6).
- Voice recording uses `MediaRecorder` with offline queue + service worker.
- All tap targets ≥ 48 × 48 dp.
- Filipino, Taglish, English equally supported. No upfront language selection.

See [DESIGN.md](../../DESIGN.md) for the full taste contract.
