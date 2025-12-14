# Edge Cases

| ID | Case | Handling | Affected Features |
|----|------|----------|-------------------|
| EC001 | Cross-platform path handling | Use `path.join()` for all path construction; normalize paths to forward slashes for shell commands on Windows | F003, F004, F005 |
| EC002 | Bun runtime not installed | Document Bun as prerequisite in README; provide installation link; hooks will fail gracefully with error message | F007, F009, F010 |
| EC003 | Plugin variable expansion | `${CLAUDE_PLUGIN_ROOT}` must be correctly expanded by Claude Code; if not expanded, commands will fail with "file not found" | F006 |
| EC004 | Build output directory conflicts | Clean `dist/` directory before each build; use `--outdir` flag to ensure correct output location | F003, F004, F005 |
| EC005 | Viewer port conflicts | Port 3456 may already be in use; existing code handles this with error message; document in README | F005, F009 |
| EC006 | Version drift | Versions could get out of sync between plugin.json, package.json, and CHANGELOG.md; add version check to CI | F008, F011 |
| EC007 | Large log files | hooks-log.txt may grow unbounded; document log rotation strategy; viewer handles streaming efficiently | F009 |
| EC008 | Permission denied errors | Handler scripts need execute permission on Unix; build script should preserve permissions | F003, F004, F005 |
| EC009 | Stale dist/ files | Old bundled files may remain if handler is renamed/removed; clean before build | F003 |
| EC010 | Missing .claude-plugin directory | Claude Code may not recognize plugin if directory is missing or malformed; validate structure in CI | F002, F011 |

## Edge Case Details

### EC001: Cross-Platform Path Handling

Windows uses backslashes (`\`) while Unix uses forward slashes (`/`). Key considerations:

- `path.join()` produces OS-appropriate separators
- `cmd.exe` has issues with backslashes in quoted paths
- Normalize to forward slashes for shell commands: `p.replace(/\\/g, '/')`
- The existing codebase has `normalizePath()` utility for this

### EC003: Plugin Variable Expansion

The `${CLAUDE_PLUGIN_ROOT}` variable is expanded by Claude Code's plugin system. If:

- Plugin is installed correctly: Variable expands to actual install path
- Plugin is run manually: Variable may not expand, causing "file not found" errors

For development/testing, use absolute paths or run from the plugin root directory.

### EC006: Version Drift

Three files must stay in sync:

1. `.claude-plugin/plugin.json` - `"version": "1.0.0"`
2. `hooks/package.json` - `"version": "1.0.0"`
3. `CHANGELOG.md` - `## [1.0.0]` section header

The CI workflow should verify these match on every PR.

### EC007: Large Log Files

The `hooks-log.txt` file grows with each hook event. Mitigation strategies:

- Document recommended log rotation (e.g., `logrotate` on Linux)
- Viewer uses SSE streaming so doesn't load entire file
- Users can clear log manually or on session start
