# PLAN_USE_CASE_006 — Resume Upload (PDF / Word)

Spec: [specs/use-cases/use-case-006-resume-upload.md](../specs/use-cases/use-case-006-resume-upload.md)

## Goal

Add an optional resume upload (PDF/DOC/DOCX) to the Documents step and a "View resume" link on the Profile page.

## Files to Change

- apps/web/stores/capture-store.ts
- apps/web/app/documents/page.tsx
- apps/web/app/profile/[sessionId]/page.tsx

## Implementation Strategy

1. Extend the capture store to hold `resumeFile`, `resumeUrl`, and `resumeUploadStatus`.
2. Add a file picker on the Documents page for `.pdf/.doc/.docx` and upload the selected file to Supabase Storage.
3. Persist the signed URL in the store and display a "View resume" link on the Profile page when present.

## Storage

- Use the existing `documents` bucket.
- Store at `sessions/<sessionId>/resume.<ext>` with `upsert: true`.

## Validation

- Typecheck the web app to ensure no TS errors.
- Manually verify:
  - Upload success/failure states render correctly
  - Replace/remove works
  - Profile link opens in a new tab
