# apps/web

**Owner:** Role 3 (Frontend Engineer). See [DESIGN.md](../../DESIGN.md) for the full contract.

This is the Next.js 14 client for Boses. It currently runs in **demo mode** (fake transcripts / competencies / scores from `lib/demo-fixtures.ts`) so the end-to-end flow is walkable before the FastAPI ML service is wired up.

## Run it

```powershell
cd apps\web
npm install
npm run dev
```

Open http://localhost:3000.

You should see:
1. Landing with two consent toggles → enable both → tap **Magsimula**.
2. `/record` with a single big mic button → tap to start the demo flow.
3. `/processing` walks through three stages (~2.5s of fake delay).
4. `/profile/[sessionId]` shows fake competencies, a TESDA readiness score, and job archetypes.

## Demo mode vs real mode

| Env | Behavior |
|---|---|
| `ML_SERVICE_URL` unset (default) | API routes return fake fixtures from `lib/demo-fixtures.ts` |
| `ML_SERVICE_URL=http://localhost:8000` | API routes forward to the FastAPI service |

Copy `.env.local.example` to `.env.local` to flip into real mode.

## What's stubbed vs real

| Surface | State |
|---|---|
| Landing + consent gate | **Real** — matches DESIGN.md §11.1 |
| Session API (`/api/session`) | Real shape; persistence is in-memory only (no Supabase yet) |
| Voice recorder | **Stub** — single fake mic button, no MediaRecorder. Role 3 implements `<VoiceRecorder>` per DESIGN.md §5.3. |
| Document camera | **Not built** — Role 3 |
| Processing screen | Real UI; calls real API routes (which return fixtures) |
| Profile + competency editor | Real shell; full editor with confirm/reject/edit/add per DESIGN.md §5.3 is **stub** (only reject toggle works) |
| PDF export | **Not built** — Role 3, post-processing screen |
| Supabase storage / DB | **Not wired** — Role 3 + Role 2 |

## Stack (locked by DESIGN.md §3)

Next.js 14 App Router · TypeScript strict · Tailwind · Zustand · clsx + tailwind-merge · lucide-react. shadcn/ui to be initialized by Role 3.

## Hard rules

- **Never** call OpenAI / Anthropic / Whisper / vision providers from frontend code. All AI traffic goes through `apps/service/` via the Next.js API routes (AGENTS.md §6, DESIGN.md §11.3).
- All copy lives in `locales/tl.ts` — no hardcoded strings.
- All data shapes mirror `apps/service/main.py` Pydantic models. The contract is in [docs/system-overview.md](../../docs/system-overview.md).
