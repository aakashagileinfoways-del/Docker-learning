# AI Time Machine — Phase 4 (JWT + Security) — All-in-One Guide

**Goal:** One document that explains “how to do it” end-to-end: authentication, GitHub onboarding, event ingestion, timeline replay, and free-tier retention.

This guide is written for frontend/UI engineers and backend API consumers.

---

## 1) System Overview (What exists in Phase 4)

Phase 4 adds:

- JWT authentication (protected routes)
- Password hashing (bcrypt) on signup/login
- Encrypted GitHub connector tokens (AES-256-GCM)
- Free-tier retention enforcement (30 days)

The API still uses **UTC** for storage timestamps, but timeline display is in **user local time**, using an IANA timezone string.

---

## 2) Base URL and Headers

### Base URL

- Development backend runs on `http://localhost:3000` (see backend `PORT`).

### Authentication header (required for protected endpoints)

- `Authorization: Bearer <accessToken>`

### Timezone inputs

- `timezone` uses **IANA** format, for example: `Asia/Kolkata`
- Timeline date uses `YYYY-MM-DD` in the user’s local calendar day
- `occurredAt` is always an ISO 8601 UTC timestamp string, for example: `2026-07-20T10:30:00.000Z`

---

## 3) End-to-End Process (Frontend flow)

### Step A — Sign up (get JWT)

1. Call `POST /user/create`
2. Receive:
   - `user` (public profile)
   - `accessToken` (JWT)
3. Frontend stores:
   - `accessToken` for future requests
   - `user` for UI (no password stored)

### Step B — (Optional) Login later

1. Call `POST /auth/login`
2. Receive the same token response as signup

### Step C — Connect GitHub

1. Call `POST /connectors/github/connect` with an access token
2. Receive confirmation with GitHub username

> You provide a GitHub PAT (Personal Access Token) created on GitHub.

### Step D — Sync GitHub activity into events

1. Call `POST /connectors/github/sync`
2. Receive counts:
   - `synced` = newly inserted events
   - `skipped` = duplicates already stored

### Step E — Replay a day (Timeline UI)

1. Call `GET /timeline/replay` with:
   - `date`
   - `timezone`
   - optional `projectId` (repo full name, e.g. `owner/repo`)
2. Receive:
   - hourly `segments` with events grouped in the user’s local time
   - `sources`, `types` summary counts
   - free-tier retention metadata

---

## 4) Endpoints Reference (Request / Response)

### Conventions used below

- All responses are JSON.
- If a request fails validation, you get `400 Bad Request` with validation messages.
- If you use a missing/invalid/expired JWT, you get `401 Unauthorized`.

---

## 4.1 Public Endpoints

### GET `/hello`

**Purpose:** Basic health check.

**Auth:** None

**Request:** no body

**Response (200):**
{
"message": "Hello World!"
}

---

### POST `/user/create`

**Purpose:** Create a new user account and immediately return a JWT.

**Auth:** None

**Request body:**
{
"name": "string",
"email": "string (email format)",
"password": "string (min 6 chars)",
"timezone": "string (optional, currently stored; defaults to UTC)"
}

**Response (200):**
{
"user": {
"_id": "string",
"name": "string",
"email": "string",
"timezone": "string",
"tier": "free | pro | team | enterprise",
"createdAt": "ISO UTC (optional)",
"updatedAt": "ISO UTC (optional)"
},
"accessToken": "string",
"tokenType": "Bearer",
"expiresIn": "string (e.g. 7d)"
}

**Errors:**

- `409 Conflict`: email already registered

---

### POST `/auth/login`

**Purpose:** Login and get a JWT.

**Auth:** None

**Request body:**
{
"email": "string (email format)",
"password": "string"
}

**Response (200):** same shape as `POST /user/create`:
{
"user": { ...public user... },
"accessToken": "string",
"tokenType": "Bearer",
"expiresIn": "string"
}

**Errors:**

- `401 Unauthorized`: invalid email/password

---

## 4.2 Protected Endpoints (JWT required)

All protected endpoints use the authenticated user from the JWT.

> You must NOT send `userId` in query params or request bodies for these endpoints in Phase 4.

---

### Timeline

#### GET `/timeline/day`

**Purpose:** List all events for one local calendar day.

**Auth:** JWT Bearer

**Query parameters:**

- `date` (required): `YYYY-MM-DD`
- `timezone` (required): IANA timezone string

**Response (200):**
{
"userId": "string",
"date": "YYYY-MM-DD",
"timezone": "IANA string",
"tier": "free | pro | team | enterprise",
"retentionDays": 30 | null,
"retentionCutoff": "ISO UTC string | null",
"totalEvents": number,
"events": [ /* event objects */ ]
}

---

#### GET `/timeline/range`

**Purpose:** List events between two timestamps (no local-day conversion).

**Auth:** JWT Bearer

**Query parameters:**

- `from` (required): ISO UTC string
- `to` (required): ISO UTC string

**Response (200):**
{
"userId": "string",
"from": "ISO UTC string",
"to": "ISO UTC string",
"tier": "...",
"retentionDays": 30 | null,
"retentionCutoff": "ISO UTC string | null",
"totalEvents": number,
"events": [ /* event objects */ ]
}

---

#### GET `/timeline/replay`

**Purpose:** Main UI endpoint. Returns hour segments grouped in the user’s local time.

**Auth:** JWT Bearer

**Query parameters:**

- `date` (required): `YYYY-MM-DD`
- `timezone` (required): IANA timezone
- `projectId` (optional): GitHub repo full name (example: `owner/repo`)

**Response (200):**
{
"userId": "string",
"date": "YYYY-MM-DD",
"timezone": "IANA string",
"tier": "...",
"retentionDays": 30 | null,
"retentionCutoff": "ISO UTC string | null",
"totalEvents": number,
"sources": { "github": number, "manual": number, ... },
"types": { "commit": number, "note": number, ... },
"segments": [
{
"hour": 0,
"label": "HH:00",
"events": [ /* event objects _/ ]
}
],
"events": [ /_ full event list */ ]
}

---

### Events

#### POST `/events`

**Purpose:** Ingest one normalized event.

**Auth:** JWT Bearer

**Request body:**
{
"source": "enum (gmail|slack|github|vscode|chrome|calendar|notion|drive|photos|manual)",
"type": "enum (email|message|commit|file_edit|browse|meeting|note|file|photo|other)",
"title": "string",
"content": "string (optional)",
"summary": "string (optional)",
"occurredAt": "ISO UTC string",
"projectId": "string (optional)",
"tags": ["string"] (optional),
"sourceEventId": "string (optional, enables dedupe)",
"metadata": { "object": "any" } (optional)
}

**Response (200):**

- The created event document (including `_id`, `createdAt`, `updatedAt`)

---

#### POST `/events/batch`

**Purpose:** Ingest multiple normalized events.

**Auth:** JWT Bearer

**Request body:**
{
"events": [ { /* CreateEvent fields _/ }, { /_ CreateEvent fields */ } ]
}

**Response (200):**

- Array of created event documents

**Notes:**

- Duplicate `sourceEventId` inserts are skipped server-side (partial success).

---

#### GET `/events`

**Purpose:** List/filter events for the authenticated user.

**Auth:** JWT Bearer

**Query parameters (optional):**

- `from` (ISO UTC)
- `to` (ISO UTC)
- `source` (enum)
- `projectId` (repo full name, etc.)

**Response (200):**
{
"tier": "...",
"retentionDays": 30 | null,
"retentionCutoff": "ISO UTC string | null",
"totalEvents": number,
"events": [ /* event objects */ ]
}

---

### GitHub Connector

#### POST `/connectors/github/connect`

**Purpose:** Validate a GitHub PAT and store the encrypted connection for this user.

**Auth:** JWT Bearer

**Request body:**
{
"accessToken": "ghp_..."
}

**Response (200):**
{
"connected": true,
"username": "string"
}

**Notes:**

- Token is encrypted at rest before production.

---

#### POST `/connectors/github/sync`

**Purpose:** Pull GitHub activity and ingest it into normalized events.

**Auth:** JWT Bearer

**Request:** empty JSON body or no body

**Response (200):**
{
"synced": number,
"skipped": number
}

---

#### GET `/connectors/github/status`

**Purpose:** Check whether GitHub is connected.

**Auth:** JWT Bearer

**Query:** none

**Response (200) when connected:**
{
"connected": true,
"username": "string",
"lastSyncedAt": "ISO UTC string | null"
}

**Response (200) when not connected:**
{
"connected": false
}

---

## 5) Free-Tier Retention (What the UI should do)

When the authenticated user’s tier is `free`, the server enforces:

- **30 days history**

Timeline and event list responses include:

- `retentionDays` (30 for free, otherwise `null`)
- `retentionCutoff` (an ISO UTC timestamp)

Recommended UI behavior:

1. If `tier === "free"`, disable date selection older than `retentionCutoff`.
2. Show a banner when the user attempts to view older dates.
3. Display `retentionDays` and offer upgrade CTAs.

---

## 6) Common Errors (and what to do)

1. **401 Unauthorized**
   - JWT missing/invalid/expired
   - Action: redirect to login and clear stored tokens

2. **400 Bad Request**
   - Validation failed (bad enum, missing required fields, invalid timezone, invalid date formats)
   - Action: surface error messages to user/dev

3. **409 Conflict**
   - Email already registered
   - Duplicate event based on dedupe rules (GitHub sync can treat duplicates as normal and counts them as `skipped`)

---

## 7) Quick “How to do it” Checklist

1. Signup: `POST /user/create` → store `accessToken`
2. Login later: `POST /auth/login`
3. GitHub: `POST /connectors/github/connect` → `POST /connectors/github/sync`
4. Replay: `GET /timeline/replay?date=YYYY-MM-DD&timezone=IANA&projectId?`
5. Always send `Authorization: Bearer ...` for protected requests
6. Respect `retentionCutoff` and show free-tier upgrade prompts
