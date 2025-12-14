# Feature: F011 - CI Workflow

## Project Context

See `context.md` for feature rationale and architecture vision.

## Prior Work

- **F000-F010**: Full plugin implementation complete
- **F003**: Build script
- **F010**: E2E test script

## Objective

Create GitHub Actions CI workflow for pull request validation with build, unit tests, and E2E tests.

> **Scope Constraint**: It is unacceptable to implement features beyond this task's scope.

## Relevant Decisions

From `decisions.md`:

- **D005**: GitHub Actions for CI/CD — Automated build, test, and release

## Edge Cases to Handle

From `edge-cases.md`:

- **EC006**: Version drift — CI should verify version consistency

## Code References

- `code/yaml.md#ci-workflow` - Complete CI workflow YAML

## Constraints

- See `constraints.md` for global rules
- Workflow must run on push to main and all PRs
- Must install Bun using official action
- Must run type checking, unit tests, build, and E2E tests
- Must verify version consistency

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | CI workflow for PR validation |

## Implementation Details

### 1. Create Workflow Directory

```bash
mkdir -p .github/workflows
```

### 2. Create ci.yml

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Cache Bun dependencies
        uses: actions/cache@v4
        with:
          path: ~/.bun/install/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('hooks/bun.lockb') }}
          restore-keys: |
            ${{ runner.os }}-bun-

      - name: Install dependencies
        run: |
          cd hooks
          bun install

      - name: Type check
        run: |
          cd hooks
          bun run tsc

      - name: Unit tests
        run: |
          cd hooks
          bun run test:run

      - name: Build
        run: bun run build.ts

      - name: Verify build output
        run: |
          echo "Checking handler count..."
          HANDLER_COUNT=$(ls dist/handlers/*.js | wc -l)
          if [ "$HANDLER_COUNT" -ne 12 ]; then
            echo "Expected 12 handlers, found $HANDLER_COUNT"
            exit 1
          fi
          echo "✓ Found $HANDLER_COUNT handlers"

          echo "Checking viewer..."
          test -f dist/viewer/server.js && echo "✓ Viewer server exists"
          test -f dist/viewer/index.html && echo "✓ Viewer HTML exists"

      - name: E2E tests
        run: bun run test-e2e.ts

  version-check:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Check version consistency
        run: |
          PLUGIN_VERSION=$(jq -r '.version' .claude-plugin/plugin.json)
          PACKAGE_VERSION=$(jq -r '.version' hooks/package.json)
          CHANGELOG_VERSION=$(grep -m1 '## \[' CHANGELOG.md | sed 's/.*\[\(.*\)\].*/\1/')

          echo "Versions:"
          echo "  plugin.json:  $PLUGIN_VERSION"
          echo "  package.json: $PACKAGE_VERSION"
          echo "  CHANGELOG.md: $CHANGELOG_VERSION"

          MISMATCH=0

          if [ "$PLUGIN_VERSION" != "$PACKAGE_VERSION" ]; then
            echo "ERROR: plugin.json and package.json versions don't match"
            MISMATCH=1
          fi

          if [ "$PLUGIN_VERSION" != "$CHANGELOG_VERSION" ]; then
            echo "ERROR: plugin.json and CHANGELOG.md versions don't match"
            MISMATCH=1
          fi

          if [ "$MISMATCH" -eq 1 ]; then
            exit 1
          fi

          echo "✓ All versions match: $PLUGIN_VERSION"

  lint-plugin:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Validate plugin.json
        run: |
          echo "Validating .claude-plugin/plugin.json..."
          cat .claude-plugin/plugin.json | jq . > /dev/null
          echo "✓ plugin.json is valid JSON"

          # Check required fields
          jq -e '.name' .claude-plugin/plugin.json > /dev/null || (echo "Missing 'name'" && exit 1)
          jq -e '.version' .claude-plugin/plugin.json > /dev/null || (echo "Missing 'version'" && exit 1)
          echo "✓ Required fields present"

      - name: Validate hooks.json
        run: |
          echo "Validating .claude-plugin/hooks.json..."
          cat .claude-plugin/hooks.json | jq . > /dev/null
          echo "✓ hooks.json is valid JSON"

          # Check hook count
          HOOK_COUNT=$(jq '.hooks | keys | length' .claude-plugin/hooks.json)
          if [ "$HOOK_COUNT" -ne 12 ]; then
            echo "Expected 12 hooks, found $HOOK_COUNT"
            exit 1
          fi
          echo "✓ Found $HOOK_COUNT hooks configured"
```

## Acceptance Criteria

- [ ] `.github/workflows/ci.yml` exists
- [ ] Workflow triggers on push to main and PRs
- [ ] Workflow installs Bun
- [ ] Workflow runs type checking
- [ ] Workflow runs unit tests
- [ ] Workflow builds the project
- [ ] Workflow verifies build output
- [ ] Workflow runs E2E tests
- [ ] Workflow checks version consistency
- [ ] Workflow validates plugin configuration files

## Verification

```bash
# Verify workflow file is valid YAML
cat .github/workflows/ci.yml | python3 -c "import sys, yaml; yaml.safe_load(sys.stdin)"

# Or use a YAML linter
# npx yaml-lint .github/workflows/ci.yml

# Test locally with act (if installed)
# act -j build-and-test
```

## Commit

```bash
git add .github/
git commit -m "ci: add GitHub Actions workflow for PR validation

- Type checking
- Unit tests
- Build verification
- E2E tests
- Version consistency check
- Plugin configuration validation

Implements: F011
Decisions: D005

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Next

Proceed to: `prompts/12-release-workflow.md` (F012)
