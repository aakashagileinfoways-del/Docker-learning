# Phase 1 — Frontend Integration

**Scope:** User signup and session  
**Status:** Implemented

## Setup

```env
VITE_API_URL=http://localhost:3000
```

## Types

```ts
export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
}
```

## API

### `POST /user/create`

```json
{ "name": "Aakash", "email": "a@example.com", "password": "secret" }
```

Response: user with `_id` — save to `localStorage` as `atm_userId`.

## Session helper

```ts
export function saveSession(user: User) {
  localStorage.setItem('atm_userId', user._id);
  localStorage.setItem('atm_userName', user.name);
}
export function getUserId() {
  return localStorage.getItem('atm_userId');
}
```

## Checklist

- [ ] Signup form → `POST /user/create`
- [ ] Save `user._id` locally
- [ ] Redirect to `/app/replay` after signup
- [ ] Handle `400` validation errors

See [phase-3-frontend-integration.md](phase-3-frontend-integration.md) for the complete API client.
