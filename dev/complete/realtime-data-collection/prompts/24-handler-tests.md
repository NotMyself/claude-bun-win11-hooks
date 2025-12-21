# Feature: F027 - Hook Handler Tests

## Context
See `testing-strategy.md#handler-tests`.

## Prior Work
F000-F026 completed

## Objective
Test all 12 hook handlers with MetricsCollector.

## Files
- `hooks/handlers/__tests__/session-handlers.test.ts`
- `hooks/handlers/__tests__/user-handlers.test.ts`
- `hooks/handlers/__tests__/tool-handlers.test.ts`

## Implementation
Test each handler:
- Correct metrics emitted
- Hook return values correct
- Error handling

## Acceptance Criteria
- [ ] All handlers tested
- [ ] Metrics verified
- [ ] All tests pass

## Verification
```bash
bun test hooks/handlers/__tests__/
```

## Commit
```bash
git add hooks/handlers/__tests__/
git commit -m "test(handlers): add hook handler tests

Implements: F027"
```

## Next
Proceed to: `prompts/25-documentation.md` (F028)
