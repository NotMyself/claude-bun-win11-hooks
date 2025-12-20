# Feature: F021 - Plans API Endpoints

## Context
See `context.md`. REST API for plan orchestration events.

## Prior Work
F000-F020 completed

## Objective
Implement /api/plans/events endpoints.

## Files
- `hooks/viewer/api/plans.ts`
- `hooks/viewer/__tests__/api/plans.test.ts`

## Implementation
Endpoints:
- GET /api/plans/events - All plan events
- GET /api/plans/events/:plan - Events for specific plan

## Verification
```bash
bun test hooks/viewer/__tests__/api/plans.test.ts
```

## Commit
```bash
git add hooks/viewer/api/plans.ts hooks/viewer/__tests__/api/plans.test.ts
git commit -m "feat(viewer): add plans API endpoints

Implements: F021"
```

## Next
Proceed to: `prompts/19-sessions-api.md` (F022)
