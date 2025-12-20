# Feature: F013 - User Interaction Handlers

## Context
See `context.md`. Handle user prompts and interrupts.

## Prior Work
F000-F012 completed

## Objective
Create user-prompt-submit.ts and stop.ts handlers.

## Code References
- `code/typescript.md#hook-handlers`

## Files
- `hooks/handlers/user-prompt-submit.ts`
- `hooks/handlers/stop.ts`

## Implementation
- user-prompt-submit: Log prompt submission, capture prompt text
- stop: Log user interrupt event

## Acceptance Criteria
- [ ] Handlers emit correct metrics
- [ ] Prompt text captured appropriately
- [ ] Type-safe

## Verification
```bash
bun run tsc --noEmit hooks/handlers/*.ts
```

## Commit
```bash
git add hooks/handlers/user-prompt-submit.ts hooks/handlers/stop.ts
git commit -m "feat(handlers): add user interaction handlers

Implements: F013"
```

## Next
Proceed to: `prompts/12-tool-handlers.md` (F014)
