/**
 * Service for reading and summarizing Claude Code sessions from ~/.claude/projects/
 * Inspired by cc-summarize (https://github.com/shcv/cc-summarize)
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import { PATHS } from "./config";
import type { ClaudeSessionSummary, SessionSummariesResponse } from "./types";

/**
 * Raw message from Claude Code JSONL session file
 */
interface RawMessage {
  type: string;
  uuid?: string;
  timestamp?: string;
  sessionId?: string;
  message?: {
    content?: string | Array<{ type: string; text?: string }>;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_read_input_tokens?: number;
      cache_creation_input_tokens?: number;
    };
  };
  summary?: string;
}

/**
 * Service for reading Claude Code session summaries
 */
export class SessionSummaryService {
  private claudeProjectsDir: string;

  constructor() {
    this.claudeProjectsDir = join(PATHS.CLAUDE_HOME, "projects");
  }

  /**
   * Get all session summaries, optionally filtered by project
   */
  async getSummaries(projectFilter?: string): Promise<SessionSummariesResponse> {
    const projects = this.listProjects();
    const summaries: ClaudeSessionSummary[] = [];

    // Get current working directory as default project
    const cwd = process.cwd();
    const currentProject = this.pathToProjectName(cwd);

    // If a project filter is specified, only process that project
    const projectsToProcess = projectFilter
      ? projects.filter((p) => p === projectFilter || p.includes(projectFilter))
      : projects;

    for (const project of projectsToProcess) {
      const projectSummaries = await this.getProjectSessions(project);
      summaries.push(...projectSummaries);
    }

    // Sort by last activity, most recent first
    summaries.sort((a, b) => {
      const dateA = new Date(a.last_activity).getTime();
      const dateB = new Date(b.last_activity).getTime();
      return dateB - dateA;
    });

    return {
      summaries,
      projects,
      current_project: currentProject,
      last_updated: new Date().toISOString(),
    };
  }

  /**
   * List all project directories in ~/.claude/projects/
   */
  private listProjects(): string[] {
    if (!existsSync(this.claudeProjectsDir)) {
      return [];
    }

    try {
      return readdirSync(this.claudeProjectsDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)
        .sort();
    } catch {
      return [];
    }
  }

  /**
   * Convert a project directory name to a readable path
   * Example: -home-user-projects-my-app -> /home/user/projects/my-app
   */
  private projectNameToPath(projectName: string): string {
    // Replace leading dash and convert remaining dashes to slashes
    if (projectName.startsWith("-")) {
      return projectName.replace(/-/g, "/");
    }
    return projectName;
  }

  /**
   * Convert a path to Claude's hyphenated project name
   * Example: /home/user/projects/my-app -> -home-user-projects-my-app
   */
  private pathToProjectName(path: string): string {
    return path.replace(/\//g, "-");
  }

  /**
   * Get all sessions for a specific project
   */
  private async getProjectSessions(
    projectName: string
  ): Promise<ClaudeSessionSummary[]> {
    const projectDir = join(this.claudeProjectsDir, projectName);
    if (!existsSync(projectDir)) {
      return [];
    }

    const summaries: ClaudeSessionSummary[] = [];

    try {
      const files = readdirSync(projectDir).filter(
        (f) => f.endsWith(".jsonl") && !f.startsWith("agent-")
      );

      for (const file of files) {
        const filePath = join(projectDir, file);
        const summary = await this.parseSessionFile(filePath, projectName);
        if (summary) {
          summaries.push(summary);
        }
      }
    } catch (err) {
      console.debug(`[SessionSummaryService] Error reading project ${projectName}:`, err);
    }

    return summaries;
  }

  /**
   * Parse a session JSONL file and extract summary information
   */
  private async parseSessionFile(
    filePath: string,
    projectName: string
  ): Promise<ClaudeSessionSummary | null> {
    try {
      const stat = statSync(filePath);
      const content = readFileSync(filePath, "utf-8");
      const lines = content.trim().split("\n").filter(Boolean);

      if (lines.length === 0) {
        return null;
      }

      const sessionId = basename(filePath, ".jsonl");
      let description = "";
      let firstActivity: string | null = null;
      let lastActivity: string | null = null;
      let messageCount = 0;
      let turnCount = 0;
      let totalTokens = 0;

      for (const line of lines) {
        try {
          const msg: RawMessage = JSON.parse(line);
          messageCount++;

          // Track timestamps
          if (msg.timestamp) {
            if (!firstActivity) {
              firstActivity = msg.timestamp;
            }
            lastActivity = msg.timestamp;
          }

          // Extract description from first user message
          if (!description && msg.type === "user") {
            description = this.extractUserContent(msg);
          }

          // Count turns (user messages that aren't tool responses)
          if (msg.type === "user" && !this.isToolResponse(msg)) {
            turnCount++;
          }

          // Sum token usage from assistant messages
          if (msg.type === "assistant" && msg.message?.usage) {
            const usage = msg.message.usage;
            totalTokens +=
              (usage.input_tokens || 0) +
              (usage.output_tokens || 0) +
              (usage.cache_read_input_tokens || 0) +
              (usage.cache_creation_input_tokens || 0);
          }

          // Use session summary if available
          if (msg.type === "summary" && msg.summary && !description) {
            description = msg.summary;
          }
        } catch {
          // Skip invalid JSON lines
        }
      }

      // Skip empty sessions
      if (!description || turnCount === 0) {
        return null;
      }

      return {
        session_id: sessionId,
        project_path: this.projectNameToPath(projectName),
        project_name: projectName,
        description: this.truncateDescription(description),
        message_count: messageCount,
        turn_count: turnCount,
        last_activity: lastActivity || new Date().toISOString(),
        first_activity: firstActivity || new Date().toISOString(),
        total_tokens: totalTokens,
        file_size: stat.size,
      };
    } catch (err) {
      console.debug(`[SessionSummaryService] Error parsing ${filePath}:`, err);
      return null;
    }
  }

  /**
   * Extract text content from a user message
   */
  private extractUserContent(msg: RawMessage): string {
    const content = msg.message?.content;

    if (typeof content === "string") {
      return this.cleanContent(content);
    }

    if (Array.isArray(content)) {
      for (const item of content) {
        if (item.type === "text" && item.text) {
          return this.cleanContent(item.text);
        }
      }
    }

    return "";
  }

  /**
   * Clean up content by removing noise
   */
  private cleanContent(content: string): string {
    // Skip command/system messages
    if (
      content.startsWith("<command-") ||
      content.startsWith("<local-command-") ||
      content.includes("command-message") ||
      content.trim() === "Warmup" ||
      content.toLowerCase().includes("caveat:") ||
      content.toLowerCase().startsWith("this session is being continued")
    ) {
      return "";
    }

    // Clean up whitespace
    return content.replace(/\s+/g, " ").trim();
  }

  /**
   * Check if a user message is actually a tool response
   */
  private isToolResponse(msg: RawMessage): boolean {
    const content = msg.message?.content;
    if (Array.isArray(content) && content.length > 0) {
      const first = content[0];
      if (typeof first === "object" && first.type === "tool_result") {
        return true;
      }
    }
    return false;
  }

  /**
   * Truncate description to a reasonable length
   */
  private truncateDescription(description: string, maxLength = 200): string {
    if (description.length <= maxLength) {
      return description;
    }
    return description.slice(0, maxLength - 3) + "...";
  }
}
