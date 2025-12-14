# Bash Patterns

## Build Commands

### Full Build

Build all handlers and viewer:

```bash
# From project root
bun run build.ts

# Or from hooks directory
cd hooks
bun run build
```

### Clean Build

Remove dist and rebuild:

```bash
rm -rf dist
bun run build.ts
```

## Verification Commands

### Structure Verification

Verify project structure after restructure:

```bash
# Check new structure exists
ls -la hooks/handlers/
ls -la hooks/utils/
ls -la hooks/viewer/
ls -la rules/
ls -la commands/

# Check old structure is removed
test ! -d .claude/hooks && echo "Old hooks removed"
test ! -d .claude/rules && echo "Old rules removed"
test ! -d .claude/commands && echo "Old commands removed"
```

### Build Output Verification

Verify bundled files exist:

```bash
# Count handler files (should be 12)
ls dist/handlers/*.js | wc -l

# Verify viewer bundle exists
test -f dist/viewer/server.js && echo "Viewer bundled"

# List all bundled files
find dist -name "*.js" -type f
```

### Version Verification

Check version consistency:

```bash
# Extract versions from all sources
PLUGIN_VERSION=$(jq -r '.version' .claude-plugin/plugin.json)
PACKAGE_VERSION=$(jq -r '.version' hooks/package.json)
CHANGELOG_VERSION=$(grep -m1 '## \[' CHANGELOG.md | sed 's/.*\[\(.*\)\].*/\1/')

echo "plugin.json:  $PLUGIN_VERSION"
echo "package.json: $PACKAGE_VERSION"
echo "CHANGELOG.md: $CHANGELOG_VERSION"

# Check all match
if [ "$PLUGIN_VERSION" = "$PACKAGE_VERSION" ] && [ "$PLUGIN_VERSION" = "$CHANGELOG_VERSION" ]; then
  echo "All versions match!"
else
  echo "Version mismatch detected!"
  exit 1
fi
```

## Testing Commands

### Run All Tests

```bash
# Unit tests
cd hooks
bun run test:run

# Type checking
bun run tsc

# E2E tests (from project root)
cd ..
bun run test-e2e.ts
```

### Coverage Report

```bash
cd hooks
bun run test:coverage
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

## Release Commands

### Create Release Tag

```bash
# Ensure on main branch
git checkout main
git pull origin main

# Create and push tag
VERSION="1.0.0"
git tag -a "v$VERSION" -m "Release v$VERSION"
git push origin "v$VERSION"
```

### Local Release Archive

Build release archive locally for testing:

```bash
VERSION="1.0.0"

# Build first
bun run build.ts

# Create archive
mkdir -p release
cp -r .claude-plugin release/
cp -r dist release/
cp -r hooks release/
cp -r rules release/
cp -r commands release/
cp CHANGELOG.md release/
cp README.md release/

cd release
zip -r "../claude-hall-monitor-$VERSION.zip" .
cd ..
rm -rf release
```

## Development Commands

### Start Viewer

```bash
cd hooks
bun run viewer      # Production
bun run viewer:dev  # With hot reload
```

### Watch Mode

```bash
# Watch tests
cd hooks
bun run test

# Watch build
bun run build:watch
```

### Path Cleanup

Grep for old paths that need updating:

```bash
# Find references to old .claude/ paths
grep -r "\.claude/hooks" --include="*.md" --include="*.ts" --include="*.json"
grep -r "\.claude/rules" --include="*.md"
grep -r "\.claude/commands" --include="*.md"
```
