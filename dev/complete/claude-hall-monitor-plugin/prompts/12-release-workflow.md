# Feature: F012 - Release Workflow

## Project Context

See `context.md` for feature rationale and architecture vision.

## Prior Work

- **F000-F011**: Full plugin implementation and CI workflow complete

## Objective

Create GitHub Actions release workflow that builds, tests, creates a zip archive, and publishes a GitHub release when a version tag is pushed.

> **Scope Constraint**: It is unacceptable to implement features beyond this task's scope.

## Relevant Decisions

From `decisions.md`:

- **D005**: GitHub Actions for CI/CD — Automated release on tag
- **D006**: Zip archive for releases — Easy distribution format

## Edge Cases to Handle

None specific to this feature.

## Code References

- `code/yaml.md#release-workflow` - Complete release workflow YAML

## Constraints

- See `constraints.md` for global rules
- Trigger on version tags (v*)
- Run full test suite before release
- Create zip archive with all plugin files
- Create GitHub release with the archive

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `.github/workflows/release.yml` | Release workflow for version tags |

## Implementation Details

### Create release.yml

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - "v*"

permissions:
  contents: write

jobs:
  release:
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

      - name: E2E tests
        run: bun run test-e2e.ts

      - name: Get version from tag
        id: version
        run: echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT

      - name: Verify tag matches plugin version
        run: |
          PLUGIN_VERSION=$(jq -r '.version' .claude-plugin/plugin.json)
          TAG_VERSION="${{ steps.version.outputs.VERSION }}"

          if [ "$PLUGIN_VERSION" != "$TAG_VERSION" ]; then
            echo "ERROR: Tag version ($TAG_VERSION) doesn't match plugin.json ($PLUGIN_VERSION)"
            exit 1
          fi

          echo "✓ Version match: $PLUGIN_VERSION"

      - name: Create release archive
        run: |
          VERSION="${{ steps.version.outputs.VERSION }}"
          ARCHIVE_NAME="claude-hall-monitor-${VERSION}"

          echo "Creating release archive: ${ARCHIVE_NAME}.zip"

          mkdir -p "${ARCHIVE_NAME}"

          # Copy plugin files
          cp -r .claude-plugin "${ARCHIVE_NAME}/"
          cp -r dist "${ARCHIVE_NAME}/"
          cp -r hooks "${ARCHIVE_NAME}/"
          cp -r rules "${ARCHIVE_NAME}/"
          cp -r commands "${ARCHIVE_NAME}/"
          cp CHANGELOG.md "${ARCHIVE_NAME}/"
          cp README.md "${ARCHIVE_NAME}/"
          cp LICENSE "${ARCHIVE_NAME}/"

          # Remove dev files from hooks
          rm -rf "${ARCHIVE_NAME}/hooks/node_modules"
          rm -rf "${ARCHIVE_NAME}/hooks/coverage"
          rm -f "${ARCHIVE_NAME}/hooks/bun.lockb"

          # Create zip
          zip -r "${ARCHIVE_NAME}.zip" "${ARCHIVE_NAME}"

          echo "Archive created: ${ARCHIVE_NAME}.zip"
          ls -la "${ARCHIVE_NAME}.zip"

      - name: Extract changelog for release
        id: changelog
        run: |
          VERSION="${{ steps.version.outputs.VERSION }}"

          # Extract the section for this version from CHANGELOG.md
          awk '/^## \['"$VERSION"'\]/{flag=1; next} /^## \[/{flag=0} flag' CHANGELOG.md > release-notes.md

          if [ ! -s release-notes.md ]; then
            echo "No changelog entry found for version $VERSION"
            echo "See [CHANGELOG.md](CHANGELOG.md) for full history." > release-notes.md
          fi

          cat release-notes.md

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          files: claude-hall-monitor-${{ steps.version.outputs.VERSION }}.zip
          body_path: release-notes.md
          draft: false
          prerelease: false
          generate_release_notes: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Release summary
        run: |
          VERSION="${{ steps.version.outputs.VERSION }}"
          echo "## Release Summary" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Version:** $VERSION" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Archive:** claude-hall-monitor-${VERSION}.zip" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Release URL:** ${{ github.server_url }}/${{ github.repository }}/releases/tag/v${VERSION}" >> $GITHUB_STEP_SUMMARY
```

## Acceptance Criteria

- [ ] `.github/workflows/release.yml` exists
- [ ] Workflow triggers on version tags (v*)
- [ ] Workflow runs full test suite
- [ ] Workflow verifies tag matches plugin version
- [ ] Workflow creates zip archive with correct structure
- [ ] Workflow extracts changelog notes for release
- [ ] Workflow creates GitHub release with archive attached
- [ ] Workflow excludes dev files (node_modules, coverage, lockfile)

## Verification

```bash
# Verify workflow file is valid YAML
cat .github/workflows/release.yml | python3 -c "import sys, yaml; yaml.safe_load(sys.stdin)"

# Test release process (dry run)
# 1. Create a test tag locally (don't push)
git tag v1.0.0-test

# 2. Run the build and archive steps manually
bun run build.ts
mkdir -p test-release
cp -r .claude-plugin dist hooks rules commands CHANGELOG.md README.md LICENSE test-release/
zip -r test-release.zip test-release
ls -la test-release.zip
rm -rf test-release test-release.zip
git tag -d v1.0.0-test
```

## Commit

```bash
git add .github/workflows/release.yml
git commit -m "ci: add GitHub Actions workflow for releases

- Trigger on version tags (v*)
- Run full test suite
- Verify version consistency
- Create zip archive
- Extract changelog notes
- Create GitHub release

Implements: F012
Decisions: D005, D006

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Next

Proceed to: `prompts/13-marketplace.md` (F013)
