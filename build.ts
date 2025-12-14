#!/usr/bin/env bun
import { join } from "node:path";
import { existsSync, rmSync, mkdirSync } from "node:fs";

/**
 * Build configuration
 */
interface BuildConfig {
  entrypoints: string[];
  outdir: string;
  target: "bun" | "node";
  minify: boolean;
}

/**
 * Normalize paths for cross-platform compatibility
 */
function normalizePath(p: string): string {
  return p.replace(/\\/g, "/");
}

/**
 * Get all handler entrypoints
 */
function getHandlerEntrypoints(handlersDir: string): string[] {
  const handlers = [
    "session-start.ts",
    "session-end.ts",
    "user-prompt-submit.ts",
    "pre-tool-use.ts",
    "post-tool-use.ts",
    "post-tool-use-failure.ts",
    "notification.ts",
    "stop.ts",
    "subagent-start.ts",
    "subagent-stop.ts",
    "pre-compact.ts",
    "permission-request.ts",
  ];
  return handlers.map((h) => join(handlersDir, h));
}

/**
 * Bundle a single entrypoint with all dependencies inlined
 */
async function bundleHandler(
  entrypoint: string,
  outdir: string
): Promise<void> {
  const result = await Bun.build({
    entrypoints: [entrypoint],
    outdir,
    target: "bun",
    minify: true,
    sourcemap: "none",
  });

  if (!result.success) {
    console.error(`Failed to bundle ${entrypoint}:`);
    for (const log of result.logs) {
      console.error(log);
    }
    throw new Error(`Bundle failed: ${entrypoint}`);
  }
}

/**
 * Build all handlers
 */
async function buildAllHandlers(): Promise<void> {
  const handlersDir = join(import.meta.dir, "hooks", "handlers");
  const outdir = join(import.meta.dir, "dist", "handlers");

  const entrypoints = getHandlerEntrypoints(handlersDir);

  for (const entry of entrypoints) {
    await bundleHandler(entry, outdir);
    const name = entry.split(/[/\\]/).pop();
    console.log(`✓ Built ${name}`);
  }
}

/**
 * Build viewer server
 */
async function buildViewer(): Promise<void> {
  const viewerEntry = join(import.meta.dir, "hooks", "viewer", "server.ts");
  const outdir = join(import.meta.dir, "dist", "viewer");

  await bundleHandler(viewerEntry, outdir);
  console.log(`✓ Built viewer/server.ts`);
}

/**
 * Clean dist directory
 */
function cleanDist(): void {
  const distDir = join(import.meta.dir, "dist");
  if (existsSync(distDir)) {
    console.log("🧹 Cleaning dist directory...");
    rmSync(distDir, { recursive: true, force: true });
  }
}

/**
 * Create dist directory structure
 */
function createDistStructure(): void {
  const distDir = join(import.meta.dir, "dist");
  const handlersDir = join(distDir, "handlers");
  const viewerDir = join(distDir, "viewer");

  console.log("📁 Creating dist directory structure...");
  mkdirSync(distDir, { recursive: true });
  mkdirSync(handlersDir, { recursive: true });
  mkdirSync(viewerDir, { recursive: true });
}

/**
 * Run TypeScript type checking before build
 */
async function typeCheck(): Promise<void> {
  console.log("🔍 Type checking...");
  const hooksDir = join(import.meta.dir, "hooks");
  const proc = Bun.spawn(["bun", "run", "tsc", "--noEmit"], {
    cwd: hooksDir,
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error(`Type checking failed with exit code ${exitCode}`);
  }
  console.log("✓ Type checking passed");
}

/**
 * Main build process
 */
async function main(): Promise<void> {
  try {
    console.log("🏗️  Starting build process...\n");

    // Step 1: Type check (optional - skip if TS errors exist)
    const skipTypeCheck = process.argv.includes("--skip-typecheck");
    if (!skipTypeCheck) {
      try {
        await typeCheck();
      } catch (error) {
        console.warn("⚠️  Type checking failed, continuing with build...");
        console.warn(error instanceof Error ? error.message : String(error));
      }
    }

    // Step 2: Clean dist directory
    cleanDist();

    // Step 3: Create dist structure
    createDistStructure();

    // Step 4: Build all handlers
    console.log("\n📦 Building handlers...");
    await buildAllHandlers();

    // Step 5: Build viewer
    console.log("\n📦 Building viewer...");
    await buildViewer();

    console.log("\n✅ Build completed successfully!");
  } catch (error) {
    console.error("\n❌ Build failed:");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
