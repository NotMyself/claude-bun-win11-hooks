# Feature: F014 - Tool Execution Handlers

## Context
See `context.md`. Track tool usage and performance.

## Prior Work
F000-F013 completed

## Objective
Create pre-tool-use.ts, post-tool-use.ts, post-tool-use-failure.ts handlers.

## Code References
- `code/typescript.md#hook-handlers`

## Files
- `hooks/handlers/pre-tool-use.ts`
- `hooks/handlers/post-tool-use.ts`
- `hooks/handlers/post-tool-use-failure.ts`

## Implementation
- pre-tool-use: Start timing, emit tool_start metric
- post-tool-use: End timing, emit tool_completed with duration and success
- post-tool-use-failure: Emit tool_failed metric

## Acceptance Criteria
- [ ] Tool timing captured accurately
- [ ] Success/failure tracked
- [ ] Tool name and duration in metrics

## Verification
```bash
bun run tsc --noEmit hooks/handlers/pre-tool-use.ts hooks/handlers/post-tool-use.ts hooks/handlers/post-tool-use-failure.ts
```

## Commit
```bash
git add hooks/handlers/pre-tool-use.ts hooks/handlers/post-tool-use.ts hooks/handlers/post-tool-use-failure.ts
git commit -m "feat(handlers): add tool execution handlers

Implements: F014"
```

## Next
Proceed to: `prompts/13-subagent-handlers.md` (F015)
