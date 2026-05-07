# SDD: sana.AI System Design Document

This document is the master design document for sana.AI. It describes the problem, the solution, the architecture, the features, the inclusivity commitments, the theory of change, the ethical framework, and the sustainability plan.

The document is structured so that each section maps directly to one of the seven judging criteria, towards the goal that a reviewer can locate any criterion's evidence quickly. Section headings include the criterion number in brackets where applicable.

## 0. Executive Summary

sana.AI is an oral-to-digital competency bridge that allows informal-sector workers in the Philippines to translate their lived skills into formal career pathways without needing a resume, a diploma, or English fluency. The user speaks her story in Filipino, Taglish, or English, optionally photographs any informal credentials she holds, and the system extracts competencies, matches them against TESDA certification requirements, and produces a readiness score with job archetypes the user can take to an interview.

The hackathon MDP focuses on Shielded Metal Arc Welding (SMAW) NC II as the initial TESDA track, with a web-first delivery. The architecture is ethical by default, accessible by design, and designed to scale through partnerships with TESDA, the Department of Labor and Employment, and local government units.

## 1. Problem Statement and SDG Alignment [Criterion 01]

### 1.1 The Diploma Gap

Roughly 40 percent of the Philippine labor force, basically more than 18 million people based on Philippine Statistics Authority figures, works in the informal sector. These workers possess high-value skills, including logistics coordination among tricycle dispatchers, micro-accounting among sari-sari store operators, crisis coordination among barangay first responders, and a lot of other competencies that would command significant salaries in formal contexts.

The diploma gap is the structural failure wherein formal labor markets and educational institutions rely on paper credentials, basically resumes, certificates, and diplomas, to recognize skill, while a large fraction of the population accumulates skill outside any system that produces such credentials. The gap is not a skill gap; it is a recognition gap, and it locks millions of Filipinos out of opportunities they are objectively qualified for.

The gap is widest for workers in remote areas, workers with low literacy, and workers whose first language is not English. These are also the populations most likely to benefit from formalization, since formalization opens access to higher wages, social insurance, and credit.

### 1.2 SDG Alignment

sana.AI aligns directly with three United Nations Sustainable Development Goal targets:

**SDG 8.3** calls for policies that promote productive activities, decent job creation, entrepreneurship, creativity, and innovation, and encourages the formalization and growth of micro-, small-, and medium-sized enterprises. sana.AI operationalizes this target by reducing the cost of formalization for informal workers, basically making the path from informal skill to formal credential shorter and cheaper.

**SDG 8.5** calls for full and productive employment and decent work for all women and men, including for young people and persons with disabilities. sana.AI operationalizes this target by removing the literacy and English-fluency barriers that currently exclude a large segment of the workforce from formal employment processes.

**SDG 4.4** calls for substantially increasing the number of youth and adults who have relevant skills, including technical and vocational skills, for employment, decent jobs, and entrepreneurship. sana.AI operationalizes this target by surfacing TESDA pathways that match the user's existing skills, with a readiness score that helps the user choose where to invest scarce time and money.

The alignment is substantive rather than decorative. Each feature in the MDP can be traced back to one of these three targets, and the impact metrics described in section 7 are designed to measure progress against them.

## 2. Solution Overview and Innovation [Criterion 02]

### 2.1 The sana.AI Approach

sana.AI is a voice-and-document competency bridge. The user opens the app, gives consent, records her story in whatever language she is comfortable in, and optionally photographs informal credentials she holds. The system transcribes the speech, extracts the competencies implicit in the story and in any credential images, and then produces a TESDA readiness score for the Welding SMAW NC II track alongside job archetypes matched to her skill profile.

The three-step flow — Record, Documents, Processing — is designed to be completable in under five minutes on a mobile browser with an intermittent data connection.

### 2.2 What Makes This Novel

The technical components of sana.AI, basically voice transcription, LLM-based skill extraction, and credential OCR, are individually well-established. The novelty is in the combination, the target population, and the cultural fit.

**Voice as resume.** Most existing job-matching platforms assume a written resume as input. sana.AI inverts this assumption and treats the voice itself as the primary credentialing artifact, wherein the system does the translation work that the user is currently expected to do alone.

**Taglish-first language handling.** Most existing speech-to-text and LLM platforms either force a single-language selection or perform poorly on code-switched speech. sana.AI is designed around Taglish as a first-class register, since this is the actual everyday speech of a lot of urban Filipinos, and forcing a language selection upfront is a real accessibility barrier.

**Document vision as a supplement, not a replacement.** Rather than treating voice and documents as competing inputs, sana.AI merges competencies from both sources, deduplicating by semantic similarity and taking the higher-confidence signal. A user with a barangay certificate or employer letter can surface skills that a voice story alone might not capture.

**Single-track vertical depth over shallow breadth.** Rather than offer shallow coverage of every TESDA field, the MDP focuses on Welding SMAW NC II, with researched competency weights and job archetypes tuned to that track. This vertical depth is the difference between a demo and a usable product.

## 3. System Architecture and Technical Execution [Criterion 03]

### 3.1 High-Level Architecture

sana.AI is a three-tier system. The frontend is a Next.js 14 web client (mobile-first). The backend is a FastAPI service that handles voice processing, document OCR, and TESDA readiness scoring. The data tier is Supabase, which provides both object storage for audio and images and a managed PostgreSQL database for session and profile data.

```
             ┌──────────────────────────────┐
             │  Next.js 14  (apps/web)      │
             │  Mobile-first, Taglish-first │
             │  MediaRecorder, getUserMedia │
             │  Zustand stores              │
             └──────────┬───────────────────┘
                        │ HTTPS
        ┌───────────────┴────────────────┐
        │                                │
        ▼                                ▼
┌────────────────┐             ┌──────────────────────┐
│   Supabase     │             │  FastAPI ML Service  │
│   ─ Storage    │             │  apps/service/       │
│     (audio,    │             │  ─ transcription/    │
│      images)   │             │  ─ extraction/       │
│   ─ Postgres   │             │  ─ vision/           │
│     (sessions, │             │  ─ tesda/            │
│      profiles) │             │  ─ pathways/         │
└────────────────┘             └──┬──────┬──────┬─────┘
                                  │      │      │
                         ┌────────▼─┐ ┌─▼────┐ ┌▼──────┐
                         │ Whisper  │ │ LLM  │ │Vision │
                         │   API    │ │(OAI) │ │GPT-4o │
                         └──────────┘ └──────┘ └───────┘
```

External services are limited to the allowlist in `mcp/policy.md`.

### 3.2 Backend Components

The backend follows a service-oriented structure, with each major capability isolated in its own module under `apps/service/`.

**TranscriptionService** (`transcription/whisper_service.py`) downloads the audio file from the Supabase signed URL, calls the OpenAI Whisper API with a Taglish context prompt, deletes the local copy immediately after transcription, and runs a background deletion policy for any files older than 24 hours.

**ExtractorService** (`extraction/extractor_service.py`) sends the confirmed transcript to an OpenAI LLM to extract professional competencies and technical skills, returning structured `Competency` objects with bilingual labels (Taglish and English) and confidence scores.

**VisionService** (`vision/vision_service.py`) sends credential images to GPT-4o, which performs structured OCR and maps recognised text to `Competency` objects. The frontend merges these with voice-derived competencies, preferring the higher-confidence signal for duplicate skills.

**PathwayScorer** (`pathways/scorer.py`) loads the TESDA Welding SMAW NC II competency manifest from `tesda/welding_smaw.json` and computes a weighted readiness score by matching the user's confirmed competencies against the track requirements. It also returns a hardcoded set of job archetypes appropriate to the score. The scoring is rule-based in the MDP; a learned model is a post-hackathon milestone.

### 3.3 API Surface

| Method | Endpoint | Responsibility |
|--------|----------|----------------|
| POST | `/transcribe` | Whisper transcription + 24 h deletion policy |
| POST | `/extract` | LLM competency extraction from transcript |
| POST | `/vision` | GPT-4o credential OCR → competencies |
| POST | `/score` | Rule-based TESDA readiness score + job archetypes |

All request/response shapes are defined as Pydantic models in `apps/service/main.py`. The TypeScript mirror types live in `apps/web/types/api.ts`.

### 3.4 Frontend Components

The frontend is a Next.js 14 app with Zustand for client state. The user flow is:

1. **Landing (`/`)** — ConsentGate collects explicit consent for voice recording and document scanning before anything is captured.
2. **Record (`/record`)** — VoiceRecorder uses the browser MediaRecorder API. On completion the blob is uploaded to Supabase Storage and a signed URL is stored in the capture store.
3. **Documents (`/documents`)** — DocumentCamera lets the user photograph up to five credential images, each uploaded to Supabase Storage. This step is optional.
4. **Processing (`/processing`)** — Orchestrates the ML pipeline in sequence: transcribe → extract → vision (if documents present) → score. Competencies from voice and vision are merged by English label, preferring the higher confidence score.
5. **Profile (`/profile/[sessionId]`)** — Displays extracted competencies as cards the user can confirm or dismiss, the TESDA readiness score, and job archetypes.

Localized UI strings live in `apps/web/locales/tl.ts`. No hardcoded copy appears in components.

### 3.5 Data Model

Session state is managed client-side in Zustand stores (`session-store`, `capture-store`, `profile-store`). Supabase Storage holds raw audio (`audio/sessions/{id}/*.webm`) and credential images (`documents/sessions/{id}/*.jpg`). The Supabase PostgreSQL instance holds session and profile records.

The `Competency` shape used across the entire pipeline:

```typescript
{
  id: string
  taglish_label: string
  english_label: string
  confidence: number   // 0.0 – 1.0
  evidence_span?: string
}
```

### 3.6 Infrastructure and Deployment

The MDP deployment uses Vercel for the Next.js frontend and a hosted FastAPI service for the ML backend, with Supabase providing both storage and managed PostgreSQL. Docker Compose is used for local development.

CI/CD is through GitHub Actions, with workflows for linting, testing, factory validation, and deployment on merge to main.

## 4. Feature Specifications

The MDP includes five core features. Each has a corresponding spec in `specs/use-cases/` and a plan in `plans/`.

### 4.1 Use Case 001: Voice Onboarding

The user opens the app, accepts consent, taps the microphone, and speaks her story in Filipino, Taglish, or English. The recording is uploaded to Supabase Storage. Acceptance criteria include successful transcription on Filipino-only, English-only, and Taglish code-switching samples, and correct handling of the demo fallback (`demo://taglish-sample-1`).

### 4.2 Use Case 002: Document Scanning (Credential Vision)

The user photographs up to five credential images, each uploaded to Supabase Storage. The vision pipeline extracts competencies from each image using GPT-4o. Extracted competencies are merged with voice-derived competencies, deduplicating by English label and preferring the higher confidence score. This step is optional and can be skipped entirely.

### 4.3 Use Case 003: Skill Recognition

The system extracts competencies from the confirmed transcript and presents them as cards with bilingual labels. The user may dismiss any card that does not feel accurate. Acceptance criteria include at least one competency extracted from a typical onboarding story and traceability from each card back to the transcript.

### 4.4 Use Case 004: TESDA Readiness Score (Welding SMAW NC II)

The system computes a weighted readiness score for the Welding SMAW NC II track by matching the user's confirmed competencies against four weighted requirements: Weld Carbon Steel Plates (40%), Apply Safety Practices (20%), Interpret Drawings/Sketches (20%), and Prepare Weld Materials (20%). The score and a list of matched and missing competencies are shown to the user with a disclaimer that the score is a guide, not a guarantee.

### 4.5 Use Case 005: Job Archetypes

Based on the readiness score, the system surfaces job archetypes appropriate to the user's profile. Current archetypes for the welding track include Junior Welder and Safety Officer (Welding). Full job map with employer pins is deferred to post-hackathon.

### 4.6 Stretch Features

Resume PDF export, a job map with pinned employers in NCR, multi-track TESDA support, and a Q&A chatbot are tracked as stretch features and are not in the MDP scope.

## 5. Inclusivity and Accessibility Design [Criterion 04]

### 5.1 Voice-First Architecture

Every primary interaction in sana.AI can be completed using voice and large tappable elements, basically without typing or reading dense text. This is the default experience, not a fallback. The choice is grounded in the realities of the target user, wherein a tricycle dispatcher with low literacy and intermittent data is the canonical user, and the product must work for her without modification.

### 5.2 Language Coverage

Filipino, Taglish, and English are equal first-class languages, with no requirement to select a language at the start. The Whisper API's multilingual capability handles transcription. The UI copy is stored in `apps/web/locales/tl.ts`, which supports adding more languages without code changes.

Cebuano support is a stretch goal for the MDP and a hard requirement for any post-hackathon version, given that Cebuano serves a population of roughly 21 million speakers concentrated in regions currently underserved by NCR-centric tech.

### 5.3 Connectivity Resilience

Voice recording works fully offline via the browser MediaRecorder API. Recordings are stored locally and uploaded when connectivity returns, with a visible upload status indicator. Document uploads follow the same pattern.

### 5.4 Visual and Motor Accessibility

All tap targets are at least 48 by 48 device-independent pixels with adequate spacing. All text meets WCAG AA contrast ratios. Animations respect the operating system's reduced-motion preference via CSS `prefers-reduced-motion`. Font sizing scales with the device's accessibility settings.

### 5.5 Cultural Accessibility

The UI copy is warm, direct, and in Taglish where appropriate. The product never frames the user as deficient; the framing is always additive — surfacing skills the system has not yet recognized, not gaps the user must fill.

### 5.6 Universal Design Principles

The full universal design checklist — equitable use, flexibility in use, simple and intuitive use, perceptible information, tolerance for error, low physical effort, and adequate size and space — is enforced through the principles in `DESIGN.md` and verified during agentic review.

## 6. Theory of Change and Impact [Criterion 05]

### 6.1 Causal Chain

The theory of change is as follows: an informal-sector worker speaks her story to sana.AI, the system surfaces her competencies in a form she can articulate, the system estimates her TESDA readiness with an honest score, the worker enrolls and completes the certification, the certification opens access to formal employment, and the worker's income and economic security increase.

Each step in this chain is supported by either existing evidence (TESDA certification holders earn measurably more than non-holders in equivalent roles) or by the product's own design (sana.AI removes the literacy and language barriers that currently block the first step).

### 6.2 Measurable Outcomes

The MDP defines the following pilot-phase metrics, designed to be measurable within six months of launch:

**Reach.** Number of unique users completing voice onboarding. Pilot target: 500 users in NCR welding-adjacent communities.

**Skill recognition fit.** Percentage of users who confirm at least one extracted competency as accurate. Target: 70 percent.

**Pathway engagement.** Percentage of users who view the TESDA readiness score and job archetypes. Target: 80 percent.

**Pathway conversion.** Percentage of users who report enrollment in a TESDA certification or application to a job within six months of using sana.AI. Target: 30 percent.

**Income trajectory.** Among users who report a pathway action, average self-reported income change at the 12-month mark. Target: a measurable positive change relative to a pre-sana.AI baseline.

### 6.3 Stretch Impact

Beyond the individual user, sana.AI has potential second-order impacts on TESDA enrollment data quality, on labor market matching efficiency, and on the broader formalization of the informal economy.

## 7. Ethical Framework [Criterion 06]

### 7.1 Consent

Consent is collected through an explicit consent gate before any recording begins. The gate covers voice recording and document scanning separately, and both must be accepted before the user can proceed. The consent flow is delivered in the user's language.

Consent for using the service is separate from consent for using the user's data to improve the system. The latter is opt-in, never opt-out.

### 7.2 Data Minimization

Raw audio is deleted locally immediately after transcription. The `enforce_deletion_policy` background task removes any residual files older than 24 hours. Credential images are read once by the vision pipeline and are not retained beyond the session. Personally identifiable information is collected only to the extent necessary for the feature.

The user's data is hard-deletable through the "Delete my data" action in the footer.

### 7.3 Bias Acknowledgment and Mitigation

LLMs trained predominantly on English data may misrepresent or undervalue skills described in Filipino or Taglish. sana.AI mitigates this through three measures: the Whisper transcription prompt explicitly sets a Taglish context; the extraction prompts instruct the model to treat Filipino and Taglish input as equal in dignity to English; and golden-example evaluations in `evals/` include Filipino and Taglish samples and check for output quality parity.

The TESDA readiness scoring is rule-based in the MDP precisely to keep it inspectable. Every factor is visible in `tesda/welding_smaw.json`.

### 7.4 Unintended Harms

The most plausible unintended harms include: encouraging a user to invest in a TESDA certification she will not pass; and making promises about formalization that the broader system cannot deliver on. sana.AI mitigates these through an explicit disclaimer on the readiness score card ("This score is a guide only, not a guarantee. Please consult TESDA for an official assessment.") and through careful product framing that presents archetypes as options rather than guarantees.

### 7.5 Voice as Biometric

Voice data is biometric and is treated with the highest level of caution. It is never sold, never shared with third parties outside the declared MCP allowlist, and never used to identify users across services. The immediate post-transcription deletion of local audio files is the single most important data protection commitment in the platform.

## 8. Sustainability and Scalability [Criterion 07]

### 8.1 Funding Model

sana.AI pursues a phased funding model. The hackathon prototype is funded by the team's in-kind effort. The pilot phase targets grant funding from organizations with aligned missions, including the Asia Foundation, the World Bank's Philippines-focused programs, and Philippine government innovation funds such as the DICT National ICT Innovation Hub or DTI's Negosyo Center programs.

The post-pilot phase pursues a freemium model wherein the user-facing product remains free, and revenue comes from employer-side subscriptions for verified candidate access.

### 8.2 Partnerships

The growth pathway is anchored on three partnership categories. **Government partnerships** with TESDA for certification data integration, with DOLE for labor market data, and with local government units for community-level pilot deployment. **NGO partnerships** with organizations already serving informal-sector workers. **Academic partnerships** with Philippine universities for ongoing research and regional language localization.

### 8.3 Geographic and Vertical Expansion

The MDP focuses on Welding SMAW NC II in NCR. The post-hackathon roadmap expands first to other TESDA Construction sector certifications — masonry, plumbing, electrical installation — then geographically to Cebu and Davao.

### 8.4 Open Source and Replicability

The sana.AI platform is designed to be replicable in other contexts where the diploma gap is significant — Indonesia, Vietnam, and parts of Latin America and Africa. Core platform components are designed to be open-sourceable, with country-specific configuration as the localized layer.

## 9. Roadmap

**Phase 0, Hackathon.** Voice onboarding, document scanning, competency extraction, TESDA Welding SMAW NC II readiness scoring, job archetypes. Web client only. End state: working demo and a complete pitch deck.

**Phase 1, Months 1 to 3 post-hackathon.** Refine prompts and evaluations based on user testing. Expand TESDA welding data quality. Add resume PDF export. Add job map with pinned NCR welding employers. Prepare for grant applications.

**Phase 2, Months 4 to 9.** Pilot launch in NCR with at least three community partners. Add Cebuano support. Add Flutter mobile client. Begin collecting impact data.

**Phase 3, Months 10 to 18.** Expand to Cebu and Davao. Add additional TESDA fields. Replace the rule-based scoring with a learned model trained on pilot data. Launch employer subscription tier.

**Phase 4, beyond 18 months.** National coverage. Full TESDA field coverage. Open-source platform release. Replication partnerships in at least one additional country.

## 10. Open Questions

These are tracked in `docs/decisions/` and revisited regularly:

How should the platform handle skills that are real but ethically ambiguous — informal lending, unregistered transport operations, and other gray-economy work that is common but not formally recognized?

What is the right threshold for an employer to be included in the job map, given the risk of surfacing exploitative employers?

How does the platform handle users who report a gender identity or expression that the labor market context of their target employers may not accommodate, towards the goal of being honest about the labor market without endorsing its biases?

These questions do not block the MDP, but they shape Phase 1 and beyond.

## 11. References

The factory documents that govern this design include `AGENTS.md` for the operating contract, `DESIGN.md` for the UI and product taste contract, individual specs in `specs/use-cases/`, individual plans in `plans/`, and the MCP policy in `mcp/policy.md`. This SDD is the durable product document that ties all of those together.
