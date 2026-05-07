# Use Case 001 — Voice Onboarding

**Owners:** Role 2 (transcription) + Role 3 (UI)
**Status:** Draft
**Plan:** [plans/PLAN_USE_CASE_001.md](../../plans/PLAN_USE_CASE_001.md) *(to be written)*

## User Story

As a Filipino informal-sector worker, I want to tell my story by speaking in Taglish, so I do not need to type or read English to use Boses.

## User Flow

1. User completes the consent gate on landing (`/`) and a session is created (`POST /api/session`).
2. User lands on `/record` and sees a single large microphone button (≥56px) per [DESIGN.md](../../DESIGN.md) §8.2.
3. User taps the mic and speaks (up to 3 minutes per DESIGN.md §5.3 component contract).
4. On stop, the audio Blob (`audio/webm;codecs=opus`) uploads directly to Supabase Storage via the client SDK.
5. The Next.js API route forwards the audio URL to `POST /transcribe` on the FastAPI service.
6. The backend calls Whisper, returns the transcript, and **deletes the raw audio object within 24h** (AGENTS.md §6, DESIGN.md §11).
7. User reviews the transcript on the next screen with replay / edit / re-record options.

## Acceptance Criteria

- [ ] Recording works on a low-end Android browser at 360px width (DESIGN.md §8.1).
- [ ] Mic permission denial gracefully falls back to a clear message (DESIGN.md §12).
- [ ] Transcription succeeds on at least one Taglish code-switching sample (hackathon scope: Taglish only).
- [ ] User can replay, edit, and re-record before accepting.
- [ ] Raw audio is deleted within 24 hours of successful transcription.
- [ ] No language selection is required upfront.
- [ ] Network failure during upload retries up to 2× with exponential backoff (DESIGN.md §7.1).

## Out of Scope (Hackathon)

- Filipino-only and English-only transcription paths (Taglish only per DESIGN.md §1.2).
- Cebuano support (post-pilot).
- Speaker diarization, background-noise suppression beyond Whisper defaults.
- Offline queue (graceful-fail-with-retry only per DESIGN.md §16, Q5).

## Open Questions

- Maximum recording length: DESIGN.md §5.3 sets a 180s default — confirm with team.
- Surface a visible confidence score on the transcript? Recommend no for the demo (clutter).
