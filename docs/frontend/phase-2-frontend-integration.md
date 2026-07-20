# Phase 2 — Frontend Integration

**Scope:** Events, timeline replay (IANA timezone), GitHub connector  
**Status:** Implemented

## Timezone (required)

```ts
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
```

Send on all timeline calls:

```http
GET /timeline/replay?userId=...&date=2026-07-20&timezone=Asia/Kolkata
```

## Key endpoints

| Endpoint | Purpose |
|---|---|
| `GET /timeline/replay` | Main replay UI (segments + stats) |
| `GET /timeline/day` | Flat event list for a day |
| `GET /events` | Filtered event list |
| `POST /connectors/github/connect` | Connect PAT |
| `POST /connectors/github/sync` | Pull GitHub activity |
| `GET /connectors/github/status` | Connection status |

## GitHub flow

1. User pastes PAT from https://github.com/settings/tokens
2. `POST /connectors/github/connect` with `{ userId, accessToken }`
3. `POST /connectors/github/sync` with `{ userId }`
4. Open replay — events appear under `github` source

## Replay response shape

```json
{
  "timezone": "Asia/Kolkata",
  "segments": [{ "hour": 9, "label": "09:00", "events": [] }],
  "sources": { "github": 10 },
  "types": { "commit": 8 }
}
```

## Checklist

- [ ] Send `timezone` on `/timeline/day` and `/timeline/replay`
- [ ] Date picker uses local `YYYY-MM-DD`
- [ ] GitHub settings: connect → sync
- [ ] Render `segments` as hourly timeline

See [phase-3-frontend-integration.md](phase-3-frontend-integration.md) for full types and API client.
