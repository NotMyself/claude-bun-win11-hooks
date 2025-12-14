# Claude Hall Monitor Plugin - Implementation Plan

Optimized implementation plan for transforming claude-bun-win11-hooks into an installable Claude Code plugin.

## Overview

This plan creates the `claude-hall-monitor` plugin with:

- 12 hook handlers with JSONL logging
- Realtime log viewer UI with SSE streaming
- 6 rules files for Claude Code conventions
- 3 slash commands for planning and orchestration
- Cross-platform support (Windows, macOS, Linux)

## Quick Start

1. Run features in order using manifest.jsonl
2. Each prompt is self-contained with context
3. Verify after each feature before proceeding

## Files

| File | Purpose |
|------|---------|
| `manifest.jsonl` | Feature metadata for orchestration |
| `context.md` | Project rationale and architecture |
| `decisions.md` | Architectural decisions with rationale |
| `edge-cases.md` | Edge cases mapped to features |
| `testing-strategy.md` | Testing philosophy and patterns |
| `constraints.md` | Global rules for all prompts |
| `code/*.md` | Code samples by language (progressive disclosure) |
| `init.md` | Project initialization (F000) |
| `prompts/*.md` | Individual feature prompts |

## Code Samples

The `code/` directory contains reusable code patterns organized by language:

| File | Contents |
|------|----------|
| `code/typescript.md` | Build scripts, handler patterns, E2E tests |
| `code/json.md` | plugin.json, hooks.json, package.json schemas |
| `code/yaml.md` | GitHub Actions workflows |
| `code/bash.md` | Build and verification commands |

Reference specific sections via anchors: `code/typescript.md#build-script-core`

## Feature Layers

| Layer | Features | Description |
|-------|----------|-------------|
| 1 | F000 | Project initialization |
| 2 | F001, F002, F007 | Structure, manifest, changelog |
| 3 | F003 | Build script |
| 4 | F004, F005 | Handler and viewer bundling |
| 5 | F006, F008, F009 | Configuration, versioning, docs |
| 6 | F010 | E2E testing |
| 7 | F011, F012 | CI/CD workflows |
| 8 | F013 | Marketplace registration |

## Orchestration

Process manifest.jsonl line by line:

```bash
# Example: Read manifest and execute prompts
while read -r line; do
  id=$(echo "$line" | jq -r '.id')
  file=$(echo "$line" | jq -r '.file')
  status=$(echo "$line" | jq -r '.status')

  if [ "$status" = "pending" ]; then
    echo "Executing $id: $file"
    # Execute prompt file with sub-agent
    # Update status to in_progress, then completed
  fi
done < manifest.jsonl
```

### Using /plan-orchestrate

You can use the `/plan-orchestrate` command to execute this plan:

```
/plan-orchestrate dev/active/claude-hall-monitor-plugin/
```

This will:
1. Read the manifest.jsonl
2. Execute each prompt in order
3. Update status as features complete
4. Handle dependencies between features

## Feature Status

Track progress by updating status in manifest.jsonl:

| Status | Meaning |
|--------|---------|
| `pending` | Not started |
| `in_progress` | Currently being implemented |
| `completed` | Done and verified |
| `failed` | Needs attention |

## Decision Log

See `decisions.md` for architectural choices:

| ID | Decision |
|----|----------|
| D001 | Create new repo vs rename |
| D002 | Bundle to JavaScript |
| D003 | Semantic versioning at 1.0.0 |
| D004 | Keep a Changelog format |
| D005 | GitHub Actions for CI/CD |
| D006 | Zip archive for releases |
| D007 | Use ${CLAUDE_PLUGIN_ROOT} variable |

## Edge Cases

See `edge-cases.md` for cases to handle:

| ID | Case |
|----|------|
| EC001 | Cross-platform path handling |
| EC002 | Bun runtime not installed |
| EC003 | Plugin variable expansion |
| EC004 | Build output directory conflicts |
| EC005 | Viewer port conflicts |
| EC006 | Version drift |
| EC007 | Large log files |
| EC008 | Permission denied errors |
| EC009 | Stale dist/ files |
| EC010 | Missing .claude-plugin directory |

## Verification Commands

Each feature includes verification commands. Common verifications:

```bash
# Check handler count (should be 12)
ls dist/handlers/*.js | wc -l

# Check version consistency
jq -r '.version' .claude-plugin/plugin.json
jq -r '.version' hooks/package.json
grep -m1 '## \[' CHANGELOG.md

# Run tests
bun run test-e2e.ts

# Validate JSON files
cat .claude-plugin/plugin.json | jq .
cat .claude-plugin/hooks.json | jq .
```

## Source Repository

The source code is in `claude-bun-win11-hooks`:

```
.claude/
├── hooks/
│   ├── handlers/     # 12 TypeScript handlers
│   ├── utils/        # Shared utilities
│   └── viewer/       # Realtime viewer
├── rules/            # 6 rule files
└── commands/         # 3 slash commands
```

## Target Repository

Create `NotMyself/claude-hall-monitor`:

```
claude-hall-monitor/
├── .claude-plugin/
│   ├── plugin.json   # Plugin metadata
│   └── hooks.json    # Hook configurations
├── dist/
│   ├── handlers/     # Bundled JS handlers
│   └── viewer/       # Bundled viewer
├── hooks/            # TypeScript source
├── rules/            # Rule files
├── commands/         # Slash commands
├── .github/workflows/
│   ├── ci.yml        # PR validation
│   └── release.yml   # Release automation
├── build.ts          # Build script
├── test-e2e.ts       # E2E tests
├── CHANGELOG.md      # Version history
└── README.md         # User documentation
```
