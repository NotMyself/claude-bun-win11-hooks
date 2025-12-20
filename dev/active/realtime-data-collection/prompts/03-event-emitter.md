# Feature: F005 - Event Emitter

## Context
See `context.md`. Implement lightweight pub/sub for realtime event distribution.

## Prior Work
F000-F004 completed

## Objective
Create EventEmitter class for decoupling metric collection from streaming/storage.

## Decisions
- **D006**: Event emitter pattern for pub/sub

## Code References
- `code/typescript.md#core-classes` - EventEmitter implementation

## Files
- `hooks/utils/event-emitter.ts`
- `hooks/utils/__tests__/event-emitter.test.ts`

## Implementation
Use the EventEmitter class from code samples with:
- `on(event, listener)` - Subscribe
- `off(event, listener)` - Unsubscribe  
- `emit(event, data)` - Notify all listeners
- `removeAllListeners(event?)` - Cleanup

## Acceptance Criteria
- [ ] EventEmitter supports multiple listeners per event
- [ ] Async listeners handled correctly
- [ ] Error in one listener doesn't affect others
- [ ] All tests pass

## Verification
```bash
bun test hooks/utils/__tests__/event-emitter.test.ts
```

## Commit
```bash
git add hooks/utils/event-emitter.ts hooks/utils/__tests__/event-emitter.test.ts
git commit -m "feat(metrics): add event emitter for pub/sub

Implements: F005
Decisions: D006"
```

## Next
Proceed to: `prompts/04-config.md` (F006)
