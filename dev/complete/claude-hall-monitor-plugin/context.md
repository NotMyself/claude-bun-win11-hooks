# Project Context

## Summary

Transform the claude-bun-win11-hooks project into an installable Claude Code plugin named "claude-hall-monitor". This plugin provides comprehensive hook monitoring capabilities through:

- **12 Hook Handlers**: Full coverage of all Claude Code hook events (UserPromptSubmit, PreToolUse, PostToolUse, PostToolUseFailure, Notification, SessionStart, SessionEnd, Stop, SubagentStart, SubagentStop, PreCompact, PermissionRequest)
- **Hall Monitor Viewer**: Realtime web UI for monitoring hook activity via SSE streaming
- **6 Rules Files**: Actionable conventions auto-loaded by Claude Code
- **3 Slash Commands**: Custom commands for planning and orchestration

The goal is to create a distributable package that can be installed via the claude-dotnet-marketplace, enabling any Claude Code user to add comprehensive hook monitoring to their projects.

## Architecture Vision

### Plugin Structure

The plugin follows the claude-dotnet-marketplace plugin format:

```
claude-hall-monitor/
├── .claude-plugin/
│   ├── plugin.json      # Plugin metadata and configuration
│   └── hooks.json       # Hook configurations with ${CLAUDE_PLUGIN_ROOT}
├── dist/
│   ├── handlers/        # Bundled JS hook handlers (12 files)
│   └── viewer/          # Bundled viewer server
├── hooks/
│   ├── handlers/        # TypeScript source (development)
│   ├── utils/           # Shared utilities
│   └── viewer/          # Viewer source
├── rules/               # Auto-loaded rule files
├── commands/            # Slash command definitions
├── build.ts             # Bun build script
└── CHANGELOG.md         # Version history
```

### Key Design Principles

1. **Zero Installation Friction**: Bundle all dependencies into standalone JS files so users only need Bun runtime (no `bun install` required)

2. **Cross-Platform Compatibility**: All handlers and viewer work on Windows, macOS, and Linux through careful path handling

3. **Runtime Path Resolution**: Use `${CLAUDE_PLUGIN_ROOT}` variable in hooks.json, expanded by Claude Code at runtime to the actual installation path

4. **Semantic Versioning**: Start at 1.0.0, maintain version consistency across plugin.json, package.json, and CHANGELOG.md

5. **CI/CD Automation**: GitHub Actions workflows for PR validation and release packaging

## Goals

- Create a clean, distributable plugin package
- Maintain all existing functionality from the development repo
- Enable one-command installation via marketplace
- Provide comprehensive documentation for users
- Establish automated testing and release pipeline
