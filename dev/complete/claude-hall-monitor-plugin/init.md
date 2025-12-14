# Feature: F000 - Project Initialization

## Project Context

See `context.md` for feature rationale and architecture vision.

## Prior Work

None - this is the first feature.

## Objective

Create a new GitHub repository `NotMyself/claude-hall-monitor` with initial structure and clean git history.

> **Scope Constraint**: It is unacceptable to implement features beyond this task's scope.

## Relevant Decisions

From `decisions.md`:

- **D001**: Create new repo vs rename — Keeps original development repo intact for continued experimentation

## Edge Cases to Handle

None for this feature.

## Code References

- `code/json.md#plugin-json-schema` - Reference for plugin.json structure (created in F002)

## Constraints

- See `constraints.md` for global rules
- Repository must be public
- Use MIT license
- Initialize with README.md placeholder

## Files to Create

| File | Purpose |
|------|---------|
| `README.md` | Placeholder with project name |
| `.gitignore` | Standard Node/Bun ignores |
| `LICENSE` | MIT license |

## Implementation Details

### 1. Create Repository

Create new repository on GitHub:

- Name: `claude-hall-monitor`
- Owner: `NotMyself`
- Description: "Comprehensive hook monitoring with realtime viewer UI for Claude Code"
- Public: Yes
- Initialize with README: No (we'll add our own)

### 2. Clone and Initialize

```bash
git clone https://github.com/NotMyself/claude-hall-monitor.git
cd claude-hall-monitor
```

### 3. Create Initial Files

**README.md**:
```markdown
# Claude Hall Monitor

Comprehensive hook monitoring with realtime viewer UI for Claude Code.

> This plugin is under development. See releases for stable versions.
```

**.gitignore**:
```
# Dependencies
node_modules/
.bun/

# Build output
dist/

# Logs
*.log
hooks-log.txt

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Test coverage
coverage/
```

**LICENSE** (MIT):
```
MIT License

Copyright (c) 2024 NotMyself

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Acceptance Criteria

- [ ] Repository exists at `https://github.com/NotMyself/claude-hall-monitor`
- [ ] README.md contains project name and description
- [ ] .gitignore ignores node_modules, dist, logs
- [ ] LICENSE file contains MIT license
- [ ] Initial commit exists with all files

## Verification

```bash
# Verify repository exists and is cloneable
git clone https://github.com/NotMyself/claude-hall-monitor.git /tmp/verify-hall-monitor
cd /tmp/verify-hall-monitor
ls -la
cat README.md
cat .gitignore
cat LICENSE
```

## Commit

```bash
git add README.md .gitignore LICENSE
git commit -m "chore: initialize claude-hall-monitor repository

Implements: F000

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

## Next

Proceed to: `prompts/01-restructure.md` (F001)
