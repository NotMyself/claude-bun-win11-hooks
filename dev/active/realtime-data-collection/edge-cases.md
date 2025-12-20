# Edge Cases

| ID | Case | Handling | Affected Features |
|----|------|----------|-------------------|
| EC001 | SQLite database file locked by another process | Implement retry logic with exponential backoff (100ms, 200ms, 400ms, max 5 retries), log warning if all retries fail, queue writes in memory until lock releases | F004, F007 |
| EC002 | Malformed transcript JSONL entry (invalid JSON or missing required fields) | Skip the malformed entry with detailed warning log including line number and file path, continue processing remaining entries, increment error counter metric | F008 |
| EC003 | Missing model pricing data for unknown/new model | Use fallback pricing based on model tier heuristics (opus → highest tier, sonnet → mid tier, haiku → low tier), log warning about missing pricing, add metric tag 'estimated_pricing' | F009 |
| EC004 | High volume metric writes causing performance degradation | Implement batching: collect metrics in memory buffer (max 100 entries or 5 seconds), flush batch to database in single transaction, use PRAGMA statements for write optimization | F004, F007 |
| EC005 | Concurrent SSE connections exceeding safe limits | Rate limit SSE connections to 5 per IP per 60-second window (existing security pattern), return 429 status with Retry-After header when limit exceeded | F023 |
| EC006 | fs.watch unreliable on Windows network drives or mapped drives | Detect watch failures (no events for >60s on active session), automatically fall back to polling mode (30s interval), log fallback activation, prefer fs.watch when available | F008 |
| EC007 | Transcript file deleted or moved during active parsing | Wrap file reads in try/catch, handle ENOENT gracefully, skip to next file, log file disappearance with session ID, remove from watch list to prevent repeated errors | F008 |
| EC008 | Session transcript file renamed during watch (e.g., active → completed) | Handle fs.watch rename events, re-scan directory to pick up renamed files, maintain session ID mapping to handle renames transparently, avoid duplicate metric entries | F008 |
