# Feature: F020 - Metrics API Endpoints

## Context
See `context.md`. REST API for querying metrics.

## Prior Work
F000-F019 completed

## Objective
Implement /api/metrics endpoints.

## Code References
- `code/typescript.md#api-handlers`

## Files
- `hooks/viewer/api/metrics.ts`
- `hooks/viewer/__tests__/api/metrics.test.ts`

## Implementation
Endpoints:
- GET /api/metrics - Query with filters
- GET /api/metrics/aggregations - Time-window aggregations
- GET /api/metrics/costs - Cost analysis
- POST /api/metrics/export - Trigger export

## Acceptance Criteria
- [ ] All endpoints return correct data
- [ ] Query filters work
- [ ] JSON responses
- [ ] Tests pass

## Verification
```bash
bun test hooks/viewer/__tests__/api/metrics.test.ts
```

## Commit
```bash
git add hooks/viewer/api/metrics.ts hooks/viewer/__tests__/api/metrics.test.ts
git commit -m "feat(viewer): add metrics API endpoints

Implements: F020"
```

## Next
Proceed to: `prompts/18-plans-api.md` (F021)
