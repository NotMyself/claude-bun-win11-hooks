# Comprehensive Claude Code CLI Monitoring Documentation

Claude Code provides extensive observability through **JSONL session logs**, a **hooks system** with 8+ event types, **native OpenTelemetry support**, and **MCP protocol debugging**—enabling full visibility into sessions, tool usage, token consumption, and costs. Over 30 open-source tools already exist for parsing these data sources, with `ccusage` (8.9k stars) being the most popular for usage analytics.

## Primary data directory structure

All platforms use `~/.claude/` as the primary data location. On Windows, this maps to `%USERPROFILE%\.claude\`. The structure contains:

```
~/.claude/
├── history.jsonl              # Session index (all sessions)
├── projects/                  # Conversation transcripts by project
│   └── -encoded-project-path/
│       ├── {session-id}.jsonl # Individual session transcripts
│       └── .cache/            # Pre-parsed metadata cache
├── session-env/               # Session environment data
├── todos/                     # Per-session todo lists
├── settings.json              # User-level settings
├── settings.local.json        # Personal local settings
├── CLAUDE.md                  # Global custom instructions
├── commands/                  # User-level custom commands
├── agents/                    # Custom subagents
├── rules/                     # User-level rules (.md files)
└── debug/                     # Debug log files
```

**Project naming**: Directory paths are encoded by replacing `/` with `-`. For example, `/home/user/project` becomes `~/.claude/projects/-home-user-project/`.

## Log file locations by platform

### Windows 11

| File Type | Location |
|-----------|----------|
| **Main config directory** | `%USERPROFILE%\.claude\` |
| **Settings file** | `%USERPROFILE%\.claude\settings.json` |
| **Session transcripts** | `%USERPROFILE%\.claude\projects\` |
| **Global config** | `%USERPROFILE%\.claude.json` |
| **Debug logs** | `%USERPROFILE%\.claude\debug\` |
| **Enterprise managed** | `C:\ProgramData\ClaudeCode\managed-settings.json` |
| **Managed MCP** | `C:\Program Files\ClaudeCode\managed-mcp.json` |

### macOS

| File Type | Location |
|-----------|----------|
| **Main config directory** | `~/.claude/` |
| **Settings file** | `~/.claude/settings.json` |
| **Session transcripts** | `~/.claude/projects/` |
| **Global config** | `~/.claude.json` |
| **Debug logs** | `~/.claude/debug/` |
| **MCP logs** | `~/Library/Logs/Claude/mcp*.log` |
| **Enterprise managed** | `/Library/Application Support/ClaudeCode/managed-settings.json` |
| **Managed MCP** | `/Library/Application Support/ClaudeCode/managed-mcp.json` |

### Linux

| File Type | Location |
|-----------|----------|
| **Main config directory** | `~/.claude/` |
| **Settings file** | `~/.claude/settings.json` |
| **Session transcripts** | `~/.claude/projects/` |
| **Global config** | `~/.claude.json` |
| **Debug logs** | `~/.claude/debug/` |
| **Enterprise managed** | `/etc/claude-code/managed-settings.json` |
| **Managed MCP** | `/etc/claude-code/managed-mcp.json` |

The environment variable `CLAUDE_CONFIG_DIR` can override the default config location on any platform.

## JSONL log format and schema

All conversation transcripts use **JSONL format** (newline-delimited JSON). Each line represents a single event with these common fields:

```json
{
  "uuid": "d02cab21-cc42-407e-80cb-6305ac542803",
  "parentUuid": "2e7836df-0d59-428f-b193-8a07732705c7",
  "sessionId": "797df13f-41e5-4ccd-9f00-d6f6b9bee0b3",
  "timestamp": "2025-07-01T10:43:40.323Z",
  "type": "user|assistant|summary",
  "version": "1.0.38",
  "cwd": "/path/to/project",
  "userType": "external",
  "isSidechain": false
}
```

### User message entry

```json
{
  "type": "user",
  "message": {
    "role": "user",
    "content": "Your prompt text here"
  }
}
```

### Assistant message with tool use and token counts

```json
{
  "type": "assistant",
  "requestId": "req_011CQgAJYLtgENSsjEPSFFGu",
  "message": {
    "id": "msg_01SS3c1HZmneNCpZf5WazgHq",
    "type": "message",
    "role": "assistant",
    "model": "claude-opus-4-20250514",
    "content": [
      {"type": "text", "text": "Response content..."},
      {"type": "tool_use", "id": "toolu_01ABC", "name": "Write", "input": {"file_path": "/path/file.txt"}}
    ],
    "stop_reason": "end_turn",
    "usage": {
      "input_tokens": 150,
      "cache_creation_input_tokens": 6000,
      "cache_read_input_tokens": 14000,
      "output_tokens": 500,
      "service_tier": "standard"
    }
  }
}
```

Token usage data is embedded in every assistant response's `usage` object, including **cache token breakdowns** for cost analysis.

### Log retention and rotation

Claude Code uses **session-based file organization** rather than traditional rotation. Each session creates a new JSONL file that grows indefinitely within that session. The `cleanupPeriodDays` setting (default: **30 days**) controls automatic session cleanup. Context management happens through auto-compaction at ~75-95% context usage, creating summary entries rather than rotating files.

## Hooks system for real-time monitoring

Claude Code supports **8 hook events** that execute at different lifecycle points:

| Hook Event | Timing | Can Block | Monitoring Use Case |
|------------|--------|-----------|---------------------|
| **SessionStart** | Session initialization | No | Log environment context, git status |
| **UserPromptSubmit** | Before prompt processing | Yes | Log user inputs, inject context |
| **PreToolUse** | Before tool executes | Yes | Log tool calls, block dangerous commands |
| **PostToolUse** | After tool completes | No | Log results, run formatters |
| **PermissionRequest** | Before permission dialog | Yes | Auto-approve/deny, audit decisions |
| **Stop** | Claude finishes responding | Yes | Verify completion, generate summaries |
| **SubagentStop** | Subagent completes | Yes | Track nested agent activity |
| **PreCompact** | Before context compaction | No | Backup transcripts, preserve context |
| **Notification** | Claude sends notifications | No | Custom alerts, TTS, logging |

### Hook configuration locations

```
~/.claude/settings.json           # User-global hooks
.claude/settings.json             # Project hooks (committed)
.claude/settings.local.json       # Local project hooks (gitignored)
```

### Hook configuration schema

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash|Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "python3 /path/to/monitor.py",
        "timeout": 60
      }]
    }],
    "Stop": [{
      "hooks": [{
        "type": "command", 
        "command": "jq -c '.' >> ~/.claude/logs/events.jsonl"
      }]
    }]
  }
}
```

### Hook input payload (via stdin)

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../session.jsonl",
  "cwd": "/current/working/directory",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {"command": "npm test"},
  "tool_use_id": "toolu_01ABC123"
}
```

### Hook output control

- **Exit code 0**: Success, stdout added to context for `UserPromptSubmit`/`SessionStart`
- **Exit code 2**: Block the operation, stderr fed to Claude for correction
- **JSON output**: Structured control with `{"decision": "approve|block", "reason": "..."}`

### Example monitoring hook (Python)

```python
#!/usr/bin/env python3
import json, sys
from datetime import datetime
from pathlib import Path

LOG_FILE = Path.home() / ".claude/logs/tool_events.jsonl"
LOG_FILE.parent.mkdir(parents=True, exist_ok=True)

input_data = json.load(sys.stdin)
log_entry = {
    "timestamp": datetime.utcnow().isoformat() + "Z",
    "session_id": input_data.get("session_id"),
    "event": input_data.get("hook_event_name"),
    "tool_name": input_data.get("tool_name"),
    "tool_input": input_data.get("tool_input"),
    "cwd": input_data.get("cwd")
}
with open(LOG_FILE, "a") as f:
    f.write(json.dumps(log_entry) + "\n")
sys.exit(0)
```

## OpenTelemetry integration for metrics and events

Claude Code provides **native OpenTelemetry support** for enterprise monitoring. This is the officially recommended approach for comprehensive observability.

### Enabling telemetry

```bash
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=otlp
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

### Available metrics

| Metric | Description | Unit |
|--------|-------------|------|
| `claude_code.session.count` | CLI sessions started | count |
| `claude_code.lines_of_code.count` | Lines modified (type: added/removed) | count |
| `claude_code.pull_request.count` | PRs created | count |
| `claude_code.commit.count` | Commits created | count |
| `claude_code.cost.usage` | Session cost by model | USD |
| `claude_code.token.usage` | Token counts (input/output/cache) | tokens |
| `claude_code.code_edit_tool.decision` | Accept/reject decisions | count |
| `claude_code.active_time.total` | Active usage time | seconds |

### Available events

| Event | Description | Key Attributes |
|-------|-------------|----------------|
| `claude_code.user_prompt` | User submits prompt | `prompt_length`, `prompt` (if enabled) |
| `claude_code.tool_result` | Tool completes | `tool_name`, `success`, `duration_ms` |
| `claude_code.api_request` | API call made | `model`, `cost_usd`, `input_tokens`, `output_tokens` |
| `claude_code.api_error` | API failure | `error`, `status_code`, `attempt` |
| `claude_code.tool_decision` | Permission decision | `tool_name`, `decision`, `source` |

All metrics include standard attributes: `session.id`, `app.version`, `organization.id`, `user.account_uuid`, `terminal.type`, `os.type`, `os.version`, `host.arch`.

### Telemetry configuration variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `OTEL_METRIC_EXPORT_INTERVAL` | Metrics export interval | 60000ms |
| `OTEL_LOGS_EXPORT_INTERVAL` | Logs export interval | 5000ms |
| `OTEL_LOG_USER_PROMPTS` | Include prompt content | disabled |
| `OTEL_METRICS_INCLUDE_SESSION_ID` | Include session.id | true |
| `OTEL_RESOURCE_ATTRIBUTES` | Custom attributes | - |

## Telemetry opt-out mechanisms

| Variable | Effect |
|----------|--------|
| `DISABLE_TELEMETRY=1` | Opt out of Statsig operational metrics |
| `DISABLE_ERROR_REPORTING=1` | Opt out of Sentry error logging |
| `DISABLE_BUG_COMMAND=1` | Disable `/bug` command |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=true` | Master switch for all non-essential network traffic |

For consumer accounts, model training opt-out is available at **claude.ai/settings/data-privacy-controls**.

## MCP server monitoring

### MCP configuration locations

| Platform | Location |
|----------|----------|
| **All (user)** | `~/.claude.json` under `mcpServers` key |
| **Project** | `.mcp.json` in project root |
| **macOS (Desktop)** | `~/Library/Logs/Claude/mcp*.log` |
| **Windows (Desktop)** | `%APPDATA%\Claude\logs\mcp*.log` |

### MCP configuration format

```json
{
  "mcpServers": {
    "my-server": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {"GITHUB_TOKEN": "..."}
    }
  }
}
```

### Monitoring MCP communications

**Method 1: MCP Inspector (official tool)**
```bash
npx @modelcontextprotocol/inspector <your-server-command>
# Web UI at http://localhost:6274
```

**Method 2: Debug flags**
```bash
claude --mcp-debug
```

**Method 3: Wrapper script for logging**
```bash
#!/bin/bash
tee -a /tmp/mcp-stdin.log | your-mcp-server | tee -a /tmp/mcp-stdout.log
```

**Method 4: Environment variables**
```bash
MCP_TIMEOUT=10000        # Connection timeout (ms)
MAX_MCP_OUTPUT_TOKENS=50000  # Max tool output tokens
DEBUG=*                  # Enable all debug output
```

### MCP message format

Communications use **JSON-RPC 2.0** over stdio (newline-delimited):

```json
{"jsonrpc": "2.0", "id": "req-123", "method": "tools/call", "params": {"name": "tool_name", "arguments": {...}}}
{"jsonrpc": "2.0", "id": "req-123", "result": {"content": [...], "isError": false}}
```

## CLI debugging flags and commands

### Debug flags

| Flag | Purpose |
|------|---------|
| `--verbose` | Enable verbose logging, full turn-by-turn output |
| `--debug` | Enable debug mode with category filtering (e.g., `"api,hooks"`) |
| `--mcp-debug` | Debug MCP server configuration |
| `--output-format json` | JSON output in print mode |
| `--output-format stream-json` | Streaming JSON events |

### Diagnostic commands

| Command | Purpose |
|---------|---------|
| `/doctor` | Check installation health |
| `/stats` | View usage statistics |
| `/config` | Open settings interface |
| `/permissions` | View permission rules |
| `/mcp` | Check MCP server status |
| `/bug` | Report issues to Anthropic |

## Existing GitHub monitoring tools

The community has built **30+ repositories** for Claude Code observability:

### Usage analytics

- **ccusage** (8.9k ⭐): Most popular CLI for analyzing JSONL logs. Daily/monthly reports, cost tracking, live monitoring, JSON export, MCP server integration.
- **claude-code-history-viewer**: Tauri desktop app with activity heatmaps and token statistics.
- **sniffly**: Dashboard with error analysis and mistake identification.
- **vibe-log-cli**: Productivity insights and standup report generation.

### Real-time monitoring

- **claude-code-hooks-multi-agent-observability** (757 ⭐): Vue 3 dashboard with WebSocket live updates, SQLite storage, tracks all 9 hook events.
- **claude-code-otel**: Docker Compose stack with OTel Collector → Prometheus + Loki → Grafana.
- **Claude-Code-Usage-Monitor**: Terminal tool with ML predictions and burn rate analytics.

### Official Anthropic resources

- **claude-code-monitoring-guide** (103 ⭐): Official ROI measurement guide with Docker Compose configs, Prometheus setup, and report templates.

### CLI wrappers and proxies

- **claude_telemetry**: Drop-in CLI replacement (`claudia`) with OTel tracing.
- **dev-agent-lens**: LiteLLM proxy with Arize/Phoenix integration.
- **agentsight**: Zero-instrumentation eBPF-based LLM observability.

### MCP debugging

- **mcphawk**: Protocol-aware MCP traffic capture (like Wireshark for MCP).
- **MCP-Analyzer**: MCP server for analyzing MCP logs.

## Complete environment variables reference

### Core configuration

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | API key for authentication |
| `ANTHROPIC_MODEL` | Override default model |
| `ANTHROPIC_LOG=debug` | Log all API requests |
| `CLAUDE_CONFIG_DIR` | Override config directory |

### Timeouts and limits

| Variable | Purpose |
|----------|---------|
| `BASH_DEFAULT_TIMEOUT_MS` | Default bash command timeout |
| `BASH_MAX_TIMEOUT_MS` | Maximum bash timeout |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | Max output tokens |
| `MAX_MCP_OUTPUT_TOKENS` | Max MCP response tokens (default: 25000) |
| `MCP_TIMEOUT` | MCP server startup timeout |
| `MCP_TOOL_TIMEOUT` | MCP tool execution timeout |

### Hook environment variables

| Variable | Available In | Purpose |
|----------|--------------|---------|
| `CLAUDE_PROJECT_DIR` | All hooks | Absolute project root path |
| `CLAUDE_CODE_REMOTE` | All hooks | `"true"` if web environment |
| `CLAUDE_ENV_FILE` | SessionStart | Path to persist env vars |
| `CLAUDE_PLUGIN_ROOT` | Plugin hooks | Plugin directory path |

## Building a monitoring tool: key recommendations

1. **Primary data source**: Parse JSONL files in `~/.claude/projects/` for complete session history with token counts
2. **Real-time events**: Implement hooks for all 8 event types, writing to a centralized log or streaming server
3. **Token tracking**: Sum `input_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`, `output_tokens` from `usage` objects in assistant messages
4. **Context awareness**: Filter on `isSidechain: false` for main conversation thread
5. **Cross-platform paths**: Use `~/.claude/` consistently; resolve with `os.path.expanduser()` or equivalent
6. **Cache optimization**: Leverage `.cache/` directories for faster initial loads of session metadata
7. **Enterprise telemetry**: Configure OpenTelemetry for Prometheus/Grafana dashboards at scale
8. **MCP visibility**: Use wrapper scripts or `--mcp-debug` to capture tool call details

## Conclusion

Claude Code's observability architecture combines **persistent JSONL logs** with detailed token usage, an **extensible hooks system** for real-time event capture, and **native OpenTelemetry support** for enterprise metrics. The consistent `~/.claude/` data directory across platforms simplifies cross-platform tooling, while the 30+ existing open-source projects provide proven patterns for log parsing, dashboard creation, and instrumentation. For comprehensive monitoring, combine JSONL parsing for historical analysis, hooks for real-time events, and OpenTelemetry for aggregated metrics—all accessible through documented file paths and environment variables.