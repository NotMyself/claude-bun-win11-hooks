# Feature: F010 - Plan Events Capture

## Context
See `context.md`. Capture plan orchestration events from manifest.jsonl.

## Prior Work
F000-F009 completed

## Objective
Watch dev/active/*/manifest.jsonl for status changes and emit plan events.

## Decisions
- **D008**: Watch manifest.jsonl for orchestration events

## Code References
- `code/typescript.md#file-watching`

## Files
- `hooks/metrics/plan-events.ts`
- `hooks/metrics/__tests__/plan-events.test.ts`

## Implementation
PlanEventsCapture class:
- Watch dev/active/ for manifest.jsonl files
- Detect status changes (pending → in_progress → completed/failed)
- Emit events: feature_started, feature_completed, feature_failed
- Feed PlanEvent objects to collector

## Acceptance Criteria
- [ ] Watches manifest.jsonl files
- [ ] Detects status changes
- [ ] Emits correct event types
- [ ] Tests pass

## Verification
```bash
bun test hooks/metrics/__tests__/plan-events.test.ts
```

## Commit
```bash
git add hooks/metrics/plan-events.ts hooks/metrics/__tests__/plan-events.test.ts
git commit -m "feat(metrics): add plan events capture

Implements: F010
Decisions: D008"
```

## Next
Proceed to: `prompts/09-aggregation.md` (F011)
