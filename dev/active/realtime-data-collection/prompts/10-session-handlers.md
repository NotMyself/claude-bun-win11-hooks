# Feature: F012 - Session Handlers

## Context
See `context.md`. Implement session lifecycle hook handlers.

## Prior Work
F000-F011 completed (core infrastructure ready)

## Objective
Create session-start.ts and session-end.ts hook handlers.

## Code References
- `code/typescript.md#hook-handlers`

## Files
- `hooks/handlers/session-start.ts`
- `hooks/handlers/session-end.ts`

## Implementation
- session-start: Collect session_started metric, start viewer, start transcript parser
- session-end: Collect session_ended metric, flush collector, stop viewer

Both use MetricsCollector to emit metrics.

## Acceptance Criteria
- [ ] Handlers emit correct metric types
- [ ] session-start starts necessary services
- [ ] session-end cleans up gracefully
- [ ] Type-safe hook signatures

## Verification
```bash
bun run tsc --noEmit hooks/handlers/session-start.ts hooks/handlers/session-end.ts
```

## Commit
```bash
git add hooks/handlers/session-start.ts hooks/handlers/session-end.ts
git commit -m "feat(handlers): add session lifecycle handlers

Implements: F012"
```

## Next
Proceed to: `prompts/11-user-handlers.md` (F013)
