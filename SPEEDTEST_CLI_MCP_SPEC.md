# Speed Test CLI & MCP Server - Spec

## Overview

Extend the Speed Test App with two new interfaces:

1. **CLI Tool** (`speedtest-cli`) - Run speed tests from terminal
2. **MCP Server** (`speedtest-mcp`) - Expose speed test capabilities to AI assistants

Both share the same core measurement engine (Cloudflare's `@cloudflare/speedtest`) and localStorage-compatible result storage.

---

## 1. CLI Extension (`speedtest-cli`)

### Purpose
Run speed tests from the command line with flexible output formats, ideal for automation, CI/CD pipelines, and quick terminal checks.

### Installation
```bash
npm install -g speedtest-cli
# or
npx speedtest-cli
```

### Commands

#### `speedtest run`
Run a full speed test (download, upload, ping, jitter).

```bash
speedtest run
speedtest run --format json
speedtest run --format csv
speedtest run --format table
speedtest run --only download
speedtest run --only upload
speedtest run --only ping
speedtest run --duration 5        # seconds per phase
speedtest run --connections 4     # parallel connections
speedtest run --output results.json  # save to file
```

**Output formats:**

**Table (default):**
```
┌─────────────┬──────────┐
│ Metric      │ Value    │
├─────────────┼──────────┤
│ Download    │ 245.3 Mbps │
│ Upload      │ 89.7 Mbps  │
│ Ping        │ 12.4 ms    │
│ Jitter      │ 2.1 ms     │
│ Timestamp   │ 2026-04-01 │
└─────────────┴──────────┘
```

**JSON:**
```json
{
  "download": 245.3,
  "upload": 89.7,
  "ping": 12.4,
  "jitter": 2.1,
  "timestamp": "2026-04-01T10:30:00Z",
  "unit": {
    "download": "Mbps",
    "upload": "Mbps",
    "ping": "ms",
    "jitter": "ms"
  }
}
```

**CSV:**
```csv
timestamp,download_mbps,upload_mbps,ping_ms,jitter_ms
2026-04-01T10:30:00Z,245.3,89.7,12.4,2.1
```

#### `speedtest history`
View saved test results.

```bash
speedtest history
speedtest history --limit 10
speedtest history --format json
speedtest history --export results.csv
```

#### `speedtest compare`
Compare current test with previous results.

```bash
speedtest compare
speedtest compare --last 5
speedtest compare --format json
```

**Output:**
```
┌──────────┬──────────┬──────────┬──────────┐
│ Metric   │ Current  │ Average  │ Change   │
├──────────┼──────────┼──────────┼──────────┤
│ Download │ 245.3    │ 230.1    │ +6.6% ↑  │
│ Upload   │ 89.7     │ 92.4     │ -2.9% ↓  │
│ Ping     │ 12.4     │ 14.2     │ -12.7% ↑ │
└──────────┴──────────┴──────────┴──────────┘
```

#### `speedtest monitor`
Continuous monitoring mode.

```bash
speedtest monitor --interval 300    # every 5 minutes
speedtest monitor --interval 3600   # every hour
speedtest monitor --output log.jsonl
speedtest monitor --alert "download < 50"  # alert threshold
```

#### `speedtest info`
Show connection info.

```bash
speedtest info
```

**Output:**
```
IP:        192.168.1.100
ISP:       Cloudflare Inc.
City:      San Francisco
Region:    California
Country:   United States
Coords:    37.77, -122.42
```

### Architecture

```
speedtest-cli/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── commands/
│   │   ├── run.ts            # Run speed test
│   │   ├── history.ts        # View history
│   │   ├── compare.ts        # Compare results
│   │   ├── monitor.ts        # Continuous monitoring
│   │   └── info.ts           # Connection info
│   ├── formatters/
│   │   ├── table.ts          # Table output
│   │   ├── json.ts           # JSON output
│   │   └── csv.ts            # CSV output
│   ├── storage/
│   │   └── local.ts          # File-based storage
│   └── engine/
│       └── cloudflare.ts     # Cloudflare speedtest wrapper
├── package.json
└── tsconfig.json
```

### Dependencies
- `commander` - CLI framework
- `@cloudflare/speedtest` - Measurement engine
- `cli-table3` - Table output
- `chalk` - Colored output
- `ora` - Spinner for progress
- `node-fetch` - HTTP requests (Node.js)

### Storage
- Uses JSON file at `~/.speedtest-cli/results.json`
- Max 1000 results (configurable)
- Auto-pruning of old results

---

## 2. MCP Server (`speedtest-mcp`)

### Purpose
Expose speed test capabilities as Model Context Protocol (MCP) tools, allowing AI assistants (Claude, Cursor, etc.) to run speed tests, check history, and monitor connections.

### Installation
```bash
npm install -g speedtest-mcp
```

### MCP Configuration
Add to your MCP client config (e.g., Claude Desktop, Cursor):

```json
{
  "mcpServers": {
    "speedtest": {
      "command": "speedtest-mcp",
      "args": []
    }
  }
}
```

### Tools

#### `run_speed_test`
Run a speed test and return results.

**Parameters:**
```json
{
  "type": "object",
  "properties": {
    "duration": {
      "type": "number",
      "description": "Test duration in seconds per phase (default: 10)",
      "default": 10
    },
    "phases": {
      "type": "array",
      "items": { "type": "string", "enum": ["download", "upload", "ping"] },
      "description": "Which phases to run (default: all)"
    }
  }
}
```

**Returns:**
```json
{
  "download": 245.3,
  "upload": 89.7,
  "ping": 12.4,
  "jitter": 2.1,
  "timestamp": "2026-04-01T10:30:00Z",
  "summary": "Download: 245.3 Mbps, Upload: 89.7 Mbps, Ping: 12.4 ms"
}
```

#### `get_history`
Retrieve speed test history.

**Parameters:**
```json
{
  "type": "object",
  "properties": {
    "limit": {
      "type": "number",
      "description": "Number of results to return (default: 10)",
      "default": 10
    },
    "days": {
      "type": "number",
      "description": "Only include results from last N days"
    }
  }
}
```

**Returns:**
```json
{
  "results": [
    {
      "timestamp": "2026-04-01T10:30:00Z",
      "download": 245.3,
      "upload": 89.7,
      "ping": 12.4,
      "jitter": 2.1
    }
  ],
  "count": 1,
  "average": {
    "download": 245.3,
    "upload": 89.7,
    "ping": 12.4
  }
}
```

#### `get_connection_info`
Get current connection information.

**Parameters:** None

**Returns:**
```json
{
  "ip": "192.168.1.100",
  "isp": "Cloudflare Inc.",
  "city": "San Francisco",
  "region": "California",
  "country": "United States",
  "latitude": 37.77,
  "longitude": -122.42
}
```

#### `compare_results`
Compare current test with historical average.

**Parameters:**
```json
{
  "type": "object",
  "properties": {
    "last_n": {
      "type": "number",
      "description": "Compare against last N tests (default: 5)",
      "default": 5
    }
  }
}
```

**Returns:**
```json
{
  "current": { "download": 245.3, "upload": 89.7, "ping": 12.4 },
  "average": { "download": 230.1, "upload": 92.4, "ping": 14.2 },
  "change": {
    "download": "+6.6%",
    "upload": "-2.9%",
    "ping": "-12.7%"
  },
  "summary": "Download improved 6.6%, upload decreased 2.9%, ping improved 12.7%"
}
```

### Architecture

```
speedtest-mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── server.ts             # MCP server setup
│   ├── tools/
│   │   ├── run_speed_test.ts
│   │   ├── get_history.ts
│   │   ├── get_connection_info.ts
│   │   └── compare_results.ts
│   ├── engine/
│   │   └── cloudflare.ts     # Shared with CLI
│   └── storage/
│       └── local.ts          # Shared with CLI
├── package.json
└── tsconfig.json
```

### Dependencies
- `@modelcontextprotocol/sdk` - MCP SDK
- `@cloudflare/speedtest` - Measurement engine
- `zod` - Parameter validation

---

## 3. Shared Package (`speedtest-core`)

### Purpose
Extract shared logic into a reusable package used by CLI, MCP server, and web app.

### Exports
```typescript
// Engine
export { runSpeedTest, type SpeedTestResult } from './engine';

// Storage
export { getResults, saveResult, deleteAllResults } from './storage';

// Connection Info
export { getConnectionInfo, type ConnectionInfo } from './info';

// Types
export type { SpeedTestResult, ConnectionInfo, TestPhase };
```

---

## 4. Implementation Plan

### Phase 1: Core Package (Week 1)
- [ ] Create `packages/core` with shared engine, storage, types
- [ ] Extract Cloudflare speedtest wrapper
- [ ] Create file-based storage adapter
- [ ] Write unit tests

### Phase 2: CLI Tool (Week 2)
- [ ] Create `packages/cli`
- [ ] Implement `run` command with all formats
- [ ] Implement `history` command
- [ ] Implement `compare` command
- [ ] Implement `monitor` command
- [ ] Implement `info` command
- [ ] Add progress spinner and colored output
- [ ] Write integration tests

### Phase 3: MCP Server (Week 3)
- [ ] Create `packages/server`
- [ ] Implement MCP server with 4 tools
- [ ] Add parameter validation with Zod
- [ ] Write MCP compliance tests
- [ ] Test with Claude Desktop / Cursor

### Phase 4: Integration & Docs (Week 4)
- [ ] Set up monorepo with Turborepo
- [ ] Update web app to use `@speedtest/core`
- [ ] Write README for each package
- [ ] Publish to npm
- [ ] Create example configurations

---

## 5. Monorepo Structure

```
speed-test-app/
├── packages/
│   ├── core/          # Shared engine, storage, types
│   ├── cli/           # CLI tool
│   └── server/        # MCP server
├── src/               # Web app (existing)
├── turbo.json         # Turborepo config
├── package.json       # Root package
└── ...
```

---

## 6. Key Design Decisions

### Why Cloudflare's engine?
- Industry-standard accuracy
- Uses PerformanceResourceTiming API
- Already integrated and tested
- Maintained by Cloudflare

### Why file-based storage for CLI/MCP?
- No database dependency
- Works offline
- Easy to backup/export
- Cross-platform compatible

### Why monorepo?
- Shared code between CLI, MCP, and web
- Single source of truth for measurement logic
- Easier to maintain and test
- Consistent versioning

---

## 7. Open Questions for Discussion

1. **Should the CLI use the web app's API routes** or connect directly to Cloudflare's edge?
   - Direct to Cloudflare is faster and doesn't require running the web app

2. **Should we support multiple storage backends?**
   - Start with file-based, add SQLite/PostgreSQL later if needed

3. **Should the MCP server support streaming results?**
   - Yes, for real-time progress updates during long tests

4. **Should we package as a single binary?**
   - Consider `pkg` or `nexe` for zero-dependency distribution

5. **Should the CLI support authentication for private instances?**
   - Add `--api-url` flag to point to custom speed test server

---

## 8. Success Criteria

- [ ] CLI can run a speed test and output in 3 formats
- [ ] CLI history command shows saved results
- [ ] MCP server exposes 4 tools with proper schemas
- [ ] MCP tools work with Claude Desktop / Cursor
- [ ] All packages pass tests and linting
- [ ] Published to npm with proper documentation
- [ ] Web app uses shared core package
