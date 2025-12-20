# Feature: F025 - Integration Tests

## Context
See `testing-strategy.md#integration-tests`.

## Prior Work
F000-F024 completed

## Objective
Test data flow across multiple components.

## Files
- `hooks/handlers/__tests__/integration.test.ts`

## Implementation
Integration test scenarios:
- Hook handler → MetricsCollector → Database
- TranscriptParser → MetricsCollector → Database
- PlanEvents → Database → API
- MetricsCollector → EventEmitter → SSE

## Acceptance Criteria
- [ ] End-to-end data flows work
- [ ] All integration tests pass

## Verification
```bash
bun test hooks/handlers/__tests__/integration.test.ts
```

## Commit
```bash
git add hooks/handlers/__tests__/integration.test.ts
git commit -m "test(integration): add data pipeline tests

Implements: F025"
```

## Next
Proceed to: `prompts/23-api-tests.md` (F026)
