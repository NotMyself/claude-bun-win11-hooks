# Feature: F026 - API Endpoint Tests

## Context
See `testing-strategy.md#api-tests`.

## Prior Work
F000-F025 completed

## Objective
Test all HTTP API endpoints.

## Files
Review/enhance:
- `hooks/viewer/__tests__/api/metrics.test.ts`
- `hooks/viewer/__tests__/api/plans.test.ts`
- `hooks/viewer/__tests__/api/sessions.test.ts`
- `hooks/viewer/__tests__/sse/events.test.ts`

## Implementation
Test each endpoint:
- Correct HTTP methods
- Query parameter handling
- Error responses
- Security enforcement

## Acceptance Criteria
- [ ] All endpoints tested
- [ ] Error cases covered
- [ ] All tests pass

## Verification
```bash
bun test hooks/viewer/__tests__/api/
```

## Commit
```bash
git add hooks/viewer/__tests__/
git commit -m "test(api): enhance API endpoint tests

Implements: F026"
```

## Next
Proceed to: `prompts/24-handler-tests.md` (F027)
