# YAML Patterns

## GitHub Actions Workflows

### CI Workflow

Pull request validation workflow:

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
          ls -la dist/handlers/
          ls -la dist/viewer/

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

          if [ "$PLUGIN_VERSION" != "$PACKAGE_VERSION" ]; then
            echo "Version mismatch!"
            echo "plugin.json: $PLUGIN_VERSION"
            echo "package.json: $PACKAGE_VERSION"
            exit 1
          fi

          echo "Versions match: $PLUGIN_VERSION"
```

### Release Workflow

Tag-triggered release workflow:

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

      - name: Create release archive
        run: |
          mkdir -p release
          cp -r .claude-plugin release/
          cp -r dist release/
          cp -r hooks release/
          cp -r rules release/
          cp -r commands release/
          cp CHANGELOG.md release/
          cp README.md release/
          cd release
          zip -r ../claude-hall-monitor-${{ steps.version.outputs.VERSION }}.zip .

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          files: claude-hall-monitor-${{ steps.version.outputs.VERSION }}.zip
          generate_release_notes: true
          body: |
            ## Claude Hall Monitor v${{ steps.version.outputs.VERSION }}

            See [CHANGELOG.md](CHANGELOG.md) for details.

            ### Installation

            Download the zip file and extract to your plugins directory, or install via:
            ```bash
            claude plugins install NotMyself/claude-hall-monitor
            ```
```

### Matrix Build (Optional)

Cross-platform testing:

```yaml
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]

    runs-on: ${{ matrix.os }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install and test
        run: |
          cd hooks
          bun install
          bun run test:run
```

## Workflow Patterns

### Conditional Steps

Run steps only on certain conditions:

```yaml
- name: Upload coverage
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  uses: codecov/codecov-action@v3
  with:
    files: hooks/coverage/lcov.info
```

### Caching Dependencies

Speed up builds with caching:

```yaml
- name: Cache Bun dependencies
  uses: actions/cache@v3
  with:
    path: ~/.bun/install/cache
    key: ${{ runner.os }}-bun-${{ hashFiles('hooks/bun.lockb') }}
    restore-keys: |
      ${{ runner.os }}-bun-
```
