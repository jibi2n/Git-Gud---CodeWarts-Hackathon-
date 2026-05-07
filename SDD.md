# SDD: Boses System Design Document

This document is the master design document for Boses. It describes the problem, the solution, the architecture, the features, the inclusivity commitments, the theory of change, the ethical framework, and the sustainability plan.

The document is structured so that each section maps directly to one of the seven judging criteria, towards the goal that a reviewer can locate any criterion's evidence quickly. Section headings include the criterion number in brackets where applicable.

## 0. Executive Summary

Boses, meaning "voice" in Filipino, is an oral-to-digital competency bridge that allows informal-sector workers in the Philippines to translate their lived skills into formal career pathways without needing a resume, a diploma, or English fluency. The user speaks her story in Filipino, Taglish, or English, and the system extracts skills, recommends TESDA certifications with estimated passing rates, suggests jobs at nearby companies through a map interface, and proposes possible business ideas based on the skill profile.

The MDP focuses on welding as the initial TESDA field, NCR as the initial geographic scope, and a web-first delivery wherein a Flutter mobile client follows in the post-hackathon phase. The architecture is designed to be ethical by default, accessible by design, and scalable through partnerships with TESDA, the Department of Labor and Employment, and local government units.

## 1. Problem Statement and SDG Alignment [Criterion 01]

### 1.1 The Diploma Gap

Roughly 40 percent of the Philippine labor force, basically more than 18 million people based on Philippine Statistics Authority figures, works in the informal sector. These workers possess high-value skills, including logistics coordination among tricycle dispatchers, micro-accounting among sari-sari store operators, crisis coordination among barangay first responders, and a lot of other competencies that would command significant salaries in formal contexts.

The diploma gap is the structural failure wherein formal labor markets and educational institutions rely on paper credentials, basically resumes, certificates, and diplomas, to recognize skill, while a large fraction of the population accumulates skill outside any system that produces such credentials. The gap is not a skill gap; it is a recognition gap, and it locks millions of Filipinos out of opportunities they are objectively qualified for.

The gap is widest for workers in remote areas, workers with low literacy, and workers whose first language is not English. These are also the populations most likely to benefit from formalization, since formalization opens access to higher wages, social insurance, and credit.

### 1.2 SDG Alignment

Boses aligns directly with three United Nations Sustainable Development Goal targets:

**SDG 8.3** calls for policies that promote productive activities, decent job creation, entrepreneurship, creativity, and innovation, and encourages the formalization and growth of micro-, small-, and medium-sized enterprises. Boses operationalizes this target by reducing the cost of formalization for informal workers, basically making the path from informal skill to formal credential or registered business shorter and cheaper.

**SDG 8.5** calls for full and productive employment and decent work for all women and men, including for young people and persons with disabilities. Boses operationalizes this target by removing the literacy and English-fluency barriers that currently exclude a large segment of the workforce from formal employment processes.

**SDG 4.4** calls for substantially increasing the number of youth and adults who have relevant skills, including technical and vocational skills, for employment, decent jobs, and entrepreneurship. Boses operationalizes this target by surfacing TESDA pathways that match the user's existing skills, with a passing-rate estimate that helps the user choose where to invest scarce time and money.

The alignment is substantive rather than decorative. Each feature in the MDP can be traced back to one of these three targets, and the impact metrics described in section 7 are designed to measure progress against them.

## 2. Solution Overview and Innovation [Criterion 02]

### 2.1 The Boses Approach

Boses is a voice-first competency bridge. The user opens the app, taps a single microphone button, and tells her story in whatever language she is comfortable in. The system transcribes the speech, extracts the skills implicit in the story, rephrases them in formal vocabulary the user can take to a job interview, and then surfaces three categories of opportunity: TESDA certifications she could pursue with her current skill base, jobs at nearby companies she could apply for, and small businesses she could plausibly start.

For each TESDA pathway, the system shows an estimated passing rate based on the user's skill profile and the requirements of the certification, towards the goal of helping the user invest scarce resources in the certification most likely to pay off.

### 2.2 What Makes This Novel

The technical components of Boses, basically voice transcription, LLM-based skill extraction, and recommender systems for jobs and certifications, are individually well-established. The novelty is in the combination, the target population, and the cultural fit.

**Voice as resume.** Most existing job-matching platforms assume a written resume as input. Boses inverts this assumption and treats the voice itself as the primary credentialing artifact, wherein the system does the translation work that the user is currently expected to do alone.

**Taglish-first language handling.** Most existing speech-to-text and LLM platforms either force a single-language selection or perform poorly on code-switched speech. Boses is designed around Taglish as a first-class register, since this is the actual everyday speech of a lot of urban Filipinos, and forcing a language selection upfront is a real accessibility barrier.

**Encouragement-aware skill rephrasing.** The system does not just extract skills; it presents them back to the user in a form that respects her dignity and helps her articulate them in interviews. This is a deliberate design choice that distinguishes Boses from a generic LLM wrapper, and it is the part that the user-facing design language explicitly enforces through `DESIGN.md`.

**Three pathways, equal weight.** Existing platforms typically push users towards a single category, basically jobs, or certifications, or entrepreneurship. Boses presents all three equally, since the right pathway depends on the user's circumstances, risk tolerance, and capital, and the platform should not pre-decide on the user's behalf.

**Welding-first vertical depth.** Rather than offer shallow coverage of every TESDA field, the MDP focuses on welding, with researched data on actual TESDA welding certifications, passing-rate factors, and welding employer companies in NCR. This vertical depth is the difference between a demo and a usable product.

## 3. System Architecture and Technical Execution [Criterion 03]

### 3.1 High-Level Architecture

Boses is a three-tier system. The frontend is a Next.js web client with a planned Flutter mobile client. The backend is a FastAPI service that handles authentication, voice processing, LLM orchestration, and data access. The data tier is PostgreSQL with the pgvector extension enabled for semantic skill matching, plus object storage for raw audio in the short term before deletion.

External services are limited to a strict allowlist documented in `mcp/policy.md`: OpenAI Whisper API for transcription, an LLM provider (OpenAI or Anthropic) for skill extraction and encouragement rephrasing, and Mapbox or Google Maps for the job map. No other external services may be called, and the validate-factory script enforces this.

### 3.2 Backend Components

The backend follows a service-oriented internal structure, with each major capability isolated in its own module:

**Transcription service** wraps the Whisper API call, handles language detection, manages audio format conversion, and enforces the 24-hour raw audio deletion policy.

**LLM orchestration service** manages prompts for skill extraction and encouragement rephrasing. Prompts are stored as versioned files in `apps/service/prompts/`, never inlined into code, towards the goal that prompt changes are visible in version control and reviewable.

**Skill matching service** uses pgvector to compute semantic similarity between extracted user skills and the skill profiles of TESDA certifications, jobs, and business templates stored in the database. This is a more flexible approach than keyword matching, since the user may describe a skill in many ways, and embedding-based search handles this gracefully.

**TESDA passing-rate model** is a separate module that estimates a candidate's likelihood of passing a given TESDA certification based on the alignment between their skill profile and the certification's requirements. The MDP version is rule-based with weights tuned manually, and a learned model is a fast-follow once enough usage data is collected.

**Pathway recommendation service** combines skill matching and the passing-rate model to produce the three-category recommendation set surfaced to the user.

**User data service** handles profile, consent records, saved pathways, and the resume export feature.

### 3.3 Frontend Components

The frontend is intentionally simple, since most of the complexity lives on the backend. Major surfaces include the voice onboarding flow, the transcription confirmation screen, the skill cards display, the three-category pathway view, the job map, and the profile page wherein the user manages saved items and exports a resume.

Voice recording uses the browser's MediaRecorder API on web, with a fallback to file upload for browsers that do not support recording. Offline support uses service workers and IndexedDB for queued recordings.

### 3.4 Data Model

The core database tables include `users`, `consent_records`, `recordings` (with a hard 24-hour TTL on raw audio), `transcripts`, `extracted_skills`, `tesda_certifications`, `jobs`, `companies`, `businesses`, `saved_pathways`, and `audit_log`. The pgvector extension is used for embedding columns on `extracted_skills`, `tesda_certifications`, `jobs`, and `businesses`.

### 3.5 Infrastructure and Deployment

The MDP deployment uses Vercel for the Next.js frontend and Railway or Render for the FastAPI backend, with a managed PostgreSQL instance from the same provider. Docker Compose is used for local development, with all services including the database starting from a single command.

CI/CD is through GitHub Actions, with workflows for linting, testing, factory validation, and deployment on merge to main. Branch protection on main requires passing CI and at least one human approval.

## 4. Feature Specifications

The MDP includes five core features. Each has a corresponding spec in `specs/use-cases/` and a plan in `plans/`.

### 4.1 Use Case 001: Voice Onboarding

The user opens the app, taps the microphone, and speaks her story in Filipino, Taglish, or English. The system records, transcribes, and presents the transcript for confirmation. The user may edit, re-record, or accept. Acceptance criteria include successful transcription on at least one Filipino-only sample, one English-only sample, and one Taglish code-switching sample, plus successful offline recording with queued upload.

### 4.2 Use Case 002: Skill Recognition with Encouragement

The system extracts skills from the confirmed transcript and presents them as cards with plain-language explanations. The user may dismiss any skill that does not feel accurate. The encouragement layer rephrases extracted skills in formal vocabulary the user can use in an interview, without inflation. Acceptance criteria include at least three skills extracted from a typical onboarding story, no inflated skill names, and traceability from each card back to the source quote in the transcript.

### 4.3 Use Case 003: Career Pathways

The system presents three categories of opportunity: TESDA certifications, jobs, and businesses. Each category contains at least three suggestions ranked by relevance to the skill profile. The user may save any suggestion to her profile for later. Acceptance criteria include all three categories populated, ranking visibly correlated with skill match strength, and a clear save action on each item.

### 4.4 Use Case 004: TESDA Passing Rate Estimate (Welding)

For each TESDA welding certification suggested, the system displays an estimated passing-rate percentage with a brief explanation of the factors driving the estimate. The estimate is rule-based in the MDP, with a learned model planned for the post-hackathon roadmap. Acceptance criteria include estimates rendered for all welding certifications in the database, a visible disclaimer that the estimate is a guide rather than a guarantee, and at least one factor explanation per estimate.

### 4.5 Use Case 005: Job Map

Companies hiring in welding-adjacent roles in NCR are pinned on a map centered on the user's location. Tapping a pin reveals company name, role, contact details, and a save action. A list view is available as an equal alternative. Acceptance criteria include at least 15 companies pinned, every pin tappable with full details, and a working list-view alternative.

### 4.6 Stretch Features

Resume PDF export, profile management beyond the basics, and a Q&A chatbot are tracked as stretch features and are not in the MDP scope. The chatbot in particular is deliberately deferred since conversational design is a deep area that would distract from the core voice-to-pathway flow.

## 5. Inclusivity and Accessibility Design [Criterion 04]

### 5.1 Voice-First Architecture

Every primary interaction in Boses can be completed using voice and large tappable elements, basically without typing or reading dense text. This is not a fallback for accessibility; it is the default experience. The choice is grounded in the realities of the target user, wherein a tricycle dispatcher with low literacy and intermittent data is the canonical user, and the product must work for her without modification.

### 5.2 Language Coverage

Filipino, Taglish, and English are equal first-class languages, with no requirement to select a language at the start. The Whisper API's multilingual capability handles transcription, the LLM orchestration layer handles response language matching, and the UI strings are stored in a localization file that supports adding more languages without code changes.

Cebuano support is a stretch goal for the MDP and a hard requirement for any post-hackathon version, given that Cebuano serves a population of roughly 21 million speakers concentrated in regions currently underserved by NCR-centric tech.

### 5.3 Connectivity Resilience

Voice recording works fully offline. Recordings are stored locally and uploaded when connectivity returns, with a clear visual indicator of pending uploads. Once a user has saved skills and pathways, those items are cached for offline viewing.

### 5.4 Visual and Motor Accessibility

All tap targets are at least 48 by 48 device-independent pixels with adequate spacing. All text meets WCAG AA contrast ratios. Animations respect the operating system's reduced-motion preference. Font sizing scales with the device's accessibility settings.

### 5.5 Cultural Accessibility

Imagery in the product depicts actual Filipino informal-sector workers in their actual work contexts, basically not generic corporate stock photography. The tone is warm and respectful, never the corporate-motivational register that alienates a lot of working-class users. The product never frames the user as deficient or behind; the framing is always additive.

### 5.6 Universal Design Principles

The full universal design checklist, basically equitable use, flexibility in use, simple and intuitive use, perceptible information, tolerance for error, low physical effort, and adequate size and space, is enforced through the principles in `DESIGN.md` and verified during agentic review.

## 6. Theory of Change and Impact [Criterion 05]

### 6.1 Causal Chain

The theory of change is as follows: an informal-sector worker speaks her story to Boses, the system surfaces her skills in a form she can articulate, the system suggests a TESDA pathway with an honest passing-rate estimate, the worker enrolls and completes the certification, the certification opens access to formal employment or a registered business, and the worker's income and economic security increase.

Each step in this chain is supported by either existing evidence (TESDA certification holders earn measurably more than non-holders in equivalent roles) or by the product's own design (Boses removes the literacy and language barriers that currently block the first step).

### 6.2 Measurable Outcomes

The MDP defines the following pilot-phase metrics, designed to be measurable within six months of launch:

**Reach.** Number of unique users completing voice onboarding. Pilot target: 500 users in NCR welding-adjacent communities.

**Skill recognition fit.** Percentage of users who confirm at least three of the extracted skills as accurate. Target: 70 percent.

**Pathway engagement.** Percentage of users who save at least one TESDA certification, job, or business pathway. Target: 50 percent.

**Pathway conversion.** Percentage of users who report enrollment in a TESDA certification, application to a job, or initiation of a business within six months of using Boses. Target: 30 percent.

**Income trajectory.** Among users who report a pathway action, average self-reported income change at the 12-month mark. Target: a measurable positive change relative to a pre-Boses baseline.

These metrics are tracked through an analytics layer that respects the consent and privacy commitments described in section 7.

### 6.3 Stretch Impact

Beyond the individual user, Boses has potential second-order impacts on TESDA enrollment data quality (since the system generates a structured signal of which certifications informal workers actually want), on labor market matching efficiency (since the job map exposes employers to candidates they would otherwise miss), and on the broader formalization of the informal economy (since each user who moves from informal to formal expands the tax base and the social insurance pool).

## 7. Ethical Framework [Criterion 06]

### 7.1 Consent

Consent is collected orally, since written consent does not work for low-literacy users, and the consent recording is stored as evidence of the user's agreement. The consent flow covers what data is collected, how it is used, how long it is retained, and how the user may withdraw consent. The flow is delivered in the user's input language.

Consent for using the service is separate from consent for using the user's data to improve the system. The latter is opt-in, never opt-out, and may be withdrawn at any time.

### 7.2 Data Minimization

Raw audio is deleted within 24 hours of successful transcription, unless the user has explicitly opted into retention. Transcripts may be retained but are deletable on user request through a documented endpoint. Personally identifiable information is collected only to the extent necessary for the feature, basically location for the job map, contact information only if the user wants to receive recommendations by SMS or email.

The user's full data set is exportable in a machine-readable format, and is hard-deletable through a single user action. Soft delete is forbidden.

### 7.3 Bias Acknowledgment and Mitigation

LLMs trained predominantly on English data may misrepresent or undervalue skills described in Filipino or Taglish. This is a known risk, and Boses mitigates it through three measures: prompt engineering that explicitly instructs the model to treat Filipino and Taglish input as equal in dignity to English, golden-example evaluations in `evals/` that include Filipino and Taglish samples and check for output quality parity, and a feedback loop wherein users can flag inaccurate skill extraction.

The TESDA passing-rate model is rule-based in the MDP precisely to keep it inspectable. When a learned model replaces it, the model card will document training data, performance disaggregated by gender and region, and known failure modes.

### 7.4 Unintended Harms

The most plausible unintended harms include: encouraging a user to invest in a TESDA certification she will not pass and lose the enrollment fee; surfacing job opportunities at exploitative employers; making promises about formalization that the broader system cannot deliver on. Boses mitigates these through honest passing-rate disclaimers, an employer vetting process for the job map (employers in the database are limited to those with a documented track record or referral from a partner), and careful product framing that presents pathways as options rather than guarantees.

### 7.5 Data Sovereignty and Storage Location

User data is stored in infrastructure with documented locations, with a preference for Philippine-based or Asia-Pacific regional infrastructure once the platform scales. The MDP runs on US-based managed services for hackathon-phase pragmatism, with a documented migration plan to in-region infrastructure for production.

### 7.6 Voice as Biometric

Voice data is biometric and is treated with the highest level of caution. It is never sold, never shared with third parties outside the declared MCP allowlist, and never used to identify users across services. The 24-hour deletion policy on raw audio is the single most important data protection commitment in the platform.

## 8. Sustainability and Scalability [Criterion 07]

### 8.1 Funding Model

Boses pursues a phased funding model. The hackathon prototype is funded by the team's in-kind effort. The pilot phase, basically the six months following the hackathon, is targeted at grant funding from organizations with aligned missions, including the Asia Foundation, the World Bank's Philippines-focused programs, and Philippine government innovation funds such as the DICT National ICT Innovation Hub or DTI's Negosyo Center programs.

The post-pilot phase pursues a freemium model wherein the user-facing product remains free, and revenue comes from employer-side subscriptions for verified candidate access, basically a model similar to JobStreet's employer tier, but with the explicit value proposition of access to a candidate pool that paper-credential platforms do not reach. Pricing is set at a level affordable to small and medium enterprises, since these are the largest absorbers of TESDA-certified workers.

### 8.2 Partnerships

The growth pathway is anchored on three partnership categories. **Government partnerships** with TESDA for certification data integration, with the Department of Labor and Employment for labor market data, and with local government units for community-level pilot deployment. **NGO partnerships** with organizations already serving informal-sector workers, basically the Homenet Philippines network, and the Self-Employed Women's Association affiliates. **Academic partnerships** with Philippine universities for ongoing research on the platform's impact and for student-led regional language localization.

### 8.3 Geographic and Vertical Expansion

The MDP focuses on welding in NCR. The post-hackathon roadmap expands first to other TESDA Construction sector certifications, basically masonry, plumbing, electrical installation, since these have similar candidate pools and employer networks. Geographic expansion follows the data, with Cebu and Davao as the most likely second and third regions based on TESDA enrollment volume and informal-sector population.

The longer-term ambition is to cover all TESDA fields and all major Philippine regions, with regional-language support unlocking each new region.

### 8.4 Operational Capacity

The team transitions from a four-person hackathon team to a small post-hackathon team of five to seven, adding a partnerships lead and a community liaison. The operational model uses contracted labor for community outreach in pilot regions, since this both reduces fixed cost and ensures cultural fit at the community level.

The product remains lean, with the engineering team focused on the core platform and language expansion, while content and partnerships work is handled by the partnerships and community functions.

### 8.5 Open Source and Replicability

The Boses platform is designed to be replicable in other contexts wherein the diploma gap is significant, basically Indonesia, Vietnam, and parts of Latin America and Africa. Core platform components, including the voice-to-skill pipeline and the TESDA-equivalent recommender, are designed to be open-sourceable, with country-specific configuration (language, certification frameworks, employer networks) as the localized layer.

The team commits to publishing the platform's anonymized impact data, towards the goal that other social impact teams can build on the lessons learned.

## 9. Roadmap

**Phase 0, Hackathon.** Voice onboarding, skill recognition with encouragement, three-pathway recommendations, TESDA welding passing-rate estimates, job map for NCR welding employers. Web client only. End state: working demo and a complete pitch deck.

**Phase 1, Months 1 to 3 post-hackathon.** Refine the prompt and evaluation suite based on user testing. Expand TESDA welding data quality. Add resume PDF export. Prepare for grant applications.

**Phase 2, Months 4 to 9.** Pilot launch in NCR with at least three community partners. Add Cebuano support. Add Flutter mobile client. Begin collecting impact data.

**Phase 3, Months 10 to 18.** Expand to Cebu and Davao. Add additional TESDA fields. Replace the rule-based passing-rate model with a learned model trained on pilot data. Launch employer subscription tier.

**Phase 4, beyond 18 months.** National coverage. Full TESDA field coverage. Open-source platform release. Replication partnerships in at least one additional country.

## 10. Open Questions

These are tracked in `docs/decisions/` and revisited regularly:

How should the platform handle skills that are real but ethically ambiguous, basically informal lending, unregistered transport operations, and other gray-economy work that is common but not formally recognized?

What is the right threshold for an employer to be included in the job map, given the risk of surfacing exploitative employers?

How does the platform handle users who report a different gender identity or expression than the social context of their target employers expects, towards the goal of being honest about the labor market without endorsing its biases?

These questions do not block the MDP, but they shape Phase 1 and beyond.

## 11. References

The factory documents that govern this design include `AGENTS.md` for the operating contract, `DESIGN.md` for the UI and product taste contract, individual specs in `specs/use-cases/`, individual plans in `plans/`, and the MCP policy in `mcp/policy.md`. This SDD is the durable product document that ties all of those together.
