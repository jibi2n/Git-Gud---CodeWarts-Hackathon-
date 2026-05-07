# Use Case 006 — Welding Modules Expansion

## User Story

As a user with welding skills, I want to manage my profile, discover nearby welding jobs, read tailored career advice, and ask welding-specific questions via chat so I can understand my opportunities and next steps even in a demo setting.

## Context

- The app currently demos a voice-to-skills flow.
- For this expansion, content is welding-focused for demo purposes because the only dataset available in-repo is welding (TESDA SMAW).

## User Flow

1. User opens the new modules hub from the web app.
2. User completes or edits their welding profile (personal info, skills, location, specialization, privacy settings, profile photo).
3. User navigates to Jobs:
   - App generates synthetic welding jobs within ~50 miles of the user’s location.
   - Jobs display on a simple interactive map view with markers.
   - User can open job details and click an application link.
4. User navigates to Career Advice:
   - App shows tailored advice: job paths with salary ranges, certification recommendations (AWS/API/ASME), and business ideas.
   - User can search/filter certification and training entries.
5. User navigates to Chat:
   - User asks welding-specific questions and receives responses.
   - Chat retains conversation history and uses profile context to tailor responses.

## Acceptance Criteria

### 1) Profile Module

- A dedicated route exists for profile management.
- User can edit:
  - Name, phone/email (optional), short bio
  - Location (lat/lng or a selectable city preset) and “search radius” preference
  - Welding skills and specialization areas (SMAW/GMAW/GTAW/FCAW, structural/pipeline/shipyard, etc.)
  - Privacy settings (at minimum: public vs private profile)
- User can upload a profile picture.
- Changes persist locally across reloads (demo mode).
- UI is responsive and consistent with existing components (Button/Card/Badge/Progress).

### 2) Jobs Module (Synthetic Matching + Map)

- A dedicated route exists for job discovery.
- The system generates synthetic welding job listings that:
  - Use realistic role titles (structural welder, pipeline welder, underwater welder, etc.)
  - Include salary ranges, requirements, and company information
  - Are placed at random coordinates within a 50-mile radius of the user’s location
- Jobs are displayed on an interactive map surface (no external map provider required for demo):
  - Markers are clickable and show job details
  - Job card includes an application link
- Loading and error states are shown.

### 3) Career Advice Portal (Welding Demo)

- A dedicated route exists for career advice.
- Content is tailored to welding and explicitly notes that it is welding-only for demo purposes.
- Sections include:
  - Job opportunities (with salary ranges and typical requirements)
  - Certification recommendations: AWS, API, ASME (with links)
  - Training programs/vocational schools list (with links)
  - Business startup ideas (including a lightweight “market analysis” and implementation steps)
- Search/filter is available for the certifications and training entries.

### 4) Chat Module (LLM-backed)

- A dedicated route exists for chat.
- Chat supports:
  - Conversation history during the session (and persisted locally for demo)
  - Context awareness using the user’s welding profile and selected module (jobs/certs)
  - Clear loading and error states
- API keys are server-only:
  - No OpenAI key is exposed to the frontend.
  - Frontend calls a local API route which proxies to the backend service.

## Out of Scope

- Real job listings from a third-party job API.
- A production-grade map provider integration (Mapbox/Google) requiring new allowlist entries.
- Full user authentication and multi-user profiles on Supabase Postgres.

## Open Questions

- Which “location input” is preferred for demo: city preset list only, or allow manual lat/lng?
- Should profile photo upload go to Supabase Storage (recommended) or stay local-only?
