# 06 — Do Not Build

This document lists features that are explicitly out of scope. If a teammate, user, or another AI agent suggests any of these during the build, the answer is **"roadmap, not prototype."**

These rejections are not arbitrary. Each one would either break scope, weaken rubric scores, or compromise the architectural integrity of the system.

---

## Features That Are Out of Scope

### Authentication & User Management

- User accounts, login flows, password reset
- Social worker registration
- Multi-user support
- Role-based access control beyond the static demo persona
- Session management

**Why not:** Authentication adds 4+ hours of work for zero rubric impact. The demo persona (Marivic) is hardcoded.

### Data Integration

- Real DepEd data integration
- Real DSWD data integration
- Pantawid Pamilya Information System (PPIS) integration
- Listahanan database integration
- API connections to any external Philippine government system

**Why not:** None of these are accessible during a hackathon. Synthetic data is the correct choice and is disclosed transparently.

### Mobile / Native Clients

- iOS app
- Android app
- React Native build
- Progressive Web App (PWA) configuration
- Push notifications

**Why not:** Web-only is sufficient for the demo. Mobile build is a roadmap item.

### Real-Time Features

- WebSocket connections
- Live data updates
- Real-time collaborative views
- Real-time notifications

**Why not:** The use case is daily caseload triage, not real-time monitoring. Adding real-time would be over-engineering.

### Notification Systems

- Email notifications to social workers
- SMS notifications
- In-app notification center
- Reminder scheduling

**Why not:** Out of scope for the prediction-and-recommendation core loop.

### Tracking & Analytics

- User analytics
- Click tracking
- Performance monitoring beyond basic
- A/B testing infrastructure

**Why not:** Privacy-first design; we are not building analytics into a tool that handles child data.

### Multi-Language Support

- Tagalog UI translation
- Cebuano UI translation
- Ilocano UI translation
- Other Philippine language support
- i18n infrastructure

**Why not:** English-only for the prototype. Mentioned in roadmap but not built.

### Family-Facing Interfaces

- Family consent flow UI
- Family-facing dashboard
- Family report download
- Family-side notification system

**Why not:** Social workers mediate family interactions per the architectural design. No direct family UI in scope.

### Persistent State

- Database setup (PostgreSQL, MongoDB, etc.)
- Data persistence beyond static JSON
- User preference storage
- Historical tracking of interventions over time
- Model performance tracking over time

**Why not:** Static JSON is sufficient. No database means no schema, no migrations, no auth, no ORM. This is a deliberate scope cut.

### Advanced ML Features

- Real-time model retraining
- Online learning
- Model versioning infrastructure
- Drift detection
- Multi-task learning extensions
- Custom neural network architectures

**Why not:** The model is trained once, offline, before the build. No retraining loop is needed for the demo.

### Multi-Tenant Features

- Multiple Municipal Links
- Multiple clusters
- Cross-cluster aggregation views
- Supervisor view across multiple Municipal Links
- DSWD admin panel
- Regional or national admin views

**Why not:** Single-cluster, single-Municipal-Link, single-persona scope. Multi-tenancy is roadmap.

### School-Facing Features

- School dashboard
- Teacher views
- Principal views
- Any feature that would expose predictions to school personnel

**Why not:** **This violates the core architectural constraint.** Schools cannot see predictions. This is permanent, not a roadmap item.

### Compliance & Operations

- Detailed audit logging beyond in-memory demo log
- Compliance reporting infrastructure
- Data Privacy Act of 2012 full compliance flows
- IRB review integration
- Formal consent management system

**Why not:** Acknowledged as required for production in the pitch and roadmap, but not built for prototype.

### Rich Data Visualizations

- Interactive geographic maps
- Time-series animations
- Complex multi-variable plots
- 3D visualizations

**Why not:** One bar chart on the impact screen is sufficient. More charts add polish time without rubric impact.

### Search & Filtering

- Search bar on caseload
- Multi-column filtering
- Saved filter presets
- Advanced query builder

**Why not:** 12 flagged children fit on one screen sorted by risk. Search is not needed for this scope.

### Export & Reporting

- PDF export of case notes
- Excel export of caseload
- Print-friendly views
- Report generation

**Why not:** Demo is screen-based. Export is roadmap.

### Integration Marketplace

- Webhooks
- API for third-party integrations
- Plugin system
- Public API documentation

**Why not:** Not relevant to prototype demo.

---

## Features That Look Tempting But Reject

### "What if we add a chatbot for social workers to ask questions?"

Reject. Adds LLM complexity, dialogue state management, and 3+ hours of work. The case note is the LLM's role; do not expand it.

### "What if the social worker can edit the case note?"

Reject. Adds form state, persistence, and undermines the auditability of the model output. Case notes are read-only in the prototype.

### "What if we add a feedback mechanism so social workers can mark predictions as accurate or not?"

Reject. Adds persistence, requires real data flow, and introduces ML feedback loop concerns out of scope for prototype.

### "What if we generate the case notes in Tagalog?"

Reject. The prototype is English-only. Multi-language is roadmap. (Though as a stretch goal, you may add a single Tagalog version of one demo child's case note as proof-of-concept if Hour 6 has slack.)

### "What if we show the actual SHAP plot in the UI?"

Reject. SHAP plots are technical artifacts not appropriate for social worker UI. The bar visualization on the Why panel is sufficient. SHAP plots can be referenced in pitch materials, not in product UI.

### "What if we add a video tutorial for social workers?"

Reject. Video production is out of scope. The product should be self-explanatory.

### "What if we integrate with Google Calendar for scheduling home visits?"

Reject. Calendar integration adds OAuth, API complexity, and zero rubric impact.

### "What if we add a map showing where the flagged children live?"

Reject. Maps add complexity, raise privacy concerns, and undermine the access scope principle. The barangay name in the child detail is sufficient.

---

## When In Doubt

If a feature is being considered and is not explicitly specified in `03_SYSTEM_DESIGN.md`, the answer is: **do not build it.**

The spec is complete. The features that are in the spec are the features that win on the rubric. New features added during the build are scope creep — they take time from polish and risk leaving the core flow incomplete.

**Half-built features score worse than cut features.**

If a teammate or AI agent strongly believes a feature should be added, escalate to the team lead with a written one-line justification and an estimate. If the addition cannot fit within the cut order in `04_BUILD_ORDER.md`, reject it.
