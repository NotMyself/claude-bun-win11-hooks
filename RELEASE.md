# Release Guide

This guide covers merging the plugin PR and creating a release for the Claude Code marketplace.

## Prerequisites

- GitHub CLI (`gh`) installed and authenticated
- Write access to the repository

## Step 1: Merge the PR

```bash
# Review the PR
gh pr view 6

# Merge the PR (squash recommended for clean history)
gh pr merge 6 --squash --delete-branch
```

## Step 2: Pull the merged changes

```bash
git checkout main
git pull origin main
```

## Step 3: Create and push a version tag

The release workflow triggers on tags matching `v*`.

```bash
# Create the tag
git tag -a v1.0.0 -m "Release v1.0.0 - Initial plugin release"

# Push the tag
git push origin v1.0.0
```

## Step 4: Verify the release workflow

The GitHub Actions release workflow will automatically:
1. Build the plugin (`bun run build.ts`)
2. Run tests
3. Create a zip archive with:
   - `.claude-plugin/` (plugin manifest and hooks config)
   - `dist/` (bundled handlers and viewer)
   - `rules/` (Claude Code rules)
   - `commands/` (slash commands)
   - `README.md`, `LICENSE`, `CHANGELOG.md`
4. Create a GitHub release with the zip attached

Monitor the workflow:
```bash
gh run watch
```

## Step 5: Submit to the marketplace

Once the release is created:

1. Go to the [GitHub release page](https://github.com/NotMyself/claude-bun-win11-hooks/releases/tag/v1.0.0)
2. Copy the zip download URL
3. Submit to the Claude Code marketplace using `marketplace-entry.json`

### Marketplace submission

The `marketplace-entry.json` file contains the plugin metadata:
- Name: `claude-hall-monitor`
- Description: All 12 hook handlers with JSONL logging, realtime viewer UI, rules, and slash commands
- Version: 1.0.0
- Runtime: bun

## Release Checklist

- [ ] All CI checks passing on PR
- [ ] PR merged to main
- [ ] Version tag created and pushed
- [ ] Release workflow completed successfully
- [ ] GitHub release created with zip artifact
- [ ] Marketplace submission (if applicable)

## Versioning

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes to hook behavior or plugin structure
- **MINOR**: New features, new hooks, backward-compatible changes
- **PATCH**: Bug fixes, documentation updates

When releasing a new version:
1. Update version in `.claude-plugin/plugin.json`
2. Update version in `hooks/package.json`
3. Add entry to `CHANGELOG.md`
4. Create a new tag (e.g., `v1.1.0`)

## Troubleshooting

### Release workflow failed
```bash
# Check the workflow logs
gh run view --log-failed
```

### Tag already exists
```bash
# Delete the tag locally and remotely, then recreate
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### Need to update a release
```bash
# Create a patch version instead
git tag -a v1.0.1 -m "Release v1.0.1 - Bug fixes"
git push origin v1.0.1
```
