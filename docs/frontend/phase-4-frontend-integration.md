# Phase 4 — Frontend Integration (JWT Auth & Security)

**Backend phase:** JWT auth, password hashing, encrypted GitHub tokens, free-tier retention  
**Status:** Implemented  
**Breaking change:** Protected routes no longer accept `userId` in query/body — use JWT Bearer token.

---

## 1. What changed

| Before (Phase 1–3) | After (Phase 4) |
|---|---|
| Pass `userId` on every request | Send `Authorization: Bearer <token>` |
| Signup returns user with password | Signup returns `{ user, accessToken }` |
| Plaintext passwords in DB | bcrypt hashed |
| GitHub PAT stored plaintext | AES-256-GCM encrypted |
| Unlimited history | Free tier: **30 days** enforced on backend |

---

## 2. Environment

No frontend env changes:

```env
VITE_API_URL=http://localhost:3000
```

---

## 3. Auth flow

### Signup — `POST /user/create`

**Request:**

```json
{
  "name": "Aakash Sharma",
  "email": "aakash@example.com",
  "password": "secret123"
}
```

**Response:**

```json
{
  "user": {
    "_id": "674a...",
    "name": "Aakash Sharma",
    "email": "aakash@example.com",
    "timezone": "UTC",
    "tier": "free"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": "7d"
}
```

**No password in response.**

### Login — `POST /auth/login`

```json
{
  "email": "aakash@example.com",
  "password": "secret123"
}
```

Same response shape as signup.

---

## 4. Session storage

```ts
// src/lib/session.ts

const TOKEN_KEY = 'atm_accessToken';
const USER_KEY = 'atm_user';

export interface StoredUser {
  _id: string;
  name: string;
  email: string;
  timezone: string;
  tier: 'free' | 'pro' | 'team' | 'enterprise';
}

export function saveAuth(user: StoredUser, accessToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn(): boolean {
  return !!getAccessToken();
}
```

---

## 5. API client (with JWT)

```ts
// src/lib/api.ts
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function getToken() {
  return localStorage.getItem('atm_accessToken');
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));

  if (res.status === 401) {
    clearAuth();
    window.location.href = '/app/login';
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const msg = Array.isArray(body.message)
      ? body.message.join(', ')
      : body.message ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return body;
}

export const api = {
  // Public
  createUser: (data: { name: string; email: string; password: string }) =>
    request<AuthResponse>('/user/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  health: () => request<{ message: string }>('/hello'),

  // Protected — JWT required, NO userId param
  replayDay: (date: string, projectId?: string) => {
    const q = new URLSearchParams({ date, timezone: getTimezone() });
    if (projectId) q.set('projectId', projectId);
    return request<TimelineReplay>(`/timeline/replay?${q}`);
  },

  listEvents: (params?: { from?: string; to?: string; source?: string; projectId?: string }) => {
    const q = new URLSearchParams();
    if (params?.from) q.set('from', params.from);
    if (params?.to) q.set('to', params.to);
    if (params?.source) q.set('source', params.source);
    if (params?.projectId) q.set('projectId', params.projectId);
    return request<EventsListResponse>(`/events?${q}`);
  },

  createEvent: (data: CreateEventPayload) =>
    request('/events', { method: 'POST', body: JSON.stringify(data) }),

  connectGitHub: (accessToken: string) =>
    request('/connectors/github/connect', {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
    }),

  syncGitHub: () =>
    request<{ synced: number; skipped: number }>('/connectors/github/sync', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  getGitHubStatus: () =>
    request<GitHubStatus>('/connectors/github/status'),
};

type AuthResponse = {
  user: StoredUser;
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
};

type EventsListResponse = {
  tier: string;
  retentionDays: number | null;
  retentionCutoff: string | null;
  totalEvents: number;
  events: Event[];
};

type TimelineReplay = {
  tier: string;
  retentionDays: number | null;
  retentionCutoff: string | null;
  totalEvents: number;
  segments: TimelineSegment[];
  events: Event[];
  sources: Record<string, number>;
  types: Record<string, number>;
  date: string;
  timezone: string;
};
```

---

## 6. Updated endpoints (no userId)

| Endpoint | Auth | Notes |
|---|---|---|
| `POST /user/create` | Public | Returns token |
| `POST /auth/login` | Public | Returns token |
| `GET /hello` | Public | Health check |
| `GET /timeline/replay` | JWT | `?date&timezone&projectId?` |
| `GET /timeline/day` | JWT | `?date&timezone` |
| `GET /timeline/range` | JWT | `?from&to` |
| `GET /events` | JWT | filters only |
| `POST /events` | JWT | no userId in body |
| `POST /connectors/github/connect` | JWT | `{ accessToken }` only |
| `POST /connectors/github/sync` | JWT | empty body `{}` |
| `GET /connectors/github/status` | JWT | no query params |

---

## 7. Signup page update

```tsx
async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const form = new FormData(e.currentTarget);

  const res = await api.createUser({
    name: String(form.get('name')),
    email: String(form.get('email')),
    password: String(form.get('password')),
  });

  saveAuth(res.user, res.accessToken);
  navigate('/app/replay');
}
```

---

## 8. Login page (new)

```tsx
// src/pages/Login.tsx
async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const form = new FormData(e.currentTarget);

  const res = await api.login({
    email: String(form.get('email')),
    password: String(form.get('password')),
  });

  saveAuth(res.user, res.accessToken);
  navigate('/app/replay');
}
```

---

## 9. Free tier retention (backend enforced)

Replay and list responses now include:

```json
{
  "tier": "free",
  "retentionDays": 30,
  "retentionCutoff": "2026-06-20T00:00:00.000Z"
}
```

**Frontend should:**

- Use `retentionCutoff` as date picker `min` value
- Show upgrade banner when `tier === 'free'`
- Don't send `userId` — tier comes from JWT + response

```tsx
{replay.tier === 'free' && (
  <p>Free plan: showing last {replay.retentionDays} days.
    <a href="/app/upgrade">Upgrade to Pro</a> for unlimited history.
  </p>
)}
```

---

## 10. Route protection

```tsx
// src/components/RequireAuth.tsx
import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '@/lib/session';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) {
    return <Navigate to="/app/login" replace />;
  }
  return <>{children}</>;
}
```

```tsx
// router
<Route path="/app/replay" element={<RequireAuth><ReplayPage /></RequireAuth>} />
```

---

## 11. Migration from Phase 1–3

Remove from frontend:

- `localStorage atm_userId` as primary auth (keep user object instead)
- `userId` query param on timeline/events/github calls
- `userId` in POST bodies

Add:

- Store `atm_accessToken`
- `Authorization` header on all protected calls
- Login page at `/app/login`

---

## 12. Error reference

| Status | Meaning | Action |
|---|---|---|
| `401` | Invalid/expired JWT | Redirect to login |
| `409` | Email already registered | Show on signup |
| `409` | Duplicate event | Normal on GitHub re-sync |
| `404` | GitHub not connected | Show connect UI |

---

## 13. Phase 4 checklist

- [ ] Signup saves `accessToken` + `user` (not password)
- [ ] Login page calls `POST /auth/login`
- [ ] All protected API calls send `Authorization: Bearer ...`
- [ ] Remove `userId` from all request params/bodies
- [ ] Handle `401` → redirect to login
- [ ] Date picker respects `retentionCutoff` from API
- [ ] Show free tier banner using `tier` + `retentionDays`
- [ ] GitHub connect sends only `{ accessToken }`
