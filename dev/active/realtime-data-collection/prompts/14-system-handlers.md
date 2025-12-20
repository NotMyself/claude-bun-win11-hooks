# Feature: F016 - System Event Handlers

## Context
See `context.md`. Handle system notifications, compaction, and permissions.

## Prior Work
F000-F015 completed

## Objective
Create notification.ts, pre-compact.ts, permission-request.ts handlers.

## Files
- `hooks/handlers/notification.ts`
- `hooks/handlers/pre-compact.ts`
- `hooks/handlers/permission-request.ts`

## Implementation
- notification: Log system notifications
- pre-compact: Log context compaction events
- permission-request: Log permission decisions

## Verification
```bash
bun run tsc --noEmit hooks/handlers/*.ts
```

## Commit
```bash
git add hooks/handlers/notification.ts hooks/handlers/pre-compact.ts hooks/handlers/permission-request.ts
git commit -m "feat(handlers): add system event handlers

Implements: F016"
```

## Next
Proceed to: `prompts/15-viewer-security-config.md` (F017, F018)
