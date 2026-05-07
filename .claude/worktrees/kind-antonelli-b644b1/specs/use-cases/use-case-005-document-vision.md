# Use Case 005 — Document Capture (Optional)

**Owners:** Role 2 (vision pipeline) + Role 3 (UI)
**Status:** Draft
**Plan:** [plans/PLAN_USE_CASE_005.md](../../plans/PLAN_USE_CASE_005.md) *(to be written)*

> Replaces the prior "Job Map" use case, which is a non-goal per [DESIGN.md](../../DESIGN.md) §1.2.

## User Story

As a user with informal credentials — receipts, certificates, photos of work — I want to optionally photograph them so the system can infer additional competencies that the voice narrative may have missed.

## User Flow

1. After voice capture (UC-001), the user lands on `/documents` with options to capture 0–5 images or skip.
2. Each captured image uploads independently to Supabase Storage via the client SDK.
3. The Next.js API route forwards each image URL to `POST /vision` on the FastAPI service.
4. The backend OCRs the image and returns inferred competencies, which are merged with the voice-extracted competencies (dedupe by English label, keep higher confidence).
5. The user reviews everything in `<CompetencyEditor>` (UC-002 flow).

## Acceptance Criteria

- [ ] Capture flow accepts up to 5 images, with `getUserMedia` capture and a file-input fallback.
- [ ] Each image uploads independently; one failure does not block the others (DESIGN.md §7.1).
- [ ] `POST /vision` returns a `DocumentResponse` with inferred competencies, each carrying confidence.
- [ ] Inferred competencies are merged with voice-extracted competencies per the dedupe rule above.
- [ ] Image bytes are deleted from temporary storage after extraction (mcp/policy.md).
- [ ] Skipping the document step proceeds gracefully — voice-only path is fully supported.

## Out of Scope (Hackathon)

- Document-type classification beyond what OCR returns.
- Verification that an OCR-extracted credential is genuine.

## Open Questions

- Which vision provider? OpenAI Vision vs. Google Cloud Vision — needs an entry in [mcp/policy.md](../../mcp/policy.md) before integration.
