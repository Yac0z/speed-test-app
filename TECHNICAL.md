# Speed Test App - Technical Documentation

## Architecture Overview

A full-stack internet speed test application built with **Next.js 16** (App Router, Turbopack), deployed on **Vercel**. The app measures download speed, upload speed, ping latency, and jitter using parallel HTTP connections to server-side endpoints.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.1 (App Router, Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL via Drizzle ORM |
| Deployment | Vercel (Serverless Functions + Edge Middleware) |
| Analytics | Vercel Analytics |
| i18n | next-intl (English, French) |
| Testing | Vitest (unit), Playwright (e2e) |
| Linting | Ultracite (Oxlint + Prettier) |

### Project Structure

```
speed-test-app/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── [locale]/                 # i18n route group
│   │   │   ├── (marketing)/          # Public pages
│   │   │   │   ├── page.tsx          # Speed test dashboard
│   │   │   │   ├── history/          # Test history page
│   │   │   │   ├── servers/          # Server selection
│   │   │   │   ├── settings/         # User preferences
│   │   │   │   ├── about/            # About page
│   │   │   │   └── api/              # Speed test API routes
│   │   │   │       ├── speed/
│   │   │   │       │   ├── download/ # Download endpoint
│   │   │   │       │   ├── upload/   # Upload endpoint
│   │   │   │       │   └── ping/     # Ping endpoint
│   │   │   │       └── results/      # CRUD for test results
│   │   │   └── layout.tsx            # Root layout + Analytics
│   │   ├── sitemap.ts                # Dynamic sitemap
│   │   └── robots.ts                 # Robots.txt
│   ├── components/
│   │   ├── speed-test/
│   │   │   ├── SpeedTestDashboard.tsx  # Main orchestrator
│   │   │   ├── SpeedGauge.tsx          # SVG gauge visualization
│   │   │   ├── TestResults.tsx         # Results cards
│   │   │   └── ISPInfo.tsx             # ISP detection widget
│   │   ├── history/
│   │   │   ├── HistoryPage.tsx         # History UI
│   │   │   ├── SpeedChart.tsx          # TradingView chart
│   │   │   ├── StatsSummary.tsx        # Avg/min/max/median
│   │   │   ├── ExportButton.tsx        # CSV export
│   │   │   └── DateFilter.tsx          # Date range picker
│   │   ├── servers/ServersPage.tsx     # Server list + latency test
│   │   ├── share/ShareModal.tsx        # Share results (PNG/text/URL)
│   │   └── LocaleSwitcher.tsx          # Language selector
│   ├── hooks/
│   │   └── useSpeedTest.ts             # Core speed test logic
│   ├── libs/
│   │   ├── Env.ts                      # Environment validation (Zod)
│   │   ├── I18n.ts                     # next-intl config
│   │   ├── I18nRouting.ts              # Locale routing config
│   │   ├── Logger.ts                   # Structured logging
│   │   └── Arcjet.ts                   # Bot protection
│   ├── locales/                        # Translation files
│   │   ├── en.json
│   │   └── fr.json
│   ├── models/
│   │   └── Schema.ts                   # Drizzle database schema
│   ├── templates/
│   │   └── BaseTemplate.tsx            # Page layout wrapper
│   ├── utils/
│   │   ├── AppConfig.ts                # App configuration
│   │   ├── DBConnection.ts             # PostgreSQL pool
│   │   └── Helpers.ts                  # Utility functions
│   ├── proxy.ts                        # Edge middleware (i18n + Arcjet)
│   ├── instrumentation.ts              # Sentry server-side setup
│   └── instrumentation-client.ts       # Sentry client-side setup
├── tests/
│   ├── e2e/                            # Playwright e2e tests
│   └── integration/                    # Integration tests
├── drizzle/                            # Database migrations
├── vercel.json                         # Vercel deployment config
├── next.config.ts                      # Next.js configuration
└── package.json
```

---

## Speed Test Methodology

### Measurement Phases

The test runs sequentially through three phases:

```
Ping (20 samples) → Download (12s: 2s warmup + 10s measurement) → Upload (12s: 2s warmup + 10s measurement)
```

### Ping Test

**Method:** Sequential `HEAD` requests to `/api/speed/ping?t=<timestamp>-<index>`

- **Samples:** 20 sequential requests
- **Measurement:** `performance.now()` round-trip time per request
- **Ping result:** Arithmetic mean of all valid (non-zero) samples
- **Jitter result:** Mean absolute difference between consecutive valid samples
- **Progress:** 0-15% of total progress bar

```typescript
// Ping measurement
const start = performance.now();
await fetch(`/api/speed/ping?t=${Date.now()}-${i}`, {
  method: 'HEAD',
  cache: 'no-store',
});
const duration = performance.now() - start; // milliseconds

// Jitter calculation
jitter = mean(|sample[i] - sample[i-1]|) for consecutive valid samples
```

### Download Test

**Method:** Parallel streaming `GET` requests to `/api/speed/download?size=5242880`

- **Connections:** 6 parallel workers
- **Duration:** 12 seconds total (2s warmup + 10s measurement)
- **Chunk size:** 5MB per request
- **Streaming:** Uses `ReadableStream` via `response.body.getReader()` for real-time speed updates
- **Warmup:** First 2 seconds of data is discarded (TCP slow-start compensation)
- **Result:** 80th percentile of cumulative speed samples after warmup

```typescript
// Download streaming approach
const response = await fetch(`/api/speed/download?size=${DOWNLOAD_CHUNK_SIZE}`);
const reader = response.body.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  chunkBytes += value.length;
  const instantSpeed = (chunkBytes * 8) / (elapsedSeconds * 1_000_000);
  // Update gauge in real-time
  setState(prev => ({ ...prev, currentSpeed: instantSpeed }));
}
```

**Why streaming over blob?**
- `response.blob()` waits for the entire response before providing data → coarse, infrequent updates
- `ReadableStream` provides data as it arrives → smooth, real-time gauge animation
- Matches industry approach (Ookla, Fast.com use streaming)

### Upload Test

**Method:** Parallel `POST` requests to `/api/speed/upload`

- **Connections:** 6 parallel workers
- **Duration:** 12 seconds total (2s warmup + 10s measurement)
- **Chunk size:** 2MB per request (`Blob` of `ArrayBuffer`)
- **Warmup:** First 2 seconds discarded
- **Measurement:** Per-request timing (upload time = fetch round-trip)
- **Result:** 80th percentile of cumulative speed samples after warmup

```typescript
// Upload measurement
const fetchStart = performance.now();
await fetch('/api/speed/upload', {
  method: 'POST',
  body: new Blob([new ArrayBuffer(UPLOAD_CHUNK_SIZE)]),
});
const uploadTime = performance.now() - fetchStart;
const instantSpeed = (UPLOAD_CHUNK_SIZE * 8) / (uploadTime * 1_000_000);
```

### Result Calculation

**80th Percentile Method:**

```typescript
const sorted = [...samples].sort((a, b) => a - b);
const p80Index = Math.floor(sorted.length * 0.8);
return sorted[Math.min(p80Index, sorted.length - 1)];
```

This approach:
- Discards the slowest 20% (connection setup, GC pauses, network hiccups)
- Uses the 80th percentile value as the final result
- More stable than mean, more representative than median
- Matches Ookla's approach of discarding outliers

### Units

| Metric | Unit | Formula |
|--------|------|---------|
| Download | Mbps (megabits/sec) | `(bytes × 8) / (seconds × 1,000,000)` |
| Upload | Mbps (megabits/sec) | `(bytes × 8) / (seconds × 1,000,000)` |
| Ping | ms (milliseconds) | `performance.now()` delta |
| Jitter | ms (milliseconds) | Mean absolute deviation |

**Note:** Uses decimal megabits (1 Mbps = 1,000,000 bits/sec), not binary mebibits. This is the standard used by ISPs and speed test services.

---

## API Endpoints

### Download Endpoint

**`GET /api/speed/download?size=<bytes>`**

Generates a stream of random bytes for download speed testing.

```typescript
// Pre-generated 64KB random buffer (avoids per-request crypto overhead)
const BUFFER_SIZE = 64 * 1024;
const randomBuffer = new Uint8Array(BUFFER_SIZE);
crypto.getRandomValues(randomBuffer);

// Stream the buffer repeated to reach requested size
const body = new ReadableStream({
  start(controller) {
    let sent = 0;
    while (sent < size) {
      const remaining = size - sent;
      const chunkSize = Math.min(BUFFER_SIZE, remaining);
      controller.enqueue(randomBuffer.slice(0, chunkSize));
      sent += chunkSize;
    }
    controller.close();
  },
});
```

**Headers:**
- `Content-Type: application/octet-stream`
- `Content-Length: <size>`
- `Cache-Control: no-store, no-cache, must-revalidate`
- `Access-Control-Allow-Origin: *`

**Size limit:** 50 MB maximum

**Design decision:** Pre-generating a small random buffer (64KB) avoids the CPU bottleneck of calling `crypto.getRandomValues()` for large buffers on every request. The buffer is repeated via `ReadableStream` to produce the requested size. This ensures the server's CPU is never the bottleneck — only the network bandwidth limits throughput.

### Upload Endpoint

**`POST /api/speed/upload`**

Accepts and discards request body data. Forces the client to actually transmit data (not just headers).

```typescript
export async function POST(request: Request) {
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const reader = request.body?.getReader();
    if (reader) {
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }
    }
  }
  return NextResponse.json({ received: true });
}
```

### Ping Endpoint

**`GET|HEAD /api/speed/ping?t=<timestamp>`**

Minimal response for latency measurement.

```typescript
// HEAD request: empty body, just headers
// GET request: { timestamp: Date.now() }
```

### Results API

**`GET /api/results`** — Returns up to 100 recent test results

**`POST /api/results`** — Save a new test result

**`DELETE /api/results`** — Clear all results

---

## Database Schema

**ORM:** Drizzle ORM with PostgreSQL

### Tables

#### `speed_test_results`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` (PK) | Unique identifier |
| `timestamp` | `timestamp` | Test execution time |
| `downloadMbps` | `numeric(10,2)` | Download speed in Mbps |
| `uploadMbps` | `numeric(10,2)` | Upload speed in Mbps |
| `pingMs` | `numeric(10,2)` | Average ping in ms |
| `jitterMs` | `numeric(10,2)` | Jitter in ms |
| `serverName` | `varchar(255)` | Test server name |
| `serverLocation` | `varchar(255)` | Server location |
| `serverLat` | `numeric(10,6)` | Server latitude |
| `serverLng` | `numeric(10,6)` | Server longitude |
| `ispName` | `varchar(255)` | ISP name |
| `ipAddress` | `varchar(45)` | Client IP (IPv4/IPv6) |
| `samples` | `jsonb` | Raw speed samples array |

#### `user_preferences`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `uuid` (PK) | | Unique identifier |
| `theme` | `varchar(20)` | `'dark'` | UI theme preference |
| `defaultServerId` | `uuid` (FK) | `null` | Preferred test server |
| `testDuration` | `integer` | `10` | Test duration in seconds |
| `parallelConnections` | `integer` | `4` | Parallel connection count |
| `dataRetentionDays` | `integer` | `90` | Auto-delete old results |

#### `servers`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` (PK) | Unique identifier |
| `name` | `varchar(255)` | Server display name |
| `location` | `varchar(255)` | Server location |
| `url` | `varchar(500)` | Server base URL |
| `lat` | `numeric(10,6)` | Latitude |
| `lng` | `numeric(10,6)` | Longitude |
| `isActive` | `boolean` | Whether server is available |

---

## Speed Gauge Implementation

### Architecture

The gauge is a pure SVG component with CSS transitions for smooth animation. No canvas, no third-party charting libraries for the gauge itself.

### Visual Design

```
     ┌─────────────────────────────────┐
     │         Testing Download...     │  ← Phase label
     │                                 │
     │        ╭─────────────╮          │
     │      ╱                 ╲        │
     │    ╱     ██████████      ╲      │  ← Colored arc (red→yellow→green)
     │   │    ██  45.2  ██      │     │
     │    ╲     ██  Mbps  ██    ╱      │  ← Speed value + unit
     │      ╲_ _ _ _ _ _ _ _╱         │
     │      0              100        │  ← Scale labels
     │                                 │
     │  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰░░░░░░░░      │  ← Progress bar
     └─────────────────────────────────┘
```

### SVG Construction

- **ViewBox:** `0 0 200 120`
- **Arc path:** `M 20 100 A 80 80 0 0 1 180 100` (semicircle, radius 80)
- **Arc length:** π × 80 ≈ 251.2 pixels
- **Fill calculation:** `strokeDasharray = (angle / 180) × arcLength`
- **Animation:** CSS `transition-all duration-150` on `strokeDasharray`

### Auto-Scaling

The gauge max value adjusts dynamically based on current speed:

| Speed Range | Gauge Max |
|-------------|-----------|
| 0 Mbps | 100 Mbps |
| 0-10 Mbps | 10 Mbps |
| 10-25 Mbps | 25 Mbps |
| 25-50 Mbps | 50 Mbps |
| 50-100 Mbps | 100 Mbps |
| 100-250 Mbps | 250 Mbps |
| 250-500 Mbps | 500 Mbps |
| 500-1000 Mbps | 1000 Mbps |
| 1000+ Mbps | Next 1000× increment |

### Color Thresholds

| Percentage of Max | Color | Hex |
|-------------------|-------|-----|
| 0-30% | Red | `#ef4444` |
| 30-60% | Yellow | `#eab308` |
| 60-100% | Green | `#22c55e` |

### Unit Auto-Selection

| Speed | Display | Unit |
|-------|---------|------|
| < 1 Mbps | `850.0` | Kbps |
| 1-999 Mbps | `45.2` | Mbps |
| ≥ 1000 Mbps | `1.2` | Gbps |

### Real-Time Updates

The gauge receives speed updates from the `useSpeedTest` hook via React state. Because the download uses `ReadableStream` (not `blob()`), speed updates arrive continuously as data chunks are received — typically 10-50 times per second on a fast connection. The CSS `transition-all duration-150` smooths these updates into fluid needle movement.

---

## Deployment Configuration

### Vercel Setup

**`vercel.json`:**
```json
{
  "buildCommand": "next build",
  "env": {
    "NEXT_TELEMETRY_DISABLED": "1",
    "NEXT_PUBLIC_LOGGING_LEVEL": "info"
  }
}
```

**Build command:** `next build` (not `npm run build` which includes `db:migrate`)

**Why:** Database migrations cannot run during Vercel's build phase (no database access in build environment). Migrations should run at runtime or via a separate deployment step.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | Yes | Production domain |
| `NEXT_PUBLIC_LOGGING_LEVEL` | No | Log level (default: `info`) |
| `ARCJET_KEY` | No | Bot protection API key |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry error tracking |
| `SENTRY_AUTH_TOKEN` | No | Sentry source map upload |
| `SENTRY_ORGANIZATION` | No | Sentry org slug |
| `SENTRY_PROJECT` | No | Sentry project name |

### Middleware

**`src/proxy.ts`** — Edge middleware handling:

1. **Arcjet bot protection** — Blocks non-search-engine, non-monitoring bots
2. **i18n routing** — `next-intl` middleware for locale prefixing

```typescript
export const config = {
  matcher: '/((?!_next|_vercel|monitoring|.*\\..*).*)',
};
```

Excludes: `_next/*`, `_vercel/*`, `monitoring/*`, and files with extensions (static assets).

### Analytics

**Vercel Analytics** integrated via `@vercel/analytics/react`:

```tsx
import { Analytics } from '@vercel/analytics/react';

// In root layout
<Analytics />
```

Tracks page views automatically. No additional configuration needed.

---

## Performance Considerations

### Download Accuracy

**Problem solved:** The original implementation generated random bytes via `crypto.getRandomValues()` on every request. For a 10MB response, this allocated and filled a 10MB `Uint8Array` in server memory — making the server's CPU the bottleneck instead of the network.

**Solution:** Pre-generate a 64KB random buffer once at module load. Stream it repeatedly via `ReadableStream` to produce the requested size. The server now only copies pre-existing bytes — negligible CPU overhead.

### Upload Accuracy

**Problem solved:** The original implementation measured the total `fetch()` round-trip time, which includes TCP setup, TLS handshake, and response download — not just upload time.

**Solution:** Use per-request timing. Each `fetch()` POST with a fixed 2MB body measures the round-trip for that specific upload. With 6 parallel connections, the aggregate throughput is accurately measured.

### TCP Slow-Start

**Problem:** TCP starts at a low congestion window and ramps up. Measuring from the first byte underestimates speed, especially on high-latency connections.

**Solution:** 2-second warmup period before measurement begins. All data and samples from the warmup phase are discarded.

### Parallel Connections

**Why 6 connections?** Modern browsers limit concurrent connections per origin to 6 (HTTP/1.1) or multiplex many streams (HTTP/2). Using 6 connections:
- Saturates the available bandwidth
- Compensates for individual connection variability
- Matches the browser's connection limit per origin

### Result Stability

**Why 80th percentile?** Network speed fluctuates. Using the 80th percentile:
- Discards the slowest 20% (connection setup, GC pauses, network hiccups)
- More stable than mean (less affected by outliers)
- More representative than median (captures sustained throughput)
- Industry standard (Ookla uses similar percentile-based approach)

### Serverless Limitations

**Vercel serverless function limits:**
- Maximum response size: Unlimited (streaming supported)
- Maximum execution time: 10s (Hobby) / 60s (Pro) / 900s (Enterprise)
- Memory: 1024 MB (default)

**Mitigations:**
- Download endpoint streams data (no memory accumulation)
- Upload endpoint discards data immediately (no memory accumulation)
- 64KB pre-generated buffer fits well within memory limits
- Each speed test phase completes within time limits

---

## Security

### Bot Protection

**Arcjet** middleware blocks automated bots except:
- Search engine crawlers (`CATEGORY:SEARCH_ENGINE`)
- Preview link generators (`CATEGORY:PREVIEW`)
- Uptime monitors (`CATEGORY:MONITOR`)

### Rate Limiting

Not currently implemented on speed test endpoints. Consider adding rate limiting if abuse is detected.

### CORS

Download endpoint allows `Access-Control-Allow-Origin: *` for cross-origin requests. In production, restrict to your domain.

---

## Testing

### Unit Tests

**Framework:** Vitest with vitest-browser-react

**Location:** Co-located `*.test.ts` files

```bash
npm run test
```

### E2E Tests

**Framework:** Playwright

**Location:** `tests/e2e/`

```bash
npm run test:e2e
```

### Integration Tests

**Location:** `tests/integration/`

```bash
npm run test
```

---

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build:next` | Production build (Next.js only) |
| `npm run build` | Build with database migrations |
| `npm run lint` | Lint and format (Ultracite) |
| `npm run check:types` | TypeScript type checking |
| `npm run test` | Unit + integration tests |
| `npm run test:e2e` | Playwright e2e tests |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Drizzle Studio |

---

## Changelog

### Speed Test Accuracy Improvements (Current)

- **Download:** Switched from `crypto.getRandomValues()` per request to pre-generated 64KB buffer streamed via `ReadableStream`
- **Upload:** Per-request timing with fixed 2MB chunks
- **Streaming:** Real-time speed updates via `response.body.getReader()` instead of `response.blob()`
- **Warm-up:** 2-second TCP warm-up period before measurement
- **Connections:** Increased from 4 to 6 parallel workers
- **Calculation:** Changed from trimmed mean to 80th percentile
- **Gauge:** Auto-scaling max speed, auto unit selection (Kbps/Mbps/Gbps), tick marks, real-time animation
- **ISP:** Switched from HTTP to HTTPS for ip-api.com

### Boilerplate Cleanup

- Removed all auth pages (sign-in, sign-up, dashboard, user-profile)
- Removed Counter feature (page, form, API, tests)
- Removed Portfolio pages
- Removed sponsor components (DemoBadge, DemoBanner, Hello, Sponsors)
- Removed all "powered by" boilerplate references
- Cleaned up locale files (removed unused namespaces)
- Updated branding to "Speed Test"
- Cleaned up sitemap and robots.txt
