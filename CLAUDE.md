# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Claude Code hooks project using Bun as the JavaScript runtime on Windows. It implements all 12 Claude Code hooks with full functionality, structured JSONL logging, and comprehensive documentation.

## Commands

```bash
# Install dependencies (run from .claude/hooks directory)
cd .claude/hooks && bun install

# Type check all hooks
cd .claude/hooks && bun run tsc --noEmit

# Run a hook script directly (for testing)
bun run .claude/hooks/user-prompt-submit.ts

# View structured logs
cat .claude/hooks/hooks-log.txt
```

## Architecture

The project uses Claude Code's hooks system to execute TypeScript scripts via Bun when specific events occur.

### Configuration

**Hook Configuration**: `.claude/settings.local.json` defines all 12 hooks and their triggers.

### Hook Scripts

Located in `.claude/hooks/`. Each hook:
- Receives input via stdin as JSON
- Uses types from `@anthropic-ai/claude-agent-sdk` for type safety
- Logs to unified `hooks-log.txt` in JSONL format
- Outputs JSON to stdout for Claude Code to consume

### Shared Utilities

**Logger** (`utils/logger.ts`): Provides structured logging and I/O helpers:
- `log(event, session_id, data)` - Append JSONL entry to log file
- `readInput<T>()` - Parse typed JSON from stdin
- `writeOutput(output)` - Write JSON response to stdout

### Log Format (JSONL)

All hooks write to `.claude/hooks/hooks-log.txt` with this schema:

```json
{"timestamp":"2024-12-11T14:30:00.000Z","event":"PreToolUse","session_id":"abc123","data":{...}}
```

## Implemented Hooks

| Hook | File | Capabilities |
|------|------|--------------|
| UserPromptSubmit | `user-prompt-submit.ts` | Log prompts, inject `additionalContext` |
| PreToolUse | `pre-tool-use.ts` | Allow/deny/modify tool inputs |
| PostToolUse | `post-tool-use.ts` | Log results, inject context, modify MCP output |
| PostToolUseFailure | `post-tool-use-failure.ts` | Log failures, provide recovery context |
| Notification | `notification.ts` | Log system notifications |
| SessionStart | `session-start.ts` | Log session start, inject welcome context |
| SessionEnd | `session-end.ts` | Log session termination |
| Stop | `stop.ts` | Log user interrupts |
| SubagentStart | `subagent-start.ts` | Log subagent spawning, inject context |
| SubagentStop | `subagent-stop.ts` | Log subagent completion |
| PreCompact | `pre-compact.ts` | Log context compaction events |
| PermissionRequest | `permission-request.ts` | Auto-approve/deny permissions |

## Hook Output Capabilities

Hooks can return JSON output to modify Claude Code behavior:

- **PreToolUse**: `permissionDecision` (allow/deny/ask), `permissionDecisionReason`, `updatedInput`
- **PostToolUse**: `additionalContext`, `updatedMCPToolOutput`
- **PostToolUseFailure**: `additionalContext`
- **UserPromptSubmit**: `additionalContext`
- **SessionStart**: `additionalContext`
- **SubagentStart**: `additionalContext`
- **PermissionRequest**: `decision` (allow/deny with options)

## Dependencies

- `@anthropic-ai/claude-agent-sdk` - Hook input/output type definitions
- `@types/bun` - Bun runtime types
- `typescript` - Type checking
