#!/usr/bin/env bun
/**
 * version-check.ts
 * Cross-platform version validation script for Windows/macOS/Linux
 * Validates version consistency across plugin.json, package.json, and CHANGELOG.md
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const projectRoot = join(import.meta.dir, "..");

try {
  // Read versions from files
  const pluginJson = JSON.parse(
    readFileSync(join(projectRoot, ".claude-plugin", "plugin.json"), "utf-8")
  );
  const packageJson = JSON.parse(
    readFileSync(join(projectRoot, "hooks", "package.json"), "utf-8")
  );
  const changelog = readFileSync(
    join(projectRoot, "CHANGELOG.md"),
    "utf-8"
  );

  const pluginVersion = pluginJson.version;
  const packageVersion = packageJson.version;

  // Extract first version from CHANGELOG (format: ## [1.0.0] - 2024-12-14)
  // Skip "Unreleased" section by looking for version pattern with date
  const versionMatch = changelog.match(/##\s*\[([^\]]+)\]\s*-\s*\d{4}-\d{2}-\d{2}/);
  const changelogVersion = versionMatch ? versionMatch[1] : null;

  console.log("Versions found:");
  console.log(`  plugin.json:  ${pluginVersion}`);
  console.log(`  package.json: ${packageVersion}`);
  console.log(`  CHANGELOG.md: ${changelogVersion}`);

  if (
    pluginVersion === packageVersion &&
    pluginVersion === changelogVersion
  ) {
    console.log(`✓ All versions match: ${pluginVersion}`);
    process.exit(0);
  } else {
    console.log("✗ Version mismatch detected");
    process.exit(1);
  }
} catch (error) {
  console.error("Error checking versions:", error);
  process.exit(1);
}
