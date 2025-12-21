# Feature: F022 - Sessions API Endpoints

## Context
See `context.md`. REST API for session summaries.

## Prior Work
F000-F021 completed

## Objective
Implement /api/sessions endpoints.

## Files
- `hooks/viewer/api/sessions.ts`
- `hooks/viewer/__tests__/api/sessions.test.ts`

## Implementation
Endpoints:
- GET /api/sessions - List sessions
- GET /api/sessions/:id - Session details with metrics

## Verification
```bash
bun test hooks/viewer/__tests__/api/sessions.test.ts
```

## Commit
```bash
git add hooks/viewer/api/sessions.ts hooks/viewer/__tests__/api/sessions.test.ts
git commit -m "feat(viewer): add sessions API endpoints

Implements: F022"
```

## Next
Proceed to: `prompts/20-sse-streaming.md` (F023)
