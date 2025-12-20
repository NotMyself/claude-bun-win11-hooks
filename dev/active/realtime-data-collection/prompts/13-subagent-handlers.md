# Feature: F015 - Subagent Handlers

## Context
See `context.md`. Track subagent lifecycle.

## Prior Work
F000-F014 completed

## Objective
Create subagent-start.ts and subagent-stop.ts handlers.

## Files
- `hooks/handlers/subagent-start.ts`
- `hooks/handlers/subagent-stop.ts`

## Implementation
- subagent-start: Log subagent spawn with ID
- subagent-stop: Log subagent completion

## Verification
```bash
bun run tsc --noEmit hooks/handlers/subagent-*.ts
```

## Commit
```bash
git add hooks/handlers/subagent-start.ts hooks/handlers/subagent-stop.ts
git commit -m "feat(handlers): add subagent lifecycle handlers

Implements: F015"
```

## Next
Proceed to: `prompts/14-system-handlers.md` (F016)
