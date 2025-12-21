# Feature: F024 - Unit Tests for Core Modules

## Context
See `context.md` and `testing-strategy.md`.

## Prior Work
F000-F023 completed (implementation done)

## Objective
Ensure comprehensive unit test coverage for all core modules.

## Code References
- `code/typescript.md#testing-patterns`
- `testing-strategy.md#unit-tests`

## Files to Review/Enhance
All `__tests__/*.test.ts` files in hooks/metrics/

## Implementation
Review and enhance tests for:
- Database operations
- MetricsCollector
- TranscriptParser
- CostCalculator
- PlanEvents
- AggregationService
- EventEmitter

Ensure >80% coverage.

## Acceptance Criteria
- [ ] All unit tests pass
- [ ] Coverage >80%
- [ ] Edge cases tested
- [ ] Mock external dependencies

## Verification
```bash
bun test hooks/metrics/__tests__/
bun test --coverage
```

## Commit
```bash
git add hooks/metrics/__tests__/*.test.ts
git commit -m "test(metrics): enhance unit test coverage

Implements: F024"
```

## Next
Proceed to: `prompts/22-integration-tests.md` (F025)
