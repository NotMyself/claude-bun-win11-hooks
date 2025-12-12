---
name: docker-mcp-cli
description: Docker MCP CLI management for MCP servers and gateway operations. Use when working with Docker's Model Context Protocol toolkit including (1) Managing MCP servers - enable, disable, list, inspect, reset, (2) Running the MCP gateway - stdio/SSE/streaming transports, server selection, secrets, (3) Managing catalogs - create, add, import, export, bootstrap, show, (4) Tool operations - list, inspect, call, count, (5) Configuration management - read, write, reset, (6) Feature flags - enable/disable configured-catalogs or dynamic-tools, (7) Secrets and OAuth management, (8) Creating custom server definitions for the MCP registry
---

# Docker MCP CLI

Manage MCP servers and the MCP gateway using the `docker mcp` CLI plugin.

## Quick Reference

```bash
# Gateway operations
docker mcp gateway run                              # Run gateway (stdio)
docker mcp gateway run --transport sse --port 8811  # Run with SSE transport

# Server management
docker mcp server list                              # List enabled servers
docker mcp server enable <name>                     # Enable a server
docker mcp server disable <name>                    # Disable a server
docker mcp server inspect <name>                    # Inspect server details

# Tool operations
docker mcp tools list                               # List all available tools
docker mcp tools call <tool-name> [args]            # Call a tool
docker mcp tools inspect <tool-name>                # Inspect tool details

# Catalog management
docker mcp catalog ls                               # List configured catalogs
docker mcp catalog show <name>                      # Show servers in catalog
docker mcp catalog create <name>                    # Create new catalog
docker mcp catalog add <catalog> <server> <file>    # Add server to catalog

# Configuration
docker mcp config read                              # Read current config
docker mcp config write '<yaml>'                    # Write YAML config
docker mcp config reset                             # Reset to defaults
```

## Gateway Operations

### Run Gateway

```bash
# Basic stdio mode (default)
docker mcp gateway run

# SSE transport on specific port
docker mcp gateway run --transport sse --port 8811

# Streaming transport
docker mcp gateway run --transport streaming --port 8080

# Select specific servers
docker mcp gateway run --servers server1,server2

# Select specific tools from servers
docker mcp gateway run --tools server1:* --tools server2:tool_name

# Verbose logging with call tracing
docker mcp gateway run --verbose --log-calls

# Watch mode for config changes
docker mcp gateway run --watch

# Dry-run to test configuration
docker mcp gateway run --verbose --dry-run

# Custom catalog file
docker mcp gateway run --catalog ./my-catalog.yaml --servers myserver

# Use user-configured catalogs (requires feature flag)
docker mcp gateway run --use-configured-catalogs
```

### Gateway Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--transport` | `stdio` | Transport type: stdio, sse, streaming |
| `--port` | - | TCP port (required for sse/streaming) |
| `--servers` | - | Comma-separated server names |
| `--tools` | - | Tools to enable (format: server:tool or server:*) |
| `--catalog` | docker-mcp.yaml | Path to catalog file |
| `--config` | config.yaml | Path to config file |
| `--registry` | registry.yaml | Path to registry file |
| `--secrets` | docker-desktop | Secret lookup paths (colon-separated) |
| `--watch` | true | Auto-reload on config changes |
| `--verbose` | false | Verbose output |
| `--log-calls` | true | Log tool calls |
| `--dry-run` | false | Test config without listening |
| `--cpus` | 1 | CPUs per MCP server |
| `--memory` | 2Gb | Memory per MCP server |
| `--keep` | false | Keep stopped containers |
| `--verify-signatures` | false | Verify server image signatures |
| `--use-configured-catalogs` | false | Include user-managed catalogs |

## Server Management

```bash
# List all enabled servers
docker mcp server list

# Enable servers
docker mcp server enable filesystem github

# Disable servers
docker mcp server disable filesystem

# Inspect server details (config, secrets, tools)
docker mcp server inspect filesystem

# Reset server list to defaults
docker mcp server reset

# Import server from official registry
docker mcp server import <registry-url> [image-name] [--push=true]
```

## Catalog Management

### Feature Flag Requirement

Custom catalogs require enabling the feature:

```bash
docker mcp feature enable configured-catalogs
docker mcp feature list  # Verify enabled
```

### Catalog Operations

```bash
# Initialize default catalog
docker mcp catalog init

# List all catalogs
docker mcp catalog ls
docker mcp catalog ls --json

# Show servers in a catalog
docker mcp catalog show docker-mcp
docker mcp catalog show my-catalog --format json

# Create new empty catalog
docker mcp catalog create my-servers

# Bootstrap starter catalog with examples
docker mcp catalog bootstrap ./starter-catalog.yaml

# Add server from file to catalog
docker mcp catalog add my-catalog server-name ./server-def.yaml
docker mcp catalog add my-catalog server-name ./source.yaml --force

# Import catalog from file/URL
docker mcp catalog import ./catalog.yaml
docker mcp catalog import https://example.com/catalog.yaml

# Export custom catalog
docker mcp catalog export my-catalog ./backup.yaml

# Remove custom catalog
docker mcp catalog rm my-catalog

# Update catalogs
docker mcp catalog update
docker mcp catalog update my-catalog

# Reset to Docker defaults
docker mcp catalog reset
```

## Tool Operations

```bash
# Count available tools
docker mcp tools count

# List all tools
docker mcp tools list
docker mcp tools list --format json

# Inspect a tool
docker mcp tools inspect search

# Call a tool with arguments
docker mcp tools call search query=Docker
docker mcp tools call --gateway-arg="--servers=duckduckgo" --verbose search query=Docker
```

## Configuration

```bash
# Read current configuration
docker mcp config read

# Write YAML configuration
docker mcp config write 'servers: [filesystem, github]'

# Reset to defaults
docker mcp config reset
```

## Feature Flags

```bash
# Enable features
docker mcp feature enable configured-catalogs
docker mcp feature enable dynamic-tools

# Disable features
docker mcp feature disable configured-catalogs

# List all features and status
docker mcp feature list
```

## Secrets and OAuth

```bash
# Show secrets help
docker mcp secret --help

# Export secrets for servers
docker mcp secret export server1 server2

# OAuth management
docker mcp oauth --help
docker mcp oauth authorize <server-name>
```

## Access Policies

```bash
docker mcp policy --help
```

## Docker Compose Integration

```yaml
services:
  gateway:
    image: docker/mcp-gateway
    ports:
      - "8811:8811"
    command:
      - --servers=filesystem,github
      - --transport=sse
      - --port=8811
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ~/.docker/mcp:/mcp:ro
```

## Claude Desktop Configuration

```json
{
  "mcpServers": {
    "MCP_DOCKER": {
      "command": "docker",
      "args": ["mcp", "gateway", "run"]
    }
  }
}
```

## Troubleshooting

```bash
# Debug startup with dry-run
docker mcp gateway run --verbose --dry-run

# Debug specific server
docker mcp gateway run --verbose --dry-run --servers=duckduckgo

# Check OTEL telemetry config
docker context inspect | jq '.[].Metadata.otel'

# Enable telemetry debug
DOCKER_MCP_TELEMETRY_DEBUG=1 docker mcp gateway run
```

## Creating Custom Servers

See [references/server-definitions.md](references/server-definitions.md) for complete server definition schema and examples.

### Quick Server Definition

```yaml
name: my-server
image: mcp/my-server
type: server
meta:
  category: devops
  tags: [devops, automation]
about:
  title: My Server
  description: What this server does
  icon: https://example.com/icon.png
source:
  project: https://github.com/org/repo
  commit: 0123456789abcdef0123456789abcdef01234567
config:
  secrets:
    - name: my-server.api_key
      env: API_KEY
      example: YOUR_API_KEY
run:
  command: [--transport=stdio]
```
