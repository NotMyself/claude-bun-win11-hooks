# Feature: F008 - Version Synchronization

## Project Context

See `context.md` for feature rationale and architecture vision.

## Prior Work

- **F000**: Repository initialized
- **F001**: Files restructured
- **F002**: Plugin manifest created with version "1.0.0"
- **F007**: Changelog created with version "[1.0.0]"
- **F003-F006**: Build system and bundling complete

## Objective

Ensure version is consistent across plugin.json, package.json, and CHANGELOG.md, and update package.json to use the correct version.

> **Scope Constraint**: It is unacceptable to implement features beyond this task's scope.

## Relevant Decisions

From `decisions.md`:

- **D003**: Semantic versioning starting at 1.0.0 — All files must have "1.0.0"

## Edge Cases to Handle

From `edge-cases.md`:

- **EC006**: Version drift — This feature ensures versions stay in sync

## Code References

- `code/bash.md#version-verification` - Commands to check version consistency

## Constraints

- See `constraints.md` for global rules
- Version must be "1.0.0" in all files
- package.json version should not have leading "v"
- CHANGELOG.md version in brackets without "v"

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `hooks/package.json` | Update version to "1.0.0" |

## Implementation Details

### 1. Check Current Versions

```bash
# plugin.json version
jq -r '.version' .claude-plugin/plugin.json

# package.json version
jq -r '.version' hooks/package.json

# CHANGELOG.md version (first version header)
grep -m1 '## \[' CHANGELOG.md | sed 's/.*\[\(.*\)\].*/\1/'
```

### 2. Update hooks/package.json

The package.json was copied from the source repo and may have a different version. Update it:

```json
{
  "name": "claude-hall-monitor-hooks",
  "version": "1.0.0",
  ...
}
```

Use jq to update in place:

```bash
cd hooks
jq '.version = "1.0.0"' package.json > package.json.tmp && mv package.json.tmp package.json
cd ..
```

### 3. Verify All Match

```bash
PLUGIN_VERSION=$(jq -r '.version' .claude-plugin/plugin.json)
PACKAGE_VERSION=$(jq -r '.version' hooks/package.json)
CHANGELOG_VERSION=$(grep -m1 '## \[' CHANGELOG.md | sed 's/.*\[\(.*\)\].*/\1/')

echo "plugin.json:  $PLUGIN_VERSION"
echo "package.json: $PACKAGE_VERSION"
echo "CHANGELOG.md: $CHANGELOG_VERSION"

if [ "$PLUGIN_VERSION" = "$PACKAGE_VERSION" ] && [ "$PLUGIN_VERSION" = "$CHANGELOG_VERSION" ]; then
  echo "✓ All versions match: $PLUGIN_VERSION"
else
  echo "✗ Version mismatch detected!"
  exit 1
fi
```

## Acceptance Criteria

- [ ] `.claude-plugin/plugin.json` has version "1.0.0"
- [ ] `hooks/package.json` has version "1.0.0"
- [ ] `CHANGELOG.md` has version "1.0.0" in first version header
- [ ] All three files have the same version string

## Verification

```bash
# Full version check script
check_versions() {
  local plugin_v=$(jq -r '.version' .claude-plugin/plugin.json)
  local package_v=$(jq -r '.version' hooks/package.json)
  local changelog_v=$(grep -m1 '## \[' CHANGELOG.md | sed 's/.*\[\(.*\)\].*/\1/')

  echo "Versions:"
  echo "  plugin.json:  $plugin_v"
  echo "  package.json: $package_v"
  echo "  CHANGELOG.md: $changelog_v"

  if [ "$plugin_v" = "$package_v" ] && [ "$plugin_v" = "$changelog_v" ]; then
    echo "✓ All versions match"
    return 0
  else
    echo "✗ Version mismatch"
    return 1
  fi
}

check_versions
```

## Commit

```bash
git add hooks/package.json
git commit -m "chore: synchronize versions to 1.0.0

Implements: F008
Decisions: D003

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Next

Proceed to: `prompts/09-docs-update.md` (F009)
