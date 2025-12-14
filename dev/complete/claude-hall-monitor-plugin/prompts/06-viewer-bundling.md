# Feature: F005 - Viewer Bundling

## Project Context

See `context.md` for feature rationale and architecture vision.

## Prior Work

- **F000**: Repository initialized
- **F001**: Files restructured with viewer in `hooks/viewer/`
- **F002**: Plugin manifest created
- **F007**: Changelog created
- **F003**: Build script created
- **F004**: Handlers bundled to `dist/handlers/`

## Objective

Verify the viewer server is bundled correctly with all security features and assets.

> **Scope Constraint**: It is unacceptable to implement features beyond this task's scope.

## Relevant Decisions

From `decisions.md`:

- **D002**: Bundle to JavaScript — Viewer server must be standalone

## Edge Cases to Handle

From `edge-cases.md`:

- **EC001**: Cross-platform path handling — Viewer must work on all platforms
- **EC005**: Viewer port conflicts — Port 3456 may already be in use

## Code References

- `code/typescript.md#viewer-server-test` - Testing viewer server startup
- `code/bash.md#build-output-verification` - Verification commands

## Constraints

- See `constraints.md` for global rules
- Viewer must include all security features (rate limiting, CORS, CSP)
- HTML assets must be copied to dist/viewer/
- Server must be executable with `bun run dist/viewer/server.js`

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `dist/viewer/server.js` | Bundled viewer server |
| `dist/viewer/index.html` | Copied viewer HTML |

## Implementation Details

### 1. Verify Build Output

The build script (F003) should have already created these files. Verify:

```bash
ls -la dist/viewer/
```

Should show:
```
server.js
index.html
```

### 2. Test Server Startup

Start the viewer server:

```bash
bun run dist/viewer/server.js &
SERVER_PID=$!
sleep 2
```

### 3. Test Endpoints

```bash
# Health check
curl -s http://localhost:3456/health

# Main page
curl -s http://localhost:3456/ | head -20

# SSE endpoint (just headers)
curl -sI http://localhost:3456/events

# Kill server
kill $SERVER_PID
```

### 4. Verify Security Features

The bundled server should include:

- Rate limiting (RateLimiter class)
- CORS headers (validateOrigin)
- CSP headers (addSecurityHeaders)
- Path traversal protection (validatePath)
- Session ID validation (validateSessionId)

Check bundled code contains these:

```bash
grep -c "RateLimiter\|validateOrigin\|addSecurityHeaders" dist/viewer/server.js
```

## Acceptance Criteria

- [ ] `dist/viewer/server.js` exists and is a valid JavaScript bundle
- [ ] `dist/viewer/index.html` exists
- [ ] Server starts on port 3456 (or configured port)
- [ ] `/health` endpoint returns valid response
- [ ] `/` serves the index.html page
- [ ] `/events` returns SSE stream (text/event-stream content-type)
- [ ] Security features are included in bundle

## Verification

```bash
# Check files exist
test -f dist/viewer/server.js && echo "Server bundle exists"
test -f dist/viewer/index.html && echo "HTML exists"

# Check bundle size (should be reasonable, < 500KB)
du -h dist/viewer/server.js

# Test server (quick smoke test)
timeout 5 bun run dist/viewer/server.js &
sleep 2
curl -s http://localhost:3456/health || echo "Server might need longer to start"
pkill -f "dist/viewer/server.js" 2>/dev/null || true
```

## Commit

```bash
git add dist/viewer/
git commit -m "build: bundle viewer server with assets

Implements: F005
Decisions: D002

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Next

Proceed to: `prompts/07-hooks-config.md` (F006)
