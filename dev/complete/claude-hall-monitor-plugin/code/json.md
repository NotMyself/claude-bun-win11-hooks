# JSON Patterns

## Plugin Configuration

### plugin.json Schema

The plugin manifest file:

```json
{
  "name": "claude-hall-monitor",
  "version": "1.0.0",
  "description": "Comprehensive hook monitoring with realtime viewer UI for Claude Code",
  "author": "NotMyself",
  "license": "MIT",
  "repository": "https://github.com/NotMyself/claude-hall-monitor",
  "keywords": ["claude-code", "hooks", "monitoring", "viewer"],
  "bun": ">=1.0.0",
  "files": [
    "dist/**/*",
    "hooks/**/*",
    "rules/**/*",
    "commands/**/*",
    "CHANGELOG.md",
    "README.md"
  ]
}
```

### hooks.json Schema

Hook configurations using the plugin root variable:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/user-prompt-submit.js",
        "timeout": 10000
      }
    ],
    "PreToolUse": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/pre-tool-use.js",
        "timeout": 10000
      }
    ],
    "PostToolUse": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/post-tool-use.js",
        "timeout": 10000
      }
    ],
    "PostToolUseFailure": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/post-tool-use-failure.js",
        "timeout": 10000
      }
    ],
    "Notification": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/notification.js",
        "timeout": 10000
      }
    ],
    "SessionStart": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/session-start.js",
        "timeout": 10000
      }
    ],
    "SessionEnd": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/session-end.js",
        "timeout": 10000
      }
    ],
    "Stop": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/stop.js",
        "timeout": 10000
      }
    ],
    "SubagentStart": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/subagent-start.js",
        "timeout": 10000
      }
    ],
    "SubagentStop": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/subagent-stop.js",
        "timeout": 10000
      }
    ],
    "PreCompact": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/pre-compact.js",
        "timeout": 10000
      }
    ],
    "PermissionRequest": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/permission-request.js",
        "timeout": 10000
      }
    ]
  }
}
```

## Package Configuration

### package.json Scripts

Build and test scripts for the plugin:

```json
{
  "name": "claude-hall-monitor-hooks",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "bun run ../build.ts",
    "build:watch": "bun run --watch ../build.ts",
    "tsc": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "bun run ../test-e2e.ts",
    "viewer": "bun run viewer/server.ts",
    "viewer:dev": "bun run --watch viewer/server.ts"
  },
  "dependencies": {},
  "devDependencies": {
    "@anthropic-ai/claude-agent-sdk": "^0.1.0",
    "@types/bun": "latest",
    "@vue/test-utils": "^2.4.0",
    "happy-dom": "^12.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

## Changelog Format

### CHANGELOG.md Structure

Following Keep a Changelog format:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-12-14

### Added
- Initial release of claude-hall-monitor plugin
- 12 hook handlers with JSONL logging
- Realtime log viewer UI with SSE streaming
- 6 rules files for Claude Code conventions
- 3 slash commands for planning and orchestration
- Cross-platform support (Windows, macOS, Linux)
- Security features: rate limiting, CORS, CSP headers

### Security
- Network binding restricted to localhost only
- Path traversal protection on file endpoints
- Session ID validation
- Bearer token authentication for shutdown endpoint

[Unreleased]: https://github.com/NotMyself/claude-hall-monitor/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/NotMyself/claude-hall-monitor/releases/tag/v1.0.0
```

## Manifest Format

### manifest.jsonl Entry

Each feature as a JSON line:

```json
{"id":"F001","file":"prompts/01-restructure.md","description":"Project restructure - move files from .claude/ to root","depends_on":["F000"],"edge_cases":[],"decisions":["D001"],"code_refs":[],"status":"pending","verification":"ls hooks/ rules/ commands/"}
```
