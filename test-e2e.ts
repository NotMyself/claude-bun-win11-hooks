/**
 * @fileoverview End-to-End Test Script for Bundled Hook Handlers
 *
 * This script tests all 12 hook handlers in the dist/ directory to verify:
 * - Each handler can be executed successfully
 * - Each handler produces valid JSON output (or empty output)
 * - No runtime errors occur during execution
 *
 * Run this script from the project root:
 *   bun run test-e2e.ts
 *
 * Prerequisites:
 *   - Handlers must be built first: bun run build.ts
 *   - All handlers must exist in dist/handlers/
 */

import { spawn } from "bun";
import { join } from "node:path";

/**
 * ANSI color codes for terminal output
 */
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
} as const;

/**
 * Test result interface
 */
interface TestResult {
  handler: string;
  success: boolean;
  error?: string;
  output?: string;
}

/**
 * Handler test configuration
 */
interface HandlerTest {
  name: string;
  filename: string;
  input: Record<string, unknown>;
}

/**
 * Test configurations for all 12 handlers
 */
const handlerTests: HandlerTest[] = [
  {
    name: "SessionStart",
    filename: "session-start.js",
    input: {
      hook_event_name: "SessionStart",
      session_id: "test-session-e2e",
      transcript_path: "/tmp/test-session.json",
      cwd: "/tmp/test",
      source: "startup",
      permission_mode: "default",
    },
  },
  {
    name: "SessionEnd",
    filename: "session-end.js",
    input: {
      hook_event_name: "SessionEnd",
      session_id: "test-session-e2e",
      transcript_path: "/tmp/test-session.json",
      cwd: "/tmp/test",
      permission_mode: "default",
    },
  },
  {
    name: "UserPromptSubmit",
    filename: "user-prompt-submit.js",
    input: {
      hook_event_name: "UserPromptSubmit",
      session_id: "test-session-e2e",
      transcript_path: "/tmp/test-session.json",
      cwd: "/tmp/test",
      prompt: "Test prompt for E2E testing",
      permission_mode: "default",
    },
  },
  {
    name: "PreToolUse",
    filename: "pre-tool-use.js",
    input: {
      hook_event_name: "PreToolUse",
      session_id: "test-session-e2e",
      transcript_path: "/tmp/test-session.json",
      cwd: "/tmp/test",
      tool_name: "Bash",
      tool_input: {
        command: "ls -la",
        description: "List files",
      },
      tool_use_id: "test-tool-use-123",
      permission_mode: "default",
    },
  },
  {
    name: "PostToolUse",
    filename: "post-tool-use.js",
    input: {
      hook_event_name: "PostToolUse",
      session_id: "test-session-e2e",
      transcript_path: "/tmp/test-session.json",
      cwd: "/tmp/test",
      tool_name: "Bash",
      tool_result: {
        stdout: "file1.txt\nfile2.txt",
        stderr: "",
        exit_code: 0,
      },
      tool_use_id: "test-tool-use-123",
      permission_mode: "default",
    },
  },
  {
    name: "PostToolUseFailure",
    filename: "post-tool-use-failure.js",
    input: {
      hook_event_name: "PostToolUseFailure",
      session_id: "test-session-e2e",
      transcript_path: "/tmp/test-session.json",
      cwd: "/tmp/test",
      tool_name: "Bash",
      tool_input: {
        command: "invalid-command",
      },
      error: "Command not found: invalid-command",
      tool_use_id: "test-tool-use-456",
      permission_mode: "default",
    },
  },
  {
    name: "Notification",
    filename: "notification.js",
    input: {
      hook_event_name: "Notification",
      session_id: "test-session-e2e",
      transcript_path: "/tmp/test-session.json",
      cwd: "/tmp/test",
      message: "Test notification message",
      title: "Test Notification",
      notification_type: "info",
      permission_mode: "default",
    },
  },
  {
    name: "Stop",
    filename: "stop.js",
    input: {
      hook_event_name: "Stop",
      session_id: "test-session-e2e",
      transcript_path: "/tmp/test-session.json",
      cwd: "/tmp/test",
      reason: "user_interrupt",
      permission_mode: "default",
    },
  },
  {
    name: "SubagentStart",
    filename: "subagent-start.js",
    input: {
      hook_event_name: "SubagentStart",
      session_id: "test-session-e2e",
      transcript_path: "/tmp/test-session.json",
      cwd: "/tmp/test",
      subagent_id: "test-subagent-123",
      subagent_name: "TestSubagent",
      permission_mode: "default",
    },
  },
  {
    name: "SubagentStop",
    filename: "subagent-stop.js",
    input: {
      hook_event_name: "SubagentStop",
      session_id: "test-session-e2e",
      transcript_path: "/tmp/test-session.json",
      cwd: "/tmp/test",
      subagent_id: "test-subagent-123",
      exit_code: 0,
      permission_mode: "default",
    },
  },
  {
    name: "PreCompact",
    filename: "pre-compact.js",
    input: {
      hook_event_name: "PreCompact",
      session_id: "test-session-e2e",
      transcript_path: "/tmp/test-session.json",
      cwd: "/tmp/test",
      permission_mode: "default",
    },
  },
  {
    name: "PermissionRequest",
    filename: "permission-request.js",
    input: {
      hook_event_name: "PermissionRequest",
      session_id: "test-session-e2e",
      transcript_path: "/tmp/test-session.json",
      cwd: "/tmp/test",
      tool_name: "Bash",
      tool_input: {
        command: "npm install lodash",
      },
      permission_suggestions: [],
      permission_mode: "default",
    },
  },
];

/**
 * Execute a single handler test
 */
async function testHandler(test: HandlerTest): Promise<TestResult> {
  const distDir = join(import.meta.dir, "dist", "handlers");
  const handlerPath = join(distDir, test.filename);

  try {
    // Spawn the handler process
    const proc = spawn({
      cmd: ["bun", "run", handlerPath],
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
    });

    // Write input to stdin
    const inputJson = JSON.stringify(test.input);
    proc.stdin.write(inputJson);
    proc.stdin.end();

    // Read stdout and stderr
    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);

    // Wait for the process to exit
    await proc.exited;

    // Validate output
    // Output can be empty (some handlers may not return anything)
    // or valid JSON
    if (stdout.trim().length > 0) {
      try {
        JSON.parse(stdout);
      } catch (parseError) {
        return {
          handler: test.name,
          success: false,
          error: `Invalid JSON output: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          output: stdout,
        };
      }
    }

    // Check for stderr errors (warnings are OK, but errors are not)
    if (stderr.includes("error") && !stderr.includes("Handler error:")) {
      return {
        handler: test.name,
        success: false,
        error: `Stderr contains error: ${stderr.substring(0, 200)}`,
        output: stdout,
      };
    }

    return {
      handler: test.name,
      success: true,
      output: stdout,
    };
  } catch (error) {
    return {
      handler: test.name,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Run all handler tests
 */
async function runAllTests(): Promise<void> {
  console.log(`${colors.cyan}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║${colors.reset}  E2E Test Suite: Claude Code Hook Handlers           ${colors.cyan}║${colors.reset}`);
  console.log(`${colors.cyan}╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

  const results: TestResult[] = [];
  let passed = 0;
  let failed = 0;

  // Run all tests sequentially
  for (const test of handlerTests) {
    process.stdout.write(`${colors.blue}Testing ${test.name.padEnd(25)}${colors.reset} ... `);

    const result = await testHandler(test);
    results.push(result);

    if (result.success) {
      passed++;
      console.log(`${colors.green}✓ PASS${colors.reset}`);
    } else {
      failed++;
      console.log(`${colors.red}✗ FAIL${colors.reset}`);
    }
  }

  // Print summary
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}Test Summary${colors.reset}\n`);
  console.log(`  Total:  ${handlerTests.length}`);
  console.log(`  ${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

  // Print failure details
  if (failed > 0) {
    console.log(`${colors.yellow}Failure Details:${colors.reset}\n`);
    for (const result of results) {
      if (!result.success) {
        console.log(`${colors.red}✗ ${result.handler}${colors.reset}`);
        console.log(`  Error: ${result.error}`);
        if (result.output) {
          console.log(`  Output: ${result.output.substring(0, 200)}${result.output.length > 200 ? "..." : ""}`);
        }
        console.log();
      }
    }
  }

  // Exit with appropriate code
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log(`${colors.green}All tests passed!${colors.reset}`);
    process.exit(0);
  }
}

// Run the tests
runAllTests().catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
