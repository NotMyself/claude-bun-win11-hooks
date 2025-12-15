#!/bin/bash
# version-check.sh
# Validates version consistency across plugin.json, package.json, and CHANGELOG.md

set -e

# Check if jq is available
if ! command -v jq &> /dev/null; then
  echo "jq not found. Falling back to bun script..."
  exec bun run "$(dirname "$0")/version-check.ts"
  exit $?
fi

PLUGIN_VERSION=$(jq -r '.version' .claude-plugin/plugin.json)
PACKAGE_VERSION=$(jq -r '.version' hooks/package.json)
# Skip "Unreleased" section by matching version with date
CHANGELOG_VERSION=$(grep -E '## \[[^]]+\] - [0-9]{4}-[0-9]{2}-[0-9]{2}' CHANGELOG.md | head -1 | sed 's/.*\[\([^]]*\)\].*/\1/')

echo "Versions found:"
echo "  plugin.json:  $PLUGIN_VERSION"
echo "  package.json: $PACKAGE_VERSION"
echo "  CHANGELOG.md: $CHANGELOG_VERSION"

if [ "$PLUGIN_VERSION" = "$PACKAGE_VERSION" ] && [ "$PLUGIN_VERSION" = "$CHANGELOG_VERSION" ]; then
  echo "✓ All versions match: $PLUGIN_VERSION"
  exit 0
else
  echo "✗ Version mismatch detected"
  exit 1
fi
