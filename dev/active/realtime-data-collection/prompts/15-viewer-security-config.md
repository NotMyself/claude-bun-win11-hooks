# Feature: F017, F018 - Viewer Security & Config

## Context
See `context.md`. Security utilities and configuration for viewer.

## Prior Work
F000-F016 completed

## Objective
Create security module and viewer config.

## Code References
- `code/typescript.md#security-utilities`
- `code/typescript.md#configuration-types`

## Files
- `hooks/viewer/security.ts`
- `hooks/viewer/config.ts`

## Implementation
Security utilities:
- `isValidSessionId(id: string): boolean`
- `validatePath(path: string, base: string): boolean`
- `verifyBearerToken(req: Request, token: string): boolean`
- Rate limiter for SSE connections (EC005)

Config: PORT, HOST, rate limits

## Acceptance Criteria
- [ ] Security functions prevent common attacks
- [ ] Config exported with defaults
- [ ] Type-safe

## Verification
```bash
bun run tsc --noEmit hooks/viewer/security.ts hooks/viewer/config.ts
```

## Commit
```bash
git add hooks/viewer/security.ts hooks/viewer/config.ts
git commit -m "feat(viewer): add security and config modules

Implements: F017, F018
Edge Cases: EC005"
```

## Next
Proceed to: `prompts/16-viewer-server.md` (F019)
