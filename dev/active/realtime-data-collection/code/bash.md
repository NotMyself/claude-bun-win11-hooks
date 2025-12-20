# Bash Patterns

## File Operations

### Deletion Commands (Phase 0)

```bash
# Delete old hooks system files
rm -rf hooks/utils/logger.ts
rm -rf hooks/handlers/*.ts
rm -rf hooks/viewer/*
rm -rf hooks/logs/
rm -rf hooks/utils/__tests__/logger.test.ts

# Verify deletion
ls hooks/handlers/
ls hooks/viewer/
ls hooks/utils/
```

### Directory Creation

```bash
# Create new directory structure
mkdir -p hooks/metrics/__tests__
mkdir -p hooks/handlers/__tests__
mkdir -p hooks/viewer/api
mkdir -p hooks/viewer/sse
mkdir -p hooks/viewer/__tests__/api
mkdir -p hooks/data/archive
```

### File Inspection

```bash
# Check file contents
cat hooks/metrics/types.ts
cat hooks/metrics/schema.sql
cat .claude-plugin/hooks.json

# List directory contents
ls -la hooks/metrics/
ls -la hooks/handlers/

# Tree view (if available)
tree hooks/
```

## Testing Commands

### Run Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test hooks/metrics/__tests__/database.test.ts

# Run tests matching pattern
bun test --grep "MetricsCollector"

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage

# Verbose output
bun test --reporter=verbose
```

### Type Checking

```bash
# Type check all TypeScript files
bun run tsc --noEmit

# Type check specific file
bun run tsc --noEmit hooks/metrics/types.ts

# Type check with verbose errors
bun run tsc --noEmit --pretty
```

## Build Commands

### Bundle for Production

```bash
# Run build script
bun run hooks/build.ts

# Check bundled output
ls -la dist/
ls -la dist/handlers/
ls -la dist/viewer/

# Verify bundle contents
cat dist/handlers/session-start.js
```

### Clean Build Artifacts

```bash
# Remove dist directory
rm -rf dist/

# Clean and rebuild
rm -rf dist/ && bun run hooks/build.ts
```

## Development Commands

### Start Viewer

```bash
# Start viewer server (for testing)
bun run hooks/viewer/server.ts

# Start with custom port
HOOK_VIEWER_PORT=4000 bun run hooks/viewer/server.ts

# Start in background
bun run hooks/viewer/server.ts &
```

### Database Operations

```bash
# Create database directory
mkdir -p hooks/data

# Check database file
ls -la hooks/data/metrics.db

# SQLite CLI (for debugging)
sqlite3 hooks/data/metrics.db "SELECT COUNT(*) FROM metrics;"
sqlite3 hooks/data/metrics.db "SELECT * FROM metrics LIMIT 5;"
```

## Git Operations

### Commit Changes

```bash
# Add files
git add hooks/metrics/types.ts hooks/metrics/schema.sql hooks/metrics/pricing.ts

# Commit with message
git commit -m "feat(metrics): add core type definitions and schema

Implements: F001, F002, F003
Decisions: D003

- Define MetricEntry, TokenUsage, CostBreakdown, PlanEvent types
- Create SQLite schema with indexes for common queries  
- Add model pricing data with tier-based fallbacks"

# Check status
git status
```

### View Changes

```bash
# Show staged changes
git diff --staged

# Show unstaged changes
git diff

# Show recent commits
git log --oneline -10

# Show specific commit
git show HEAD
```

## Package Management

### Install Dependencies

```bash
# Install all dependencies
bun install

# Add new dependency
bun add <package-name>

# Add dev dependency
bun add -d <package-name>

# Remove dependency
bun remove <package-name>
```

### Update Dependencies

```bash
# Update all dependencies
bun update

# Check for outdated packages
bun outdated

# Update specific package
bun update <package-name>
```

## Verification Commands

### Pre-Commit Checks

```bash
# Full verification pipeline
bun run tsc --noEmit && bun test && bun run hooks/build.ts

# Quick check (type check only)
bun run tsc --noEmit

# Test and type check
bun run tsc --noEmit && bun test
```

### Project Structure Validation

```bash
# Verify required files exist
test -f hooks/metrics/types.ts && echo "✓ types.ts exists"
test -f hooks/metrics/schema.sql && echo "✓ schema.sql exists"
test -f hooks/metrics/database.ts && echo "✓ database.ts exists"

# Count test files
find hooks -name "*.test.ts" | wc -l

# Find all TypeScript files
find hooks -name "*.ts" -not -path "*/node_modules/*"
```

## Debugging Commands

### Log Inspection

```bash
# Watch log file in realtime
tail -f hooks/data/archive/metrics-2024-01-15.jsonl

# Search logs for errors
grep -i "error" hooks/data/archive/*.jsonl

# Count entries in JSONL
wc -l hooks/data/archive/metrics-2024-01-15.jsonl

# Parse JSONL and extract specific field
cat hooks/data/archive/metrics.jsonl | jq '.event_type' | sort | uniq -c
```

### Process Management

```bash
# Find viewer process
ps aux | grep "viewer/server"

# Kill viewer process
pkill -f "viewer/server"

# Check port usage
lsof -i :3456
netstat -an | grep 3456  # Windows alternative
```

## Environment Variables

### Configuration

```bash
# Set viewer configuration
export HOOK_VIEWER_PORT=3456
export HOOK_VIEWER_HOST=localhost

# Set metrics configuration
export METRICS_DB_PATH=hooks/data/metrics.db
export METRICS_ARCHIVE_DIR=hooks/data/archive

# Run with environment variables
HOOK_VIEWER_PORT=4000 bun run hooks/viewer/server.ts
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* bun run hooks/viewer/server.ts

# Bun verbose mode
bun --verbose test
```

## Performance Testing

### Benchmarking

```bash
# Time command execution
time bun test hooks/metrics/__tests__/database.test.ts

# Measure build time
time bun run hooks/build.ts

# Profile test execution
bun test --reporter=verbose --timeout=10000
```

### Resource Monitoring

```bash
# Monitor file handles
lsof -p <pid>

# Monitor memory usage
ps aux | grep bun

# Monitor disk usage
du -sh hooks/data/
```

## Cleanup Commands

### Remove Generated Files

```bash
# Clean build output
rm -rf dist/

# Clean test coverage
rm -rf coverage/

# Clean database (CAUTION: deletes data)
rm -f hooks/data/metrics.db
rm -rf hooks/data/archive/*.jsonl

# Clean node_modules (if needed)
rm -rf node_modules/
```

### Reset to Clean State

```bash
# Reset to latest commit
git reset --hard HEAD

# Remove untracked files (dry run first)
git clean -n
git clean -fd  # Execute after reviewing
```
