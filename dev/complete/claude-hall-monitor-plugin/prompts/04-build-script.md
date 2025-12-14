# Feature: F003 - Build Script Core

## Project Context

See `context.md` for feature rationale and architecture vision.

## Prior Work

- **F000**: Repository initialized
- **F001**: Files restructured to `hooks/` directory
- **F002**: Plugin manifest created
- **F007**: Changelog created

## Objective

Create the `build.ts` script that bundles TypeScript handlers and viewer to standalone JavaScript files.

> **Scope Constraint**: It is unacceptable to implement features beyond this task's scope.

## Relevant Decisions

From `decisions.md`:

- **D002**: Bundle to JavaScript — Eliminates `bun install` for end users; faster startup

## Edge Cases to Handle

From `edge-cases.md`:

- **EC001**: Cross-platform path handling — Use `path.join()` for all path construction
- **EC004**: Build output directory conflicts — Clean `dist/` before each build
- **EC008**: Permission denied errors — Build script should produce executable output
- **EC009**: Stale dist/ files — Clean before build

## Code References

- `code/typescript.md#build-script-core` - Full build script implementation
- `code/bash.md#clean-build` - Clean and build commands

## Constraints

- See `constraints.md` for global rules
- Use Bun.build API
- Target: "bun"
- No minification (for debugging)
- No sourcemaps in output
- Output to `dist/` directory

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `build.ts` | Main build script using Bun.build API |
| `hooks/package.json` | Add build scripts |

## Implementation Details

### 1. Create build.ts

Create `build.ts` in repository root:

```typescript
import { join } from "node:path";
import { existsSync, rmSync, readdirSync } from "node:fs";

const ROOT = import.meta.dir;
const HANDLERS_DIR = join(ROOT, "hooks", "handlers");
const VIEWER_DIR = join(ROOT, "hooks", "viewer");
const DIST_DIR = join(ROOT, "dist");

async function build(): Promise<void> {
  console.log("Building claude-hall-monitor...\n");

  // Clean dist directory
  if (existsSync(DIST_DIR)) {
    console.log("Cleaning dist/...");
    rmSync(DIST_DIR, { recursive: true });
  }

  // Get all handler files
  const handlerFiles = readdirSync(HANDLERS_DIR)
    .filter((f) => f.endsWith(".ts"))
    .map((f) => join(HANDLERS_DIR, f));

  console.log(`Found ${handlerFiles.length} handlers to build`);

  // Build all handlers
  console.log("\nBuilding handlers...");
  const handlerResult = await Bun.build({
    entrypoints: handlerFiles,
    outdir: join(DIST_DIR, "handlers"),
    target: "bun",
    minify: false,
    sourcemap: "none",
  });

  if (!handlerResult.success) {
    console.error("Handler build failed:");
    for (const log of handlerResult.logs) {
      console.error(log);
    }
    process.exit(1);
  }

  console.log(`Built ${handlerResult.outputs.length} handlers`);

  // Build viewer server
  console.log("\nBuilding viewer...");
  const viewerResult = await Bun.build({
    entrypoints: [join(VIEWER_DIR, "server.ts")],
    outdir: join(DIST_DIR, "viewer"),
    target: "bun",
    minify: false,
    sourcemap: "none",
  });

  if (!viewerResult.success) {
    console.error("Viewer build failed:");
    for (const log of viewerResult.logs) {
      console.error(log);
    }
    process.exit(1);
  }

  console.log(`Built viewer server`);

  // Copy viewer assets (HTML, CSS)
  console.log("\nCopying viewer assets...");
  const viewerAssets = readdirSync(VIEWER_DIR).filter(
    (f) => f.endsWith(".html") || f.endsWith(".css")
  );

  for (const asset of viewerAssets) {
    const src = join(VIEWER_DIR, asset);
    const dest = join(DIST_DIR, "viewer", asset);
    await Bun.write(dest, Bun.file(src));
    console.log(`  Copied ${asset}`);
  }

  console.log("\n✓ Build complete!");
  console.log(`  Handlers: dist/handlers/ (${handlerFiles.length} files)`);
  console.log(`  Viewer:   dist/viewer/`);
}

build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
```

### 2. Update hooks/package.json

Add build script to `hooks/package.json`:

```json
{
  "scripts": {
    "build": "bun run ../build.ts",
    ...existing scripts...
  }
}
```

## Acceptance Criteria

- [ ] `build.ts` exists in repository root
- [ ] Script uses Bun.build API with correct options
- [ ] Script cleans `dist/` before building
- [ ] Script builds all handlers to `dist/handlers/`
- [ ] Script builds viewer to `dist/viewer/`
- [ ] Script copies viewer assets (HTML)
- [ ] Script reports success/failure with counts
- [ ] hooks/package.json has "build" script

## Verification

```bash
# Run build script
bun run build.ts

# Verify output exists
ls -la dist/handlers/
ls -la dist/viewer/

# Should see .js files
file dist/handlers/session-start.js
file dist/viewer/server.js
```

## Commit

```bash
git add build.ts hooks/package.json
git commit -m "feat(build): add Bun.build script for bundling

Implements: F003
Decisions: D002

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Next

Proceed to: `prompts/05-handler-bundling.md` (F004)
