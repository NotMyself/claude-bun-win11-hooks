import { PATHS, WATCHER_CONFIG } from "./config";
import type { LogEntry } from "./types";

type EntryCallback = (entry: LogEntry) => void;

export class LogFileWatcher {
  private lastSize = 0;
  private interval: Timer | null = null;
  private subscribers: Set<EntryCallback> = new Set();

  /**
   * Start watching the log file for changes
   */
  start(): void {
    if (this.interval) return;

    // Initialize with current file size
    this.lastSize = this.getFileSize();

    this.interval = setInterval(() => {
      this.checkForChanges();
    }, WATCHER_CONFIG.POLL_INTERVAL);
  }

  /**
   * Stop watching the log file
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * Subscribe to new log entries
   */
  subscribe(callback: EntryCallback): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Get all existing entries from the log file
   */
  getAllEntries(): LogEntry[] {
    try {
      const file = Bun.file(PATHS.LOG_FILE);
      if (!file.size) return [];

      const content = require("fs").readFileSync(PATHS.LOG_FILE, "utf-8");
      return this.parseLines(content);
    } catch {
      // File doesn't exist or can't be read
      return [];
    }
  }

  private getFileSize(): number {
    try {
      const file = Bun.file(PATHS.LOG_FILE);
      return file.size;
    } catch {
      return 0;
    }
  }

  private checkForChanges(): void {
    const currentSize = this.getFileSize();

    if (currentSize > this.lastSize) {
      // Read only the new content
      try {
        const file = Bun.file(PATHS.LOG_FILE);
        const slice = file.slice(this.lastSize, currentSize);
        slice.text().then((content) => {
          const entries = this.parseLines(content);
          for (const entry of entries) {
            this.emit(entry);
          }
        });
      } catch (error) {
        console.error("Error reading log file:", error);
      }

      this.lastSize = currentSize;
    } else if (currentSize < this.lastSize) {
      // File was truncated/reset, start from beginning
      this.lastSize = currentSize;
    }
  }

  private parseLines(content: string): LogEntry[] {
    const entries: LogEntry[] = [];
    const lines = content.split("\n").filter((line) => line.trim());

    for (const line of lines) {
      try {
        const entry = JSON.parse(line) as LogEntry;
        entries.push(entry);
      } catch {
        // Skip invalid JSON lines
      }
    }

    return entries;
  }

  private emit(entry: LogEntry): void {
    for (const callback of this.subscribers) {
      try {
        callback(entry);
      } catch (error) {
        console.error("Subscriber error:", error);
      }
    }
  }
}
