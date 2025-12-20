# Feature: F007 - MetricsCollector

## Context
See `context.md`. Central orchestrator for metric collection.

## Prior Work
F000-F006 completed

## Objective
Implement MetricsCollector class that buffers metrics, emits events, and flushes to database.

## Decisions
- **D006**: Event emitter pattern

## Edge Cases
- **EC001**: SQLite locked (handled by Database layer)
- **EC004**: High volume writes → batch in memory

## Code References
- `code/typescript.md#core-classes` - MetricsCollector

## Files
- `hooks/metrics/collector.ts`
- `hooks/metrics/index.ts` - Public exports
- `hooks/metrics/__tests__/collector.test.ts`

## Implementation
MetricsCollector with:
- `collect(metric)` - Add to buffer, emit event
- `flush()` - Write buffer to database
- Auto-flush timer (5s) and size limit (100 entries)
- `shutdown()` - Final flush

## Acceptance Criteria
- [ ] Buffers metrics efficiently
- [ ] Emits events for realtime streaming
- [ ] Auto-flushes on timer and size
- [ ] Graceful shutdown flushes remaining
- [ ] Tests pass

## Verification
```bash
bun test hooks/metrics/__tests__/collector.test.ts
```

## Commit
```bash
git add hooks/metrics/collector.ts hooks/metrics/index.ts hooks/metrics/__tests__/collector.test.ts
git commit -m "feat(metrics): implement metrics collector

Implements: F007
Decisions: D006
Edge Cases: EC004"
```

## Next
Proceed to: `prompts/06-transcript-parser.md` (F008)
