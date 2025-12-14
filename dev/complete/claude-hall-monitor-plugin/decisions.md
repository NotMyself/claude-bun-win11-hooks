# Architectural Decisions

| ID | Decision | Rationale | Affected Features |
|----|----------|-----------|-------------------|
| D001 | Create new repo vs rename | User preference - keeps original development repo intact for continued experimentation while providing a clean distribution repository | F000, F013 |
| D002 | Bundle to JavaScript | Eliminates `bun install` step for end users; faster startup; still requires Bun runtime but no dependency installation | F003, F004, F005, F006 |
| D003 | Semantic versioning starting at 1.0.0 | Industry standard versioning; 1.0.0 indicates initial stable release ready for production use | F007, F008 |
| D004 | Keep a Changelog format | Standard format from keepachangelog.com for documenting version history; widely recognized and easy to parse | F007 |
| D005 | GitHub Actions for CI/CD | Automated build, test, and release on PR/tag; native integration with GitHub releases | F011, F012 |
| D006 | Zip archive for releases | Easy distribution format; contains all plugin files in a single downloadable artifact | F012 |
| D007 | Use ${CLAUDE_PLUGIN_ROOT} in hook commands | Standard pattern from claude-dotnet-marketplace; expanded at runtime to the actual plugin install location | F006 |

## Decision Details

### D001: New Repository Strategy

Creating `NotMyself/claude-hall-monitor` as a separate repository rather than renaming the current repo:

- **Pros**: Keeps development history separate, allows continued experimentation in original repo, clean git history for distribution
- **Cons**: Requires manual sync if changes are made to original, two repos to maintain
- **Mitigation**: Once plugin is stable, development can shift entirely to the new repo

### D002: JavaScript Bundling

Using Bun.build to create standalone JavaScript bundles:

- All 12 handlers bundled individually to `dist/handlers/*.js`
- Viewer server bundled to `dist/viewer/server.js`
- Dependencies inlined (no node_modules needed)
- TypeScript compiled to JavaScript

### D003: Version 1.0.0

Starting at 1.0.0 rather than 0.x.x:

- All core functionality is implemented and tested
- Hook handlers are stable
- Viewer UI is production-ready
- API contract (hooks.json format) is stable

### D007: Plugin Root Variable

The `${CLAUDE_PLUGIN_ROOT}` variable in hooks.json:

```json
{
  "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/session-start.js"
}
```

This gets expanded by Claude Code at runtime to the actual installation path, enabling the plugin to work regardless of where it's installed.
