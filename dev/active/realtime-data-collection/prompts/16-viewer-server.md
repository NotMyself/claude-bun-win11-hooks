# Feature: F019 - Viewer HTTP Server

## Context
See `context.md`. HTTP server base for viewer.

## Prior Work
F000-F018 completed

## Objective
Create HTTP server using Bun.serve with routing.

## Code References
- `code/typescript.md#http-server`

## Files
- `hooks/viewer/server.ts`
- `hooks/viewer/__tests__/server.test.ts`

## Implementation
ViewerServer class:
- Use Bun.serve
- Route requests to API handlers
- Security checks on all routes
- Graceful shutdown

## Acceptance Criteria
- [ ] Server starts on configured port
- [ ] Routes to correct handlers
- [ ] Security applied
- [ ] Tests pass

## Verification
```bash
bun test hooks/viewer/__tests__/server.test.ts
```

## Commit
```bash
git add hooks/viewer/server.ts hooks/viewer/__tests__/server.test.ts
git commit -m "feat(viewer): implement HTTP server

Implements: F019"
```

## Next
Proceed to: `prompts/17-metrics-api.md` (F020)
