# Feature: F023 - SSE Streaming

## Context
See `context.md`. Realtime metric streaming via Server-Sent Events.

## Prior Work
F000-F022 completed

## Objective
Implement SSE endpoints for realtime updates.

## Edge Cases
- **EC005**: Concurrent SSE connections → rate limit

## Code References
- `code/typescript.md#sse-handlers`

## Files
- `hooks/viewer/sse/events.ts`
- `hooks/viewer/__tests__/sse/events.test.ts`

## Implementation
Endpoints:
- GET /events/metrics - Stream new metrics
- GET /events/plans - Stream plan events

Use EventEmitter to push updates to SSE clients.
Apply rate limiting (5 connections per IP per 60s).

## Acceptance Criteria
- [ ] SSE streams work correctly
- [ ] Rate limiting enforced
- [ ] Clients receive realtime updates
- [ ] Tests pass

## Verification
```bash
bun test hooks/viewer/__tests__/sse/events.test.ts
```

## Commit
```bash
git add hooks/viewer/sse/events.ts hooks/viewer/__tests__/sse/events.test.ts
git commit -m "feat(viewer): add SSE streaming endpoints

Implements: F023
Edge Cases: EC005"
```

## Next
Proceed to: `prompts/21-unit-tests.md` (F024)
