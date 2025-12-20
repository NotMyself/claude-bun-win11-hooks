# Feature: F011 - Aggregation Service

## Context
See `context.md`. Time-window aggregations for metrics.

## Prior Work
F000-F010 completed

## Objective
Implement service that calculates hourly/daily/weekly/monthly aggregations.

## Code References
- `code/typescript.md#calculation-logic`
- `code/sql.md#aggregation-queries`
- `code/sql.md#time-window-aggregations`

## Files
- `hooks/metrics/aggregation-service.ts`
- `hooks/metrics/__tests__/aggregation-service.test.ts`

## Implementation
AggregationService class:
- `aggregate(options: AggregationOptions)` 
- Time window calculations (hour, day, week, month)
- Group by model, event_type, session
- Cache results in metric_aggregations table

## Acceptance Criteria
- [ ] Hourly/daily/weekly/monthly aggregations work
- [ ] Group by functionality correct
- [ ] Results cached in database
- [ ] Tests pass

## Verification
```bash
bun test hooks/metrics/__tests__/aggregation-service.test.ts
```

## Commit
```bash
git add hooks/metrics/aggregation-service.ts hooks/metrics/__tests__/aggregation-service.test.ts
git commit -m "feat(metrics): add aggregation service

Implements: F011"
```

## Next
Proceed to: `prompts/10-session-handlers.md` (F012)
