# AI Time Machine — Phase 1 Startup Bible (Product & Business)

**Status:** Draft v0.1  
**Date:** 2026-07-20  
**Goal:** Define what we are building, why it matters, who it is for, and why people pay.

## 0) Document Principles

- **Engineering tone:** decisions, assumptions, constraints, and measurable outcomes.
- **No hand-wavy claims:** when facts are unknown, mark them as assumptions/TBD.
- **Iterative stability:** lock the “what/why/who” before deep “how”.

## 1) Executive Summary

AI Time Machine turns a person’s fragmented digital activity into a **searchable, replayable timeline** of:
- what happened,
- what context existed,
- and what outcomes followed.

Unlike file search (which returns documents), AI Time Machine reconstructs *episodes* (a day, project span, meeting sequence, or learning journey) by collecting **normalized events** across apps and then replaying them as a structured narrative.

**MVP direction (aligns with current backend work):**
- ingest normalized “events” (manual/API for now),
- render a replayable **timeline view** grouped by time,
- expose a clean API for UI and later AI/RAG layers.

## 2) Vision

Build the world’s first **Digital Replay Engine**: users can revisit any moment of their digital life and regain decisions and context—not just raw artifacts.

## 3) Mission

Help people never lose knowledge, context, decisions, or learning again.

## 4) Problem Statement

Digital knowledge is fragmented across tools (email, chat, code, browser, calendar, docs, notes, files, photos). People repeatedly:
- search for “where I left off,”
- rebuild context for follow-ups,
- and lose decisions that were never documented.

Search returns results; it rarely reconstructs *why* something happened.

## 5) Market Research (Assumptions + Validation Plan)

### 5.1 Market hypothesis

People will pay for:
- time saved from repeated context re-discovery,
- improved recall of decisions and learning,
- and a unified memory layer across apps.

### 5.2 Validation to run (before scaling spend)

- Landing page validation with conversion tracking (signup intent).
- Founder-led interviews: 15–30 knowledge workers across roles.
- Competitive comparison tests: “find what happened last week” tasks against existing tools.

### 5.3 Metrics to define early

- **Time-to-replay:** how long until a user can reconstruct the episode.
- **Replay satisfaction:** thumbs up/down and short survey reasons.
- **Task success rate:** percent of tasks completed without manual searching.

## 6) Competitor Analysis (Differentiation)

Competitive landscape includes:
- Personal memory/recall products (browser/app history + AI summaries)
- Enterprise knowledge tools with AI search
- Note/lifestyle productivity assistants with RAG-like retrieval

### Differentiation (proposal)

1. **Cross-app replay, not just summarization:** replay is event-driven and chronological.
2. **Structured normalization:** events are standardized so replay is consistent.
3. **Episode-first UI:** day/project/meeting replay as the primary unit.
4. **Privacy-first portability roadmap:** control over what is collected and how long it is retained.

## 7) User Personas

### Persona A: Developer / Engineer

- **Pain:** “Why did we do that?” and “What changed since last sprint?”
- **Wants:** commit + issue + chat + browser/context reconstructed into a timeline.
- **Willingness to pay:** pro-priced for time saved and fewer context-switches.

### Persona B: Knowledge Worker (Ops / PM)

- **Pain:** lost meeting decisions, unclear project history, scattered notes.
- **Wants:** meeting episode replay + related artifacts.
- **Willingness to pay:** pays for reliable recall and team-wide memory later.

### Persona C: Creator / Researcher

- **Pain:** learning trails reset; links and references don’t preserve intent.
- **Wants:** learning journey episodes with sources and captured notes.
- **Willingness to pay:** if replay improves “continuation speed”.

### Persona D: Student / Learner

- **Pain:** “What did I study and what did I conclude?”
- **Wants:** day-by-day replay and project-like learning journeys.
- **Willingness to pay:** free/low-cost tier; upsell for unlimited history.

## 8) User Journey (High Level)

1. **Onboarding:** user creates account and sets collection permissions.
2. **Sync / ingestion:** connectors (later) or manual/API ingestion (MVP).
3. **Timeline replay:** user selects a date/project/episode and views replay segments.
4. **Search:** user asks natural-language questions (“what did we decide about X?”).
5. **Replay outcomes:** AI assistant proposes a summarized narrative and links back to replay timeline.

## 9) Feature Specifications (What the product does)

### 9.1 Timeline Replay (core)

- Group events by time segments (hour blocks for day replay; future: meeting span).
- Provide episode metadata: total events, source/type distribution, project filter.
- Support filtering by app/source and project ID.

### 9.2 AI Search (later, but designed for now)

- Convert queries into retrieval over stored normalized events.
- Generate answers grounded in replay timeline.
- Provide “show evidence” links back to events.

### 9.3 Project Replay

- Identify related events via projectId / tags and/or connector context.
- Render a project episode as a timeline with summaries.

### 9.4 Developer Memory / Meeting Memory / Learning Journey

- Each is a specialized episode view + tailored summarization and navigation.

### 9.5 Privacy controls (must-have)

- User chooses what to collect.
- Data retention policy per source.
- Ability to delete user data.

## 10) MVP (Minimum Viable Product)

### MVP Scope (v0.x)

1. **Manual/API event ingestion**
   - User creates/identifies account.
   - Client sends normalized “events”.
2. **Day replay**
   - UI selects `YYYY-MM-DD`.
   - Backend returns replay view (segments + events).
3. **Event browsing**
   - List events with filters (`from/to/source/projectId`).

### MVP Non-goals (explicitly not included)

- Auth/JWT (for MVP we pass `userId` until auth is built)
- Connector integrations (GitHub/Gmail/etc.)
- AI summarization generation (RAG layer later)

## 11) Pricing (TBD, with recommended structure)

Suggested structure:

- **Free:** limited history, manual ingestion, basic replay.
- **Pro:** higher retention + more event ingestion + semantic search (later phase).
- **Enterprise:** org-wide memory, compliance, admin controls.

**TBD:** exact $ values and retention limits after landing page + interview validation.

## 12) Business Model

Primary revenue drivers:
- subscription tiers (Pro/Enterprise),
- later add-ons: higher ingest capacity, team collaboration, compliance reports.

## 13) Go-to-Market

Phase 1 GTM (independent product validation):
- Target developer/knowledge communities via demos of “episode replay”.
- Publish short case-study videos: “Find the decision from last week in 30 seconds.”
- Run a small waitlist and close the loop with early feedback.

Messaging:
- “Recover context, not just information.”
- “Replay your workday/project/meeting.”

## 14) Roadmap

### Phase 1 (now): Episode replay foundation
- normalized event ingestion
- timeline replay + UI

### Phase 2: AI replay + semantic retrieval
- embeddings + retrieval
- RAG grounded replay summaries

### Phase 3: Knowledge graph + advanced navigation
- connect episodes to entities (people, repos, projects, topics)

### Phase 4: Enterprise + AI operating layer
- admin controls, org memory, audit and compliance

## 15) Risks (and mitigations)

1. **Data quality risk:** connectors may miss context or produce noisy events.  
   Mitigation: event schema versioning + validation + replay UX that highlights missing context.

2. **Privacy/regulatory risk:** cross-app memory can trigger user trust concerns.  
   Mitigation: privacy-first design, explicit permissions, retention controls, strong deletion guarantees.

3. **Replay accuracy risk:** reconstructing episodes might be “close but not right.”  
   Mitigation: deterministic replay from stored events first; AI only adds summarization later with evidence links.

4. **User adoption risk:** users may not trust a new workflow.  
   Mitigation: start with deterministic timeline replay that is obviously correct.

## 16) Future Vision

An AI operating layer that understands:
- what you were doing,
- what you decided,
- what you learned,
- and where your attention went—then helps you continue where you left off.

## 17) Development Roadmap (Concrete milestones)

### Milestones for Phase 1 (MVP readiness)

- Backend: event ingest + replay APIs stable and documented.
- UI: replay view works end-to-end with real user data.
- Instrumentation: track replay usage + success metrics.

## 18) v1 Decisions (Resolved)

These decisions finalize Phase 1 so we can design Phase 2 (HLD/LLD) without rework.

1. Primary Target Audience: **Developers (Primary)**
2. Privacy Strategy: **Hybrid (Local-First by Default)**
   - Default: collect events locally
   - User decides what syncs to the cloud
3. MVP Ingestion Source: **GitHub-first real connector**
   - Next: GitHub → VS Code extension → Chrome extension → Terminal collector → Calendar
4. Replay Time Semantics: **User local time**
   - Store internally in UTC
   - Display in user timezone
5. Pricing:
   - **Free:** 30 days history + GitHub connector + basic search + timeline
   - **Pro:** **$12/month** (unlimited history, AI Replay, semantic search, knowledge graph, AI summaries, cross-app memory, AI assistant, export, team)
   - **Team:** **$25/user/month**
   - **Enterprise:** custom (SSO, self-hosted, compliance, audit logs)

### Timezone contract (frontend ↔ backend)

**Preferred:** IANA timezone name (e.g. `Asia/Kolkata`, `America/New_York`).

| Approach | Example | Use |
|---|---|---|
| **IANA (preferred)** | `Asia/Kolkata` | DST-safe, correct day boundaries, standard for prod |
| Offset only | `+330` | Avoid for MVP — breaks on DST and ambiguous days |

**Frontend sends** `timezone` on every timeline/replay request:

```http
GET /timeline/replay?userId=...&date=2026-07-20&timezone=Asia/Kolkata
```

**Rules:**
- Store all `occurredAt` values in **UTC** (ISO 8601 with `Z`).
- Backend converts UTC → local for **day bounds** and **hour segments**.
- UI never shows raw UTC to users.

**Frontend implementation:**

```ts
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// e.g. "Asia/Kolkata"
```

Note: current backend replay groups by UTC hour; Phase 2 will add `timezone` support on timeline endpoints.

