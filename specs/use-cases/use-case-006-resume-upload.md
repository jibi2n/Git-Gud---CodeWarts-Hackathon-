# Use Case 006 — Resume Upload (PDF / Word)

**Owners:** Role 3 (UI) + Role 2 (backend/storage)
**Status:** Draft
**Plan:** [plans/PLAN_USE_CASE_006.md](../../plans/PLAN_USE_CASE_006.md)

## User Story

As a user, I want to upload my resume as a PDF or Word file so I can keep it with my session and share it when needed.

## User Flow

1. On the Documents step, the user sees an optional Resume upload area.
2. The user selects a `.pdf`, `.doc`, or `.docx` file.
3. The UI uploads the file and shows an "Uploaded" status.
4. On the Profile page, the user can open the uploaded resume link.

## Acceptance Criteria

- [ ] The Documents step accepts `.pdf`, `.doc`, and `.docx`.
- [ ] The UI shows upload status (Uploading, Uploaded, Error) and allows removing/replacing the resume.
- [ ] The Profile page shows a "View resume" link when a resume exists.
- [ ] Resume upload is optional; the user can proceed without uploading.

## Out of Scope

- Parsing resumes for skill extraction.
- Permanent public resume links (links may be time-limited).
- Multiple resumes per session.

## Open Questions

- Should resume storage use a separate bucket (e.g., `resumes`) vs. `documents`?
- How long should signed URLs remain valid for user access?