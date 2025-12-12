# Auto-Configure Playwright MCP Screenshots per Project

**STATUS: NOT WORKING - Docker MCP Architecture Limitation**

## Problem

The Playwright MCP Docker image doesn't support custom output directories via `docker mcp config` because:

1. **Hardcoded environment variable**: The Dockerfile sets `ENV PLAYWRIGHT_MCP_OUTPUT_DIR=/tmp/playwright-output`
2. **Config doesn't translate to env vars**: Values set via `docker mcp config write` don't become container environment variables
3. **No volume mount support**: The Playwright catalog entry lacks `volumes` configuration (unlike the filesystem server which explicitly defines volume mounts)
4. **Container isolation**: Without volume mounts, host paths like `/C/Users/...` don't exist inside the Linux container

## What Was Tried

1. Setting `outputDir` via `docker mcp config write` - ignored by container
2. Setting `PLAYWRIGHT_MCP_OUTPUT_DIR` via `docker mcp config write` - not passed as env var
3. Using `mcp-config-set` MCP tool - same issue
4. Creating a custom catalog entry with `volumes` configuration - complex and didn't resolve

## Workarounds

### Option 1: Screenshots in Tool Response (Current State)
Screenshots ARE returned inline in the MCP tool response. Claude Code displays them, so they're accessible - just not saved to the host filesystem.

### Option 2: Custom Docker Image (Manual)
Build a custom Playwright MCP image that mounts a host directory:

```bash
# Not implemented - would require custom Docker setup
```

### Option 3: Request Feature from Docker
Ask Docker/Microsoft to add volume mount configuration to the official Playwright MCP catalog entry.

## Original Plan Files

- `constraints.md` - Implementation constraints
- `prompts/` - Original implementation prompts (now obsolete)

## Related Commits

The SessionStart hook integration was implemented but has been removed since it doesn't work:
- `fae589d` - Added toDockerPath utility (removed)
- `b6af30a` - Added configurePlaywrightScreenshots function (removed)
- `f997e4d` - Integrated into session startup (removed)
