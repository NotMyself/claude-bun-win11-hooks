# Feature: F006 - Configuration Module

## Context
See `context.md`. Define configuration constants for metrics system.

## Prior Work
F000-F005 completed

## Objective
Create configuration module with defaults and environment variable support.

## Code References
- `code/typescript.md#configuration-types`

## Files
- `hooks/metrics/config.ts`

## Implementation
Export `DEFAULT_METRICS_CONFIG` with:
- Database path
- Archive directory
- Aggregation intervals
- Transcript watching config
- Plan watching config

Support environment variable overrides.

## Acceptance Criteria
- [ ] DEFAULT_METRICS_CONFIG exported
- [ ] All config values documented
- [ ] Type-safe configuration

## Verification
```bash
bun run tsc --noEmit hooks/metrics/config.ts
```

## Commit
```bash
git add hooks/metrics/config.ts
git commit -m "feat(metrics): add configuration module

Implements: F006"
```

## Next
Proceed to: `prompts/05-collector.md` (F007)
