# Boses — Frontend Design Document

**Scope**: Next.js 14 client application (`boses-web`)
**Owner**: Frontend Engineer (Role 3)
**Status**: Pre-implementation
**Companion docs**: `system-overview.md` (authoritative for architecture, data contracts, scope)

---

## 0. How to Use This Document

This document defines **what** the Boses frontend is and **how** it is built. It is the source of truth for the Next.js client. When an AI agent or engineer makes a decision that contradicts this document, this document wins. When it contradicts `system-overview.md`, `system-overview.md` wins.

If something is undefined here, treat it as a deliberate gap — ask before inventing.

---

## 1. Goals & Non-Goals

### 1.1 Goals

1. Deliver a mobile-first, voice-first web client that works on a low-end Android phone over 3G.
2. Capture voice narrative and document images, hand them to the ML service, and present a structured Boses Profile back to the user.
3. Make the AI-extracted output **editable by the user** before any export — human-in-the-loop is a hard ethical requirement, not a feature.
4. Export a clean, professional PDF profile the user can use as a de facto resume.
5. Be demo-ready: one end-to-end happy path that does not break in front of judges.

### 1.2 Non-Goals (Hackathon Scope)

- No password-based authentication. Phone-number session ID only.
- No multi-language toggle. Taglish only.
- No employer-side surface.
- No company map / pin-based job browser.
- No multi-track readiness scoring. One TESDA track only.
- No social sharing, no analytics dashboards, no admin panel.

These are deliberately deferred. Do not add them.

---

## 2. Architectural Position

```
   ┌──────────────────────────────┐
   │   Mobile Browser (User)      │
   └──────────────┬───────────────┘
                  │
                  ▼
   ┌──────────────────────────────┐
   │   Next.js 14 Client          │  ← THIS DOCUMENT
   │   - React Server Components  │
   │   - Client components for    │
   │     media, forms, state      │
   │   - API route handlers       │
   └──────┬───────────────┬───────┘
          │               │
          ▼               ▼
   ┌────────────┐   ┌──────────────┐
   │ Supabase   │   │ FastAPI ML   │
   │ (Storage,  │   │ Service      │
   │  Postgres) │   │ (Python)     │
   └────────────┘   └──────────────┘
```

The frontend is responsible for:
- All UI surfaces
- Media capture (audio, image)
- Direct uploads to Supabase Storage
- Orchestration calls to the FastAPI ML service via Next.js API routes
- Profile rendering and PDF export
- Consent and human-in-the-loop correction interfaces

The frontend is **not** responsible for:
- Any ML inference (lives in FastAPI)
- TESDA competency standard parsing (lives in FastAPI)
- Long-term data retention policy (lives at Supabase configuration)

---

## 3. Tech Stack (Locked)

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14, App Router | SSR, RSC, API routes in one codebase |
| Language | TypeScript, strict mode | Demo safety; ML pipeline costs are too high to lose to runtime errors |
| Styling | Tailwind CSS | Speed, consistency, mobile utility classes |
| Components | shadcn/ui | Accessible primitives, owned in-repo |
| Client state | Zustand | Lightweight, no Context boilerplate |
| Forms | react-hook-form + zod | Validation parity with backend Pydantic models |
| Media | MediaRecorder API, getUserMedia | Native browser, no library bloat |
| PDF | @react-pdf/renderer | Server-side generation possible, no headless browser |
| Storage SDK | @supabase/supabase-js | Direct upload from client to Storage |
| HTTP | native `fetch` | No axios |
| Icons | lucide-react | shadcn-compatible |

**Forbidden in this codebase**: Redux, MUI, Bootstrap, Chakra, axios, Moment.js, Lodash (use native ES methods).

---

## 4. Information Architecture

### 4.1 Route Map

```
/                         → Landing + consent (Server Component shell, Client islands)
/record                   → Voice capture (Client Component, requires consent)
/documents                → Document capture (Client Component, optional step)
/processing               → Processing screen with live status (Client Component)
/profile/[sessionId]      → Boses Profile view + edit (Client Component)
/profile/[sessionId]/pdf  → PDF preview / download trigger
/api/session              → POST: create session (phone-number based)
/api/transcribe           → POST: forward audio URL to FastAPI /transcribe
/api/extract              → POST: forward transcript to FastAPI /extract
/api/vision               → POST: forward image URL to FastAPI /vision
/api/score                → POST: send confirmed competencies to FastAPI /score
/api/profile/[sessionId]  → GET / PATCH: profile read + user edits
/api/pdf/[sessionId]      → GET: rendered PDF stream
```

### 4.2 Navigation Flow

```
Landing ─▶ Consent gate ─▶ Session created
                              │
                              ▼
                          Voice Capture ──▶ (optional) Document Capture
                                                       │
                                                       ▼
                                                  Processing
                                                       │
                                                       ▼
                                          Profile View (editable)
                                                       │
                                                       ▼
                                                  PDF Export
```

There is no hamburger menu, no header nav. The flow is linear by design — informal-sector users with low digital literacy do not benefit from optional navigation.

A persistent footer offers two actions only: **Burahin ang data** (delete data) and **Tulong** (help / re-narrate consent).

---

## 5. Component Architecture

### 5.1 Directory Layout

```
boses-web/
├── app/
│   ├── layout.tsx                  # Root layout, providers
│   ├── page.tsx                    # Landing
│   ├── record/page.tsx
│   ├── documents/page.tsx
│   ├── processing/page.tsx
│   ├── profile/[sessionId]/page.tsx
│   ├── profile/[sessionId]/pdf/page.tsx
│   └── api/
│       ├── session/route.ts
│       ├── transcribe/route.ts
│       ├── extract/route.ts
│       ├── vision/route.ts
│       ├── score/route.ts
│       ├── profile/[sessionId]/route.ts
│       └── pdf/[sessionId]/route.ts
├── components/
│   ├── ui/                         # shadcn primitives (Button, Card, Dialog, etc.)
│   ├── consent/
│   │   ├── ConsentGate.tsx
│   │   └── ConsentNarrator.tsx
│   ├── recorder/
│   │   ├── VoiceRecorder.tsx
│   │   ├── WaveformVisualizer.tsx
│   │   └── RecordingControls.tsx
│   ├── camera/
│   │   ├── DocumentCamera.tsx
│   │   ├── CaptureGuide.tsx
│   │   └── DocumentList.tsx
│   ├── processing/
│   │   ├── ProcessingStepper.tsx
│   │   └── NarratedStatus.tsx
│   ├── profile/
│   │   ├── CompetencyList.tsx
│   │   ├── CompetencyEditor.tsx
│   │   ├── ReadinessScoreCard.tsx
│   │   ├── JobSuggestionCard.tsx
│   │   └── ProfileHeader.tsx
│   ├── pdf/
│   │   └── BosesProfilePDF.tsx     # @react-pdf/renderer document
│   └── shared/
│       ├── BigButton.tsx           # 56px+ touch target primary action
│       ├── TaglishCopy.tsx         # i18n-aware text component
│       └── ErrorBoundary.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── api/
│   │   ├── ml-client.ts            # Typed FastAPI client
│   │   └── contracts.ts            # Re-exports types from /types
│   ├── audio/
│   │   ├── recorder.ts             # MediaRecorder wrapper
│   │   └── upload.ts
│   ├── camera/
│   │   ├── capture.ts
│   │   └── upload.ts
│   ├── pdf/
│   │   └── generate.ts
│   └── utils.ts
├── stores/
│   ├── session-store.ts            # Zustand: sessionId, phone, consent state
│   ├── capture-store.ts            # Zustand: audio blob, document blobs
│   └── profile-store.ts            # Zustand: profile, edits, dirty state
├── types/
│   ├── api.ts                      # Mirrors FastAPI Pydantic models
│   └── domain.ts                   # Frontend-only types
├── locales/
│   ├── tl.ts                       # Primary
│   └── en.ts                       # Fallback / debug
├── public/
│   ├── audio/
│   │   ├── consent-explainer.mp3   # Tagalog narrated consent
│   │   └── recording-tips.mp3
│   └── icons/
└── styles/
    └── globals.css
```

### 5.2 Component Boundary Rules

- **Server Components by default.** Add `"use client"` only when the component needs state, effects, or browser APIs.
- **No prop drilling beyond two levels.** Use Zustand for cross-cutting state.
- **Media components are always client components** and must handle SSR-safe imports for `MediaRecorder`, `navigator.mediaDevices`, and `@react-pdf/renderer`.
- **No business logic in components.** Logic lives in `lib/` or stores.

### 5.3 Component Contracts (Selected)

**`<VoiceRecorder>`**
```typescript
type VoiceRecorderProps = {
  maxDurationSec?: number;           // default 180
  onComplete: (blob: Blob, durationSec: number) => void;
  onError: (err: RecorderError) => void;
};
```
- Renders a single large record button (≥56px), waveform visualizer when active, timer.
- Handles permission request, denial fallback, mid-recording errors.
- Emits a `Blob` of type `audio/webm;codecs=opus`. Does not upload.

**`<DocumentCamera>`**
```typescript
type DocumentCameraProps = {
  maxImages?: number;                // default 5
  onAdd: (file: File) => void;
  onSkip: () => void;
};
```
- Uses `getUserMedia` with environment-facing camera preference.
- Falls back to file input on permission denial.
- Includes a capture-guide overlay rectangle.

**`<CompetencyEditor>`**
```typescript
type CompetencyEditorProps = {
  competencies: Competency[];
  onConfirm: (final: Competency[]) => void;
};
```
- Lists competencies as toggleable cards. User can:
  - Confirm (default state for high-confidence items)
  - Reject (low confidence or wrong)
  - Edit label (Taglish + English)
  - Add a new competency manually
- Surfaces the `evidenceSpan` from the transcript so the user understands why a competency was suggested.

---

## 6. State Management

Three Zustand stores. Boundaries are strict; no cross-store reads.

### 6.1 `session-store`
```typescript
type SessionState = {
  sessionId: string | null;
  phoneNumber: string | null;
  consent: { voice: boolean; image: boolean; timestamp: string | null };
  setSession(id: string, phone: string): void;
  grantConsent(kind: "voice" | "image"): void;
  reset(): void;
};
```

### 6.2 `capture-store`
```typescript
type CaptureState = {
  audioBlob: Blob | null;
  audioUrl: string | null;            // Supabase URL after upload
  audioUploadStatus: "idle" | "uploading" | "uploaded" | "error";
  documents: Array<{
    id: string;
    file: File;
    url: string | null;
    uploadStatus: "idle" | "uploading" | "uploaded" | "error";
  }>;
  setAudio(blob: Blob): void;
  setAudioUrl(url: string): void;
  addDocument(file: File): void;
  removeDocument(id: string): void;
  reset(): void;
};
```

### 6.3 `profile-store`
```typescript
type ProfileState = {
  profile: BosesProfile | null;
  pendingEdits: {
    confirmedCompetencyIds: Set<string>;
    rejectedCompetencyIds: Set<string>;
    editedLabels: Record<string, string>;
    addedCompetencies: Competency[];
  };
  isDirty: boolean;
  loadProfile(profile: BosesProfile): void;
  toggleCompetency(id: string, state: "confirm" | "reject"): void;
  editLabel(id: string, label: string): void;
  addCompetency(c: Competency): void;
  commitEdits(): Competency[];        // returns the final competency list to send to /score
  reset(): void;
};
```

### 6.4 Persistence

- `session-store`: persisted to `localStorage` (key: `boses.session`). Survives reload.
- `capture-store`: **not persisted**. Blobs do not serialize. On reload, user restarts capture.
- `profile-store`: not persisted; refetched from `/api/profile/[sessionId]` on mount.

---

## 7. Data Flow Walkthrough

This is the **canonical demo path**. Every component must support this flow without modification.

```
1. User lands on /. Sees Tagalog explainer + two consent toggles.
2. Both toggles ON → "Magsimula" button enabled.
3. Click → POST /api/session → creates session row, returns sessionId.
4. Redirect to /record.
5. User records voice (up to 3min). Blob held in capture-store.
6. On stop → upload blob to Supabase Storage → audioUrl set.
7. Click "Susunod" → redirect to /documents.
8. User captures 0–5 images. Each uploads independently.
9. Click "Tapos na" → redirect to /processing.
10. /processing fires sequentially (UI shows live status):
    a. POST /api/transcribe { audioUrl } → transcript
    b. POST /api/extract { transcript } → competencies
    c. For each document: POST /api/vision { imageUrl } → DocumentResponse
    d. Merge inferredCompetencies from documents with extracted competencies
       (dedupe by englishLabel; keep higher confidence)
11. Once merged: redirect to /profile/[sessionId] with competencies pre-loaded.
12. User reviews/edits competencies in CompetencyEditor.
13. Click "Tingnan ang kahandaan" → POST /api/score { competencies: final }
    → ReadinessScores + JobSuggestions returned, displayed.
14. User clicks "I-download ang PDF" → GET /api/pdf/[sessionId] → file download.
```

### 7.1 Failure Recovery Points

| Step | Failure | Recovery |
|---|---|---|
| 3 | Session creation fails | Retry button; if persistent, surface error and offer offline mode (capture only, no upload) |
| 6 | Audio upload fails | Retry up to 2x with exponential backoff; if all fail, allow user to continue but flag profile as "voice missing" |
| 10a | Transcription returns empty | Surface "Hindi ka naintindihan ng Boses" screen with re-record option |
| 10b | Extraction returns 0 competencies | Show "Hindi pa nakikita ang skills mo" with prompt to re-record OR add manually |
| 10c | Vision call fails | Skip that document silently, log it, continue |
| 13 | Score call fails | Show retry; do not lose user's edits |

---

## 8. Mobile-First Design System

### 8.1 Breakpoints

Designed at 360px width (low-end Android). All layouts must work at 360px before any larger breakpoint is considered.

```
xs: 360px   (target)
sm: 640px
md: 768px
lg: 1024px+ (desktop, judging room)
```

### 8.2 Touch Targets

- Primary actions: minimum 56×56px
- Secondary actions: minimum 44×44px
- Interactive list items: minimum 48px height
- Spacing between tap targets: minimum 8px

### 8.3 Typography

Reference: GitHub Primer's type system, modernized.

**Font stack** (no web fonts on critical path):

```
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
             "Helvetica Neue", Arial, sans-serif;
--font-mono: ui-monospace, "SF Mono", "Cascadia Code", "Roboto Mono",
             Consolas, monospace;
```

Inter is loaded via `next/font/local` (self-hosted, no Google Fonts request). System stack renders during font load — no FOIT. Mono is used only for the session ID display and any debug surfaces.

**Type scale** (semantic, not pixel-named):

```
Display:    30px / 1.25 / 600   — page titles only, one per screen
Heading:    20px / 1.30 / 600   — section headings
Subheading: 17px / 1.40 / 500   — card titles, list group headers
Body:       16px / 1.50 / 400   — default; never go smaller
Body-strong:16px / 1.50 / 500   — emphasis without color
Caption:    13px / 1.40 / 400   — timestamps, metadata, helper text
Mono:       14px / 1.40 / 400   — session ID, technical strings
```

Letter-spacing: -0.011em on Display and Heading (Inter renders tight at large sizes). Default elsewhere.

No font below 13px anywhere. Caption is reserved for non-essential text — never put actionable content in caption size.

### 8.4 Color System

Reference: GitHub's `light_high_contrast` Primer theme. The palette is intentionally restrained — neutrals do most of the work, with a single accent for primary actions and semantic colors for status.

**Light mode (default):**

```
/* Foreground */
--fg-default:        #0E1116    /* primary text */
--fg-muted:          #3D434A    /* secondary text, captions */
--fg-subtle:         #66707B    /* placeholder, disabled */
--fg-on-emphasis:    #FFFFFF    /* text on filled accent */

/* Background */
--bg-canvas:         #FFFFFF    /* page background */
--bg-default:        #FFFFFF    /* surface */
--bg-subtle:         #F6F8FA    /* card alt, hover */
--bg-muted:          #E7ECF0    /* dividers as surface */
--bg-emphasis:       #0E1116    /* high-contrast filled surface */

/* Border */
--border-default:    #20252C    /* primary borders */
--border-muted:      #88929D    /* secondary borders */
--border-subtle:     rgba(1, 4, 9, 0.15)

/* Accent (single accent — used sparingly) */
--accent-fg:         #0349B4    /* link text, accent text */
--accent-emphasis:   #0349B4    /* primary button bg */
--accent-muted:      #368CF9    /* hover state */
--accent-subtle:     #DDF4FF    /* accent surface, badges */

/* Semantic */
--success-fg:        #055D20
--success-emphasis:  #055D20
--success-subtle:    #DAFBE1
--attention-fg:      #693E00    /* warning */
--attention-emphasis:#693E00
--attention-subtle:  #FFF1C2
--danger-fg:         #B30021
--danger-emphasis:   #B30021
--danger-subtle:     #FFEBE9
```

**Dark mode** (defer to post-hackathon; specify only if time permits):

```
--fg-default:        #F0F3F6
--bg-canvas:         #0A0C10
--bg-default:        #0A0C10
--bg-subtle:         #272B33
--border-default:    #7A828E
--accent-fg:         #71B7FF
--accent-emphasis:   #409EFF
```

**Tailwind integration** — extend the theme rather than override it. In `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      fg: {
        DEFAULT: "var(--fg-default)",
        muted: "var(--fg-muted)",
        subtle: "var(--fg-subtle)",
        onEmphasis: "var(--fg-on-emphasis)",
      },
      bg: {
        canvas: "var(--bg-canvas)",
        DEFAULT: "var(--bg-default)",
        subtle: "var(--bg-subtle)",
        muted: "var(--bg-muted)",
        emphasis: "var(--bg-emphasis)",
      },
      border: {
        DEFAULT: "var(--border-default)",
        muted: "var(--border-muted)",
        subtle: "var(--border-subtle)",
      },
      accent: {
        fg: "var(--accent-fg)",
        emphasis: "var(--accent-emphasis)",
        muted: "var(--accent-muted)",
        subtle: "var(--accent-subtle)",
      },
      success: {
        fg: "var(--success-fg)",
        emphasis: "var(--success-emphasis)",
        subtle: "var(--success-subtle)",
      },
      attention: {
        fg: "var(--attention-fg)",
        emphasis: "var(--attention-emphasis)",
        subtle: "var(--attention-subtle)",
      },
      danger: {
        fg: "var(--danger-fg)",
        emphasis: "var(--danger-emphasis)",
        subtle: "var(--danger-subtle)",
      },
    },
  },
},
```

Usage: `bg-bg-subtle`, `text-fg-muted`, `border-border-default`, `bg-accent-emphasis text-fg-onEmphasis`.

### 8.5 Color Usage Rules

These are not suggestions — they are how the design holds together visually.

1. **Neutrals carry 90% of the UI.** White surfaces, dark text, neutral borders. Color is for action and status, not decoration.
2. **One accent color, used sparingly.** `accent-emphasis` appears on the primary action of a screen — usually one button. Never two primary actions in the same view.
3. **Semantic colors only convey semantic meaning.** Green is success outcomes (competency confirmed), amber is caution (low-confidence AI extraction), red is destructive or error. Never use them decoratively.
4. **High-contrast borders by default.** GitHub high-contrast uses near-black borders (`#20252C`) instead of the soft grays most design systems default to. This is a deliberate accessibility choice — keep it.
5. **No gradients, no shadows beyond `shadow-sm`.** Flat surfaces with strong borders. Modern, restrained, fast to render on low-end devices.
6. **No color-only states.** Confirmed competency = green border + checkmark icon + "Confirmed" text. Never rely on the green alone.
7. **Contrast minimums**: 7:1 for body text against background (AAA), 4.5:1 minimum for large text and UI elements. The GitHub HC palette already meets this — don't introduce custom colors that break it.

### 8.6 Component Style Primitives

Defaults that components inherit unless overridden:

```
Border radius:   6px (rounded-md)   — buttons, inputs, cards
Border width:    1px standard, 2px on focus rings
Focus ring:      2px solid var(--accent-emphasis), 2px offset
Shadow:          none default; shadow-sm only for elevated dialogs
Transitions:     150ms ease for color/border, 200ms for transform
                 disabled when prefers-reduced-motion
```

Buttons:
- **Primary**: `bg-accent-emphasis text-fg-onEmphasis border-accent-emphasis`
- **Secondary**: `bg-bg-default text-fg-default border-border-default`
- **Destructive**: `bg-danger-emphasis text-fg-onEmphasis border-danger-emphasis`
- **Ghost**: `bg-transparent text-fg-default border-transparent hover:bg-bg-subtle`

All buttons share the same height tier (56px primary, 44px secondary) and the same border radius. Shape consistency is what makes a system feel modern; color variation is what makes it feel chaotic.

Inputs:
- 1px `border-border-default` base
- 2px `border-accent-emphasis` focused
- 2px `border-danger-emphasis` invalid
- Background always `bg-bg-default` — no filled inputs

Cards (used for competency items, score cards):
- 1px `border-border-default`, no shadow
- `bg-bg-default` default, `bg-bg-subtle` on hover for interactive cards
- Selected state: 2px border + `bg-accent-subtle` background

### 8.7 Iconography

`lucide-react`, stroke width 1.75, size 20px in body context, 24px in primary actions.

**No emojis anywhere in the product** — not in copy, not as status indicators, not in the PDF, not in error messages. Icons only. This is enforced via lint rule (`no-emoji-regex` ESLint plugin) and reviewed in PRs.

Rationale: emojis render inconsistently across Android versions common in the target market, carry tonal connotations that conflict with the dignified register of the product, and weaken the design system by introducing uncontrolled visual elements.

### 8.8 Voice/Tone in UI Copy

- Address the user as **ikaw**, not po/opo formal register. They are a peer.
- Use Taglish naturally: "Magrecord ka muna", "Eto na ang skills mo", "Pwede mong i-edit kung mali".
- Never use "uplift", "empower", "beneficiary", "underprivileged" framing.
- Never apologize for the user's circumstances.
- Errors are short and actionable: "Hindi nakuha ang recording. Subukan ulit?"

All copy lives in `locales/tl.ts`. No hardcoded strings in components.

---

## 9. Accessibility Requirements

- **Voice fallback**: every voice flow has a text input fallback ("I-type na lang").
- **Text fallback**: every text-heavy screen has an audio narrator option (pre-recorded or Web Speech API).
- **Semantic HTML**: use `<button>`, `<nav>`, `<main>`, `<section>` correctly. No `<div onClick>`.
- **ARIA labels** on all icon-only buttons.
- **Focus states** must be visible. Do not remove focus rings.
- **Recording state must be announced** via `aria-live="polite"` for screen reader users.
- **No motion-required interactions** (no shake, no swipe-only). Tap works for everything.
- **Reduced motion**: respect `prefers-reduced-motion` for waveform and processing animations.

---

## 10. Performance Budget

| Metric | Budget |
|---|---|
| First Contentful Paint (3G) | ≤ 2.0s |
| Time to Interactive (3G) | ≤ 4.0s |
| JS bundle (initial) | ≤ 180KB gzipped |
| Largest image | ≤ 100KB |
| Total page weight (landing) | ≤ 500KB |

Tactics:
- Lazy-load `@react-pdf/renderer` (only on PDF route).
- Lazy-load camera and recorder libs only on their respective routes.
- No font files on landing — system font until interaction.
- Compress audio to opus (default) before upload.
- Resize images client-side to max 1920px before upload.

---

## 11. Security & Privacy (Frontend Surface)

### 11.1 Consent Implementation

Two separate consent toggles, both required to proceed past landing. Each linked to a `<Dialog>` with full Tagalog explanation:

- **Voice**: "Bibigyan mo kami ng pahintulot na irecord at iproseso ang boses mo. Hindi namin ito ipagbibili o ibibigay sa iba."
- **Image**: "Pahintulot mo ba na kunan ng litrato ang mga dokumento mo? Itatabi natin ito sa ligtas na lugar."

Consent state is stored in `session-store` AND posted to backend with timestamp. Audit trail matters for RA 10173 compliance.

### 11.2 Data Deletion

The footer **Burahin ang data** action:
1. Confirms via Dialog.
2. Calls `DELETE /api/profile/[sessionId]` which deletes Postgres rows AND Storage objects.
3. Clears all stores.
4. Redirects to landing.

This must work end-to-end in the demo. Judges may ask.

### 11.3 No Tracking

- No Google Analytics, no PostHog, no Mixpanel on the production demo build.
- No third-party scripts beyond Supabase and the FastAPI service.
- `Content-Security-Policy` header configured to deny external scripts.

### 11.4 AI Output Marking

Every AI-extracted competency carries a visible label: **"Nahanap ng AI — pakitingnan"** until the user confirms it. Confirmed competencies lose the label.

The PDF export only includes **user-confirmed** competencies. Rejected and unreviewed AI output is excluded.

---

## 12. Error & Empty States

Every screen must explicitly handle:

1. **Loading**: skeleton or narrated status. No spinner alone.
2. **Empty**: contextual message + a clear next action.
3. **Error**: short Taglish message + retry button + fallback path.
4. **Partial**: e.g., voice succeeded but no documents — proceed gracefully.

No "Something went wrong" messages. Always specific.

---

## 13. PDF Output Specification

The exported PDF (`BosesProfilePDF`) is a **single-page A4 portrait** document with:

```
┌───────────────────────────────────────┐
│  [Header: Name (or phone-derived ID)] │
│  Boses Profile · Generated YYYY-MM-DD │
├───────────────────────────────────────┤
│  ABILITIES                            │
│  • [Confirmed competency 1]           │
│  • [Confirmed competency 2]           │
│  • ...                                │
├───────────────────────────────────────┤
│  TESDA READINESS                      │
│  [Cert name]: [score]/100             │
│  Strengths: ...                       │
│  Areas to develop: ...                │
├───────────────────────────────────────┤
│  RECOMMENDED ROLES                    │
│  • [Job archetype 1] — [reasoning]    │
│  • [Job archetype 2] — [reasoning]    │
├───────────────────────────────────────┤
│  Footer: "Generated by Boses. AI-     │
│  assisted, user-verified."            │
└───────────────────────────────────────┘
```

- English-language output (employers expect English resumes).
- No "AI-generated" warnings beyond footer disclosure.
- Rendered server-side via `@react-pdf/renderer` for consistency.

---

## 14. Testing Strategy (Hackathon-Adjusted)

Full test suites are out of scope. Required:

- **One Playwright happy-path test** that runs the full demo flow with mocked ML responses. Must pass before demo.
- **Manual QA checklist** in `QA.md` covering:
  - Permission denial paths (mic, camera)
  - Network failure during upload
  - Empty competency extraction
  - PDF export
  - Data deletion
- **Type-check on commit**. `tsc --noEmit` in CI.

No unit tests on UI components. Tests on `lib/` modules where logic is non-trivial (audio upload retry, competency dedupe).

---

## 15. Deployment

- Vercel project, Production branch = `main`.
- Environment variables (Vercel dashboard):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
  - `ML_SERVICE_URL` (FastAPI base URL on Modal/Railway)
  - `ML_SERVICE_API_KEY` (shared secret with FastAPI)
- Preview deploys on every PR.
- Custom domain optional; `*.vercel.app` is acceptable for demo.

---

## 16. Open Questions (Resolve Before Implementation)

These need answers from the team — flagged so they don't ambush you mid-build:

1. **Which TESDA track?** Frontend needs the cert name and matched/missing competency taxonomy for Section 13 (PDF) and ReadinessScoreCard. Decide Day 1 with the CV/Data Science teammate.
2. **Phone number verification?** Currently spec'd as no-OTP (just used as a session key). Confirm with team — if OTP is added, login flow expands.
3. **Consent narration audio**: who records the Tagalog explainer? Frontend can ship with on-device TTS as fallback, but a real human voice recording is dramatically better for the demo.
4. **PDF generation location**: server-side (in `/api/pdf`) or client-side download? Server-side is cleaner but adds latency. Recommend client-side for demo.
5. **Offline queue**: spec'd in Section 8 (Non-Functional). Is this in scope for hackathon, or deferred? Recommend defer; mark as graceful-fail-with-retry only.

---

## 17. Build Order (Frontend, 48h Hackathon)

A suggested sequencing. Each phase ends with a demoable artifact.

**Phase 1 — Skeleton (hours 0–6)**
- Repo init, Tailwind, shadcn, Zustand stores
- Route map scaffolding with placeholder pages
- Locale files set up
- Consent gate working
- Session creation API route + Supabase session row

**Phase 2 — Capture (hours 6–18)**
- VoiceRecorder fully working with upload to Supabase
- DocumentCamera fully working with upload
- Capture store integrated, navigation flow complete
- Mock ML responses for downstream development

**Phase 3 — Profile + Edit (hours 18–30)**
- ProcessingStepper with mock then real ML calls
- CompetencyEditor with confirm/reject/edit
- ReadinessScoreCard, JobSuggestionCard
- Profile store + commit-edits flow

**Phase 4 — PDF + Polish (hours 30–42)**
- BosesProfilePDF rendering
- Error states across all screens
- Data deletion flow
- Tagalog copy review pass
- Performance audit (Lighthouse on 3G throttle)

**Phase 5 — Demo Hardening (hours 42–48)**
- Playwright happy-path
- Pre-record demo voice samples for offline fallback
- Coordinate with team on full pipeline test
- Backup plan: pre-cached profile if live ML fails

Do not start Phase 4 before Phase 3 is complete. Do not skip Phase 5.

---

## 18. References

- `system-overview.md` — system-level architecture and data contracts
- TESDA Training Regulations (publicly available per cert track) — competency taxonomy source
- RA 10173 (Data Privacy Act of 2012) — consent and retention requirements
- WCAG 2.1 AA — accessibility baseline
- shadcn/ui docs — component primitives
- Next.js 14 App Router docs — routing and RSC patterns

---

*This document is the frontend contract. Update it before the code, not after.*
