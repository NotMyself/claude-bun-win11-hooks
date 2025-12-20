# Feature: F000 - Project Initialization

## Project Context

See `context.md` for feature rationale and architecture vision.

This is a complete replacement of the existing hooks logging system. Phase 0 prepares the project by removing old files and creating the new directory structure.

## Objective

Delete the existing hooks logging infrastructure and create the directory structure for the new metrics collection system.

> **Scope Constraint**: It is unacceptable to implement features beyond this task's scope. Only delete old files and create directories - do not implement any logic.

## Relevant Decisions

From `decisions.md`:
- **D001**: Complete replacement vs incremental - Clean slate enables metrics-first design. We're removing the old system entirely.
- **D008**: No data migration - Old logs remain as JSONL files but are not imported into new system.
- **D010**: Big bang deployment - Remove old system entirely when new is ready.

## Files to Delete

These files are part of the old logging system and must be completely removed:

```
hooks/utils/logger.ts                    # Old JSONL logger
hooks/handlers/*.ts                      # All 12 existing hook handlers
hooks/viewer/server.ts                   # Old viewer server
hooks/viewer/watcher.ts                  # Old log file watcher
hooks/viewer/index.html                  # Old viewer UI
hooks/viewer/security.ts                 # Old security module (will be recreated)
hooks/viewer/rate-limiter.ts            # Old rate limiter (will be recreated)
hooks/utils/__tests__/logger.test.ts    # Old logger tests
```

**Note**: Do NOT delete:
- `.claude-plugin/` - Plugin manifest (will be updated later)
- `hooks/package.json` - Dependencies (will be updated later)
- `hooks/build.ts` - Build script (will be updated later)
- `commands/` - Slash commands (unchanged)
- `rules/` - Rules (unchanged)
- `hooks/logs/` or `hooks/hooks-log.txt` - Keep for reference (old logs)

## Directories to Create

Create the new directory structure:

```
hooks/metrics/              # Metrics subsystem
hooks/handlers/             # New hook handlers (empty for now)
hooks/viewer/               # New viewer (empty for now)
hooks/viewer/api/           # API endpoints
hooks/viewer/sse/           # SSE streaming handlers
hooks/data/                 # SQLite database and archives
hooks/data/archive/         # JSONL archives
hooks/__tests__/            # Test directory
hooks/__tests__/fixtures/   # Test data fixtures
```

## Implementation Steps

1. **Delete old files**:
   ```bash
   rm -f hooks/utils/logger.ts
   rm -f hooks/handlers/*.ts
   rm -f hooks/viewer/server.ts
   rm -f hooks/viewer/watcher.ts
   rm -f hooks/viewer/index.html
   rm -f hooks/viewer/security.ts
   rm -f hooks/viewer/rate-limiter.ts
   rm -f hooks/utils/__tests__/logger.test.ts
   ```

2. **Create new directories**:
   ```bash
   mkdir -p hooks/metrics
   mkdir -p hooks/handlers
   mkdir -p hooks/viewer/api
   mkdir -p hooks/viewer/sse
   mkdir -p hooks/data/archive
   mkdir -p hooks/__tests__/fixtures
   ```

3. **Verify structure**:
   ```bash
   ls -la hooks/
   # Should show: metrics/, handlers/, viewer/, data/, utils/, __tests__/
   # Should NOT show old files in handlers/ or viewer/
   ```

## Acceptance Criteria

- [ ] Old logger.ts deleted
- [ ] All 12 old hook handler files deleted
- [ ] Old viewer files (server.ts, watcher.ts, index.html, security.ts, rate-limiter.ts) deleted
- [ ] Old logger tests deleted
- [ ] New directory structure created: metrics/, handlers/, viewer/api/, viewer/sse/, data/archive/, __tests__/fixtures/
- [ ] `.claude-plugin/`, `hooks/package.json`, `hooks/build.ts`, `commands/`, `rules/` still exist (not deleted)
- [ ] Old logs directory kept for reference (if it exists)

## Verification

```bash
# Verify old files removed
test ! -f hooks/utils/logger.ts && echo "logger.ts removed" || echo "ERROR: logger.ts still exists"
test ! -f hooks/viewer/server.ts && echo "old viewer removed" || echo "ERROR: old viewer still exists"

# Verify new structure created
test -d hooks/metrics && echo "metrics/ created" || echo "ERROR: metrics/ missing"
test -d hooks/data/archive && echo "archive/ created" || echo "ERROR: archive/ missing"

# Verify preserved files
test -f hooks/package.json && echo "package.json preserved" || echo "ERROR: package.json missing"
test -d .claude-plugin && echo ".claude-plugin preserved" || echo "ERROR: .claude-plugin missing"
```

## Commit

```bash
git add -A hooks/
git commit -m "feat(metrics): prepare project structure for new metrics system

Implements: F000
Decisions: D001, D008, D010

- Remove old hooks logging infrastructure
- Delete all existing hook handlers
- Remove old viewer implementation
- Create new directory structure for metrics subsystem

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

## Next

Proceed to: `prompts/01-types.md` (F001)
