# Speed Test App — Architecture & Developer Guide

> Definitive reference for developers joining the project. Covers system design, data flow, APIs, database, routing, middleware, theming, performance, security, deployment, testing, and extension patterns.

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Component Hierarchy](#2-component-hierarchy)
3. [Data Flow — Speed Test Lifecycle](#3-data-flow--speed-test-lifecycle)
4. [API Architecture](#4-api-architecture)
5. [Database Schema](#5-database-schema)
6. [Routing Structure](#6-routing-structure)
7. [Middleware Pipeline](#7-middleware-pipeline)
8. [Cyber Theme Design System](#8-cyber-theme-design-system)
9. [Performance Architecture](#9-performance-architecture)
10. [Security Architecture](#10-security-architecture)
11. [Deployment Pipeline](#11-deployment-pipeline)
12. [Testing Strategy](#12-testing-strategy)
13. [Development Workflow](#13-development-workflow)
14. [How to Extend](#14-how-to-extend)

---

## 1. System Architecture Overview

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, Turbopack) | 16.2.1 |
| Language | TypeScript (strict) | 5.9 |
| UI Library | React | 19.2 |
| Styling | Tailwind CSS v4 | 4.2 |
| ORM | Drizzle ORM | 0.45 |
| Database | PostgreSQL (pg driver) | 8.20 |
| i18n | next-intl | 4.8 |
| Bot Protection | Arcjet | 1.3 |
| Error Monitoring | Sentry | 10.45 |
| Analytics | Vercel Analytics | 2.0 |
| Logging | LogTape | 2.0 |
| Validation | Zod | 4.3 |
| Charts | lightweight-charts | 5.1 |
| Forms | react-hook-form + Zod | 7.71 |
| Deployment | Vercel (serverless + edge) | — |
| Node Engine | Node.js | >= 20 |

### System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Vercel Edge Network                       │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │   Browser     │───▶│  proxy.ts    │───▶│  i18n Routing    │   │
│  │  (Client)     │    │  (Edge MW)   │    │  (next-intl)     │   │
│  └───────┬───────┘    │              │    └────────┬─────────┘   │
│          │            │  Arcjet Bot  │             │             │
│          │            │  Detection   │             │             │
│          │            └──────────────┘             │             │
│          │                                         │             │
│          │  ┌──────────────────────────────────────┘             │
│          │  │                                                    │
│          ▼  ▼                                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Next.js App Router                      │  │
│  │                                                             │  │
│  │  ┌─────────────────────┐   ┌────────────────────────────┐ │  │
│  │  │  Server Components   │   │  Client Components         │ │  │
│  │  │  (pages, layouts)    │   │  (dashboard, gauge, bg)    │ │  │
│  │  │                      │   │                             │ │  │
│  │  │  - IndexPage         │   │  - SpeedTestDashboard      │ │  │
│  │  │  - HistoryPage       │   │  - SpeedGauge              │ │  │
│  │  │  - ServersPage       │   │  - TestResults             │ │  │
│  │  │  - SettingsPage      │   │  - CyberBackground         │ │  │
│  │  │  - AboutPage         │   │  - ISPInfo                 │ │  │
│  │  │  - API Routes        │   │  - AdSlot                  │ │  │
│  │  └──────────┬───────────┘   └──────────────┬─────────────┘ │  │
│  └─────────────┼──────────────────────────────┼───────────────┘  │
│                │                              │                  │
│  ┌─────────────▼──────────────────────────────▼───────────────┐ │
│  │                    API Route Handlers                       │ │
│  │                                                              │ │
│  │  GET  /api/speed/download  →  ReadableStream (64KB buffer)  │ │
│  │  POST /api/speed/upload    →  Consume & discard body        │ │
│  │  HEAD /api/speed/ping      →  Empty response (latency)      │ │
│  │  GET  /api/isp             →  ip-api.com proxy              │ │
│  │  GET  /api/results         →  Query Drizzle (last 100)      │ │
│  │  POST /api/results         →  Insert Drizzle                │ │
│  │  DELETE /api/results       →  Delete all                    │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
│                             │                                     │
│  ┌──────────────────────────▼──────────────────────────────────┐ │
│  │                    PostgreSQL Database                       │ │
│  │                                                              │ │
│  │  speed_test_results  │  user_preferences  │  servers         │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │  Sentry (errors)  │  │  Vercel Analytics│  │  ip-api.com    │  │
│  └──────────────────┘  └──────────────────┘  └────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

- **Next.js App Router** with route groups: `(marketing)` groups public pages without affecting URL structure
- **i18n via next-intl** with locale prefix strategy `as-needed` (default locale has no prefix)
- **Edge middleware** (`proxy.ts`) runs before any route handler — handles bot detection + locale routing
- **Serverless API routes** for speed test endpoints — streaming responses avoid memory limits
- **Drizzle ORM** with PostgreSQL connection pooling via `pg.Pool`
- **React 19** with React Compiler — no manual `useMemo`/`useCallback` needed
- **Tailwind v4** with CSS-first configuration — custom theme tokens in `global.css`

---

## 2. Component Hierarchy

```
RootLayout (src/app/[locale]/layout.tsx)          ← Server Component
├── NextIntlClientProvider                         ← i18n context
│   ├── children (page content)
│   ├── AdConsentBanner                            ← GDPR consent
│   ├── Analytics                                  ← Vercel Analytics
│   └── AdScript                                   ← Google AdSense loader
│
MarketingLayout (src/app/[locale]/(marketing)/layout.tsx)  ← Server
├── BaseTemplate                                   ← Page wrapper
│   ├── Header (logo, glitch effect)
│   ├── Nav (left: CyberNavLink × 4)
│   ├── Nav (right: GitHub link, LocaleSwitcher)
│   ├── children
│   └── Footer
│
IndexPage (src/app/[locale]/(marketing)/page.tsx)  ← Server
├── SpeedTestDashboard                             ← Client Component
│   ├── CyberBackground                            ← Canvas particles
│   ├── Header (title, typing animation)
│   ├── SpeedGauge                                 ← SVG arc gauge
│   ├── Action Button (INITIALIZE / ABORT / RE-TEST)
│   ├── TestResults                                ← Results cards
│   │   └── ShareModal (dynamic import)            ← PNG export
│   ├── ISPInfo                                    ← ISP detection
│   ├── AdSlot (sidebar, vertical)
│   └── Test History (recent 5)
└── AdSlot (footer, horizontal)

HistoryPage                                        ← Server
├── SpeedChart (dynamic import)                    ← lightweight-charts
├── StatsSummary                                   ← Avg/min/max/median
├── DateFilter
└── ExportButton                                   ← CSV download

ServersPage                                        ← Server
└── Server list + latency test

SettingsPage                                       ← Server
└── User preferences form

AboutPage                                          ← Server
└── Static content
```

### Component Responsibility Matrix

| Component | Type | Responsibility |
|-----------|------|---------------|
| `SpeedTestDashboard` | Client | Orchestrates test lifecycle, manages state |
| `SpeedGauge` | Client | SVG visualization of real-time speed |
| `useSpeedTest` | Hook | Core measurement logic (ping/download/upload) |
| `CyberBackground` | Client | Canvas particle animation |
| `TestResults` | Client | Display results, trigger share modal |
| `ISPInfo` | Client | Fetch and display ISP info |
| `AdSlot` | Client | Render Google AdSense ad unit |
| `CyberNavLink` | Client | Styled navigation link with active state |
| `BaseTemplate` | Server | Page layout wrapper with header/footer |
| `LocaleSwitcher` | Client | Language toggle |

---

## 3. Data Flow — Speed Test Lifecycle

### Phase Sequence

```
idle ──▶ ping ──▶ download ──▶ upload ──▶ complete
  │        │          │           │          │
  │        │          │           │          └─► Save to DB
  │        │          │           │          └─► Update history
  │        │          │           │          └─► Show results
  │        │          │           │
  │        │          │           └─► 6 parallel POST workers
  │        │          │           └─► 2MB chunks, 12s total
  │        │          │           └─► 2s warmup + 10s measurement
  │        │          │
  │        │          └─► 6 parallel GET stream workers
  │        │          └─► 5MB chunks via ReadableStream
  │        │          └─► 2s warmup + 10s measurement
  │        │
  │        └─► 20 sequential HEAD requests
  │        └─► Measure RTT with performance.now()
  │        └─► Calculate mean + jitter
  │
  └─► User clicks INITIALIZE
```

### Detailed Phase Breakdown

#### Phase 1: Ping (0–15% progress)

```
Client                          Server
  │                               │
  ├─ HEAD /api/speed/ping?t=... ──▶│
  │  (20 iterations)              │
  │◀─ Empty response ─────────────┤
  │                               │
  ├─ performance.now() delta      │
  ├─ Filter out zero samples      │
  ├─ ping = mean(validSamples)    │
  └─ jitter = mean(|Δ consecutive│)│
```

**Constants:** 20 samples, sequential (not parallel)

#### Phase 2: Download (15–60% progress)

```
Client (6 parallel workers)       Server
  │                                 │
  ├─ GET /api/speed/download?size=5MB ──▶│
  │  ├─ response.body.getReader()       │
  │  ├─ Read chunks as they arrive      │
  │  ├─ instantSpeed = (bytes × 8) / (sec × 1M) │
  │  ├─ setState(currentSpeed)          │
  │  └─ Repeat until 12s elapsed        │
  │                                 │
  │  ◀─ ReadableStream (64KB buffer × N) ─┤
  │                                 │
  └─ p80(sorted samples) = result │
```

**Constants:** 6 workers, 5MB chunks, 2s warmup + 10s measurement, 80th percentile

#### Phase 3: Upload (60–100% progress)

```
Client (6 parallel workers)       Server
  │                                 │
  ├─ POST /api/speed/upload ──────▶│
  │  body: Blob(2MB)               │
  │  ├─ fetchStart = performance.now() │
  │  ├─ await response             │
  │  ├─ elapsed = now() - fetchStart   │
  │  ├─ instantSpeed = (2MB × 8) / (sec × 1M) │
  │  └─ Repeat until 12s elapsed   │
  │                                 │
  │  ◀─ { received: true } ─────────┤
  │                                 │
  └─ p80(sorted samples) = result │
```

**Constants:** 6 workers, 2MB chunks, 2s warmup + 10s measurement, 80th percentile

#### Phase 4: Complete

```
1. Build result object: { timestamp, download, upload, ping, jitter }
2. Set phase = 'complete', progress = 100
3. Save to database via POST /api/results
4. Update local testHistory state
5. Render TestResults component
```

### Abort Handling

- `abortRef.current = true` set via `cancelTest()`
- Each worker loop checks `abortRef.current` between iterations
- State resets to `idle` on abort or error

---

## 4. API Architecture

### Speed Test Endpoints

#### GET `/api/speed/download?size=<bytes>`

Streams random bytes for download speed measurement.

**Request:**
```
GET /api/speed/download?size=5242880&t=1712000000000-0.123
Cache-Control: no-store
```

**Response:**
```
HTTP/1.1 200 OK
Content-Type: application/octet-stream
Content-Length: 5242880
Cache-Control: no-store, no-cache, must-revalidate

<ReadableStream of random bytes>
```

**Implementation notes:**
- Pre-generates 64KB random buffer at module load (avoids per-request crypto overhead)
- Streams buffer repeatedly via `ReadableStream` to reach requested size
- Caps at 50MB maximum
- Yields to event loop every 640KB to prevent blocking

#### POST `/api/speed/upload`

Accepts and discards request body for upload speed measurement.

**Request:**
```
POST /api/speed/upload
Content-Length: 2097152
Content-Type: application/octet-stream

<2MB binary data>
```

**Response:**
```json
{ "received": true }
```

**Implementation notes:**
- Reads and discards entire body via `request.body.getReader()`
- Forces actual data transmission (not just headers)

#### HEAD|GET `/api/speed/ping?t=<timestamp>-<index>`

Minimal response for latency measurement.

**Request:**
```
HEAD /api/speed/ping?t=1712000000000-0
Cache-Control: no-store
```

**Response (HEAD):**
```
HTTP/1.1 200 OK
Cache-Control: no-store, no-cache, must-revalidate
(empty body)
```

**Response (GET):**
```json
{ "timestamp": 1712000000000 }
```

#### GET `/api/isp`

Proxies ISP lookup to ip-api.com.

**Request:**
```
GET /api/isp
```

**Response (200):**
```json
{
  "ip": "1.2.3.4",
  "org": "Comcast Cable",
  "city": "San Francisco",
  "region": "California",
  "country": "United States"
}
```

**Response (502/503):**
```json
{ "error": "ISP lookup failed" }
```

### Results Endpoints

#### GET `/api/results`

Returns up to 100 recent test results.

**Response:**
```json
[
  {
    "id": 1,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "download_mbps": 45.2,
    "upload_mbps": 12.8,
    "ping_ms": 15.3,
    "jitter_ms": 2.1
  }
]
```

#### POST `/api/results`

Saves a new test result.

**Request:**
```json
{
  "download": 45.2,
  "upload": 12.8,
  "ping": 15.3,
  "jitter": 2.1
}
```

**Response (200):**
```json
{
  "id": 2,
  "timestamp": "2024-01-15T10:31:00.000Z",
  "download_mbps": 45.2,
  "upload_mbps": 12.8,
  "ping_ms": 15.3,
  "jitter_ms": 2.1
}
```

**Response (400):**
```json
{ "error": "Invalid JSON" }
```

**Validation:**
- All values must be numbers within range (0–10,000 for speeds, 0–5,000 for jitter)
- Invalid values default to 0

#### DELETE `/api/results`

Clears all stored results.

**Response:**
```json
{ "deleted": true }
```

---

## 5. Database Schema

### ORM: Drizzle ORM + PostgreSQL

**Connection:** `pg.Pool` with connection string from `DATABASE_URL` env var
**Caching:** Global `cachedDrizzle` variable prevents multiple instances during hot reload
**Migrations:** Drizzle Kit generates SQL migrations in `migrations/`

### Tables

#### `speed_test_results`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `serial` | PK | Auto-incrementing ID |
| `timestamp` | `timestamp` | NOT NULL, DEFAULT now() | Test execution time |
| `download_mbps` | `double precision` | NOT NULL | Download speed in Mbps |
| `upload_mbps` | `double precision` | NOT NULL | Upload speed in Mbps |
| `ping_ms` | `double precision` | NOT NULL | Average ping latency |
| `jitter_ms` | `double precision` | NOT NULL | Jitter (mean deviation) |
| `server_id` | `varchar(255)` | nullable | Test server identifier |
| `server_name` | `varchar(255)` | nullable | Server display name |
| `server_location` | `varchar(255)` | nullable | Server location |
| `isp_name` | `varchar(255)` | nullable | ISP name |
| `ip_address` | `varchar(45)` | nullable | Client IP (IPv4/IPv6) |
| `connection_type` | `varchar(50)` | nullable | Connection type |
| `download_samples` | `jsonb` | nullable | Raw download speed samples |
| `upload_samples` | `jsonb` | nullable | Raw upload speed samples |
| `ping_samples` | `jsonb` | nullable | Raw ping latency samples |

#### `user_preferences`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `serial` | PK | Auto-incrementing ID |
| `theme` | `varchar(20)` | `'system'` | UI theme preference |
| `default_server_id` | `varchar(255)` | null | Preferred test server |
| `test_duration` | `integer` | `10` | Test duration (seconds) |
| `parallel_connections` | `integer` | `4` | Parallel connection count |
| `data_retention_days` | `integer` | `90` | Auto-delete old results |
| `last_updated` | `timestamp` | NOT NULL, DEFAULT now() | Last modification time |

#### `servers`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `serial` | PK | Auto-incrementing ID |
| `name` | `varchar(255)` | NOT NULL | Server display name |
| `location` | `varchar(255)` | NOT NULL | Server location |
| `url` | `varchar(500)` | NOT NULL | Server base URL |
| `latitude` | `double precision` | nullable | Geographic latitude |
| `longitude` | `double precision` | nullable | Geographic longitude |
| `is_active` | `boolean` | DEFAULT true | Server availability |

### Schema File

Defined in `src/models/Schema.ts` using Drizzle's `pgTable` API. All table definitions use PostgreSQL-specific column types.

### Migration Workflow

```bash
# Edit src/models/Schema.ts
npm run db:generate        # Generate migration SQL in migrations/
npm run db:migrate         # Apply migrations to database
npm run db:studio          # Open Drizzle Studio (GUI)
```

---

## 6. Routing Structure

### Route Groups

```
src/app/
├── [locale]/                          ← Dynamic locale segment
│   ├── layout.tsx                     ← Root layout (i18n provider, SEO, analytics)
│   ├── (marketing)/                   ← Route group (no URL prefix)
│   │   ├── layout.tsx                 ← Marketing layout (nav, header, footer)
│   │   ├── page.tsx                   ← Homepage (/ or /fr)
│   │   ├── about/page.tsx             ← About page
│   │   ├── history/page.tsx           ← Test history
│   │   ├── servers/page.tsx           ← Server selection
│   │   ├── settings/page.tsx          ← User settings
│   │   └── api/
│   │       ├── speed/download/route.ts
│   │       ├── speed/upload/route.ts
│   │       ├── speed/ping/route.ts
│   │       ├── isp/route.ts
│   │       └── results/route.ts
│   └── ...
├── sitemap.ts                         ← Dynamic sitemap.xml
└── robots.ts                          ← Dynamic robots.txt
```

### Locale Resolution

| URL | Resolved Locale |
|-----|----------------|
| `/` | `en` (default) |
| `/fr` | `fr` |
| `/history` | `en` |
| `/fr/history` | `fr` |

**Strategy:** `as-needed` — default locale (`en`) has no prefix; other locales use `/[locale]/` prefix.

### i18n Configuration

```typescript
// src/utils/AppConfig.ts
{
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
}
```

### Static Params

Root layout generates static params for all locales:

```typescript
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
```

### SEO Metadata

- **Root layout:** `generateSeoMetadata()` with site-wide defaults
- **Per-page:** `generateMetadata()` exports override defaults
- **JSON-LD:** `WebApplication` structured data injected in root layout `<head>`
- **Sitemap:** Dynamic generation with i18n alternates
- **Robots:** Allows search engines, blocks AI scrapers (GPTBot, CCBot, ChatGPT-User)

---

## 7. Middleware Pipeline

### Edge Middleware (`src/proxy.ts`)

Runs on Vercel Edge Network before any route handler.

```
Request
  │
  ▼
┌─────────────────────────────────────┐
│  Arcjet Bot Detection                │
│  ┌───────────────────────────────┐   │
│  │ detectBot({                   │   │
│  │   mode: 'LIVE',               │   │
│  │   allow: [                    │   │
│  │     'CATEGORY:SEARCH_ENGINE', │   │
│  │     'CATEGORY:PREVIEW',       │   │
│  │     'CATEGORY:MONITOR',       │   │
│  │   ]                           │   │
│  │ })                            │   │
│  └───────────────────────────────┘   │
│                                      │
│  decision.isDenied() ? 403 : pass    │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│  next-intl Routing                  │
│  ┌───────────────────────────────┐   │
│  │ createMiddleware(routing)     │   │
│  │                               │   │
│  │ - Detects Accept-Language     │   │
│  │ - Redirects to locale prefix  │   │
│  │ - Sets cookie for preference  │   │
│  └───────────────────────────────┘   │
└──────────────────┬──────────────────┘
                   │
                   ▼
              Route Handler
```

### Matcher Configuration

```typescript
export const config = {
  matcher: '/((?!_next|_vercel|monitoring|.*\\..*).*)',
};
```

**Excluded paths:**
- `/_next/*` — Next.js internal assets
- `/_vercel/*` — Vercel internal endpoints
- `/monitoring/*` — Sentry tunnel route
- `/*.*` — Static files (favicon.ico, images, etc.)

### Arcjet Configuration

**Base instance** (`src/libs/Arcjet.ts`):
- Shield rule for common attack protection
- Identifies requests by source IP
- Uses `process.env.ARCJET_KEY` (not validated Env) to reduce middleware bundle size

**Per-route extension** (`src/proxy.ts`):
- Adds `detectBot` rule
- Blocks all bots except search engines, preview generators, and monitors
- Returns `403 Forbidden` for denied requests

---

## 8. Cyber Theme Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-cyan-neon` | `#00f0ff` | Primary accent, links, active states |
| `--color-purple-neon` | `#a855f7` | Secondary accent, gradient stops |
| `--color-green-neon` | `#22c55e` | Success states, high-speed indicator |
| `--color-cyber-dark` | `#0a0a1a` | Background base |
| `--color-cyber-panel` | `rgba(10, 10, 40, 0.8)` | Card backgrounds (glassmorphism) |
| `--color-cyber-border` | `rgba(0, 240, 255, 0.15)` | Border color |

### Typography

- **Primary:** System font stack (Tailwind default)
- **Monospace:** `font-mono` for data displays, labels, terminal-style text
- **Title:** `text-5xl sm:text-6xl font-black tracking-tighter` with glow effect
- **Labels:** `text-xs tracking-widest uppercase` for HUD-style indicators

### Animations

| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| `cyber-glow` | 2s | ease-in-out infinite | Text/icon glow pulsing |
| `neon-pulse` | 2s | ease-in-out infinite | Opacity pulsing |
| `scanline` | — | linear | Full-height scanning line |
| `glitch` | — | stepped | Text displacement effect |
| `border-flow` | — | linear | Gradient border animation |
| `fade-in-up` | 0.6s | ease-out | Page/element entrance |
| `scale-in` | 0.4s | ease-out | Modal/dialog entrance |
| `shimmer` | 3s | linear infinite | Loading skeleton effect |
| `data-stream` | 3–7s | linear infinite | Vertical data stream decoration |

### Component Classes

| Class | Description |
|-------|-------------|
| `.cyber-card` | Glassmorphic card with gradient border, hover glow |
| `.cyber-btn` | Button with radial hover effect, scale on active |
| `.cyber-text-glow` | Text shadow with neon glow |
| `.cyber-input` | Dark input with cyan focus ring |
| `.cyber-data-stream` | Animated vertical line decoration |
| `.cyber-hex-bg` | Hexagonal grid pattern background |
| `.clip-path-button` | Angled button shape via clip-path |

### Canvas Background (`CyberBackground`)

- **Particle count:** Adaptive, capped at 120 (prevents O(n²) explosion on 4K)
- **Colors:** Cyan, purple, green, blue from palette
- **Features:** Grid overlay, particle connections (within 150px), scanline effect
- **Performance:** Pauses on tab hide via Page Visibility API, resizes on viewport change

### Glitch Effect

Applied to title and nav links on hover:
- Two overlay layers (red + cyan) with slight offset
- Opacity 0 → 20-30% on hover
- Translate ±1-3px for displacement

---

## 9. Performance Architecture

### Bundle Optimizations

| Optimization | Savings | Technique |
|-------------|---------|-----------|
| Dynamic import: ShareModal | ~100KB | `next/dynamic` with `ssr: false` |
| Dynamic import: SpeedChart | ~150KB | `next/dynamic` with skeleton loader |
| Dynamic import: html-to-image | ~80KB | `await import()` inside handler |
| Server external packages | ~250KB prevented | `serverExternalPackages: ['pg', '@logtape/logtape']` |
| Sentry tree-shaking | ~10KB | `treeshake.removeDebugLogging: true` |
| React Compiler | runtime | Automatic memoization, no manual hooks |

**Total initial bundle reduction:** ~250–330KB from dynamic imports alone

### Runtime Optimizations

| Area | Optimization | Impact |
|------|-------------|--------|
| Canvas | Particle count capped at 120 | 95% CPU reduction on 4K displays |
| Canvas | Page Visibility API | Zero CPU when tab is hidden |
| Gauge | No `useMemo` (React Compiler) | Cleaner code, no double-optimization |
| Sentry | Sampling rate 0.1 (prod) | 90% less trace/replay data |
| Images | AVIF/WebP formats | Smaller image payloads |

### API Performance

| Endpoint | Strategy |
|----------|----------|
| Download | Pre-generated 64KB buffer, streaming, no per-request crypto |
| Upload | Body consumed and discarded immediately, no storage |
| Ping | Minimal HEAD response, no body |
| Results | Connection pooling via `pg.Pool`, Drizzle query builder |

### Expected Core Web Vitals

| Metric | Target | Method |
|--------|--------|--------|
| LCP | < 2.5s | Dynamic imports, reduced bundle |
| FCP | < 1.8s | Minimal blocking resources |
| CLS | < 0.1 | Explicit dimensions, stable layout |
| TBT | < 200ms | Code splitting, React Compiler |
| Lighthouse | > 90 | Combined optimizations |

### Build Configuration

```typescript
// next.config.ts highlights
{
  reactStrictMode: true,
  reactCompiler: process.env.NODE_ENV === 'production',
  serverExternalPackages: ['pg', '@logtape/logtape'],
  images: { formats: ['image/avif', 'image/webp'] },
  outputFileTracingIncludes: { '/': ['./migrations/**/*'] },
  poweredByHeader: false,
}
```

---

## 10. Security Architecture

### Bot Protection (Arcjet)

**Layer 1: Shield** (`src/libs/Arcjet.ts`)
- Detects common attack patterns (SQL injection, XSS, path traversal)
- Mode: `LIVE` (blocks in production)

**Layer 2: Bot Detection** (`src/proxy.ts`)
- Blocks automated bots except:
  - Search engine crawlers (`CATEGORY:SEARCH_ENGINE`)
  - Preview link generators (`CATEGORY:PREVIEW`)
  - Uptime monitoring services (`CATEGORY:MONITOR`)
- Identifies requests by source IP

**Allowed bots:**
- Google, Bing, DuckDuckGo, etc.
- Vercel preview deployments
- UptimeRobot, Pingdom, etc.

**Blocked bots:**
- Scrapers, spammers, automated tools
- GPTBot, CCBot, ChatGPT-User (via robots.txt)

### Input Validation

**Results API** (`/api/results` POST):
- JSON parsing with try/catch
- Type narrowing (must be object, not null)
- Range validation (0–10,000 for speeds, 0–5,000 for jitter)
- Invalid values default to 0 (fail-safe)

**Download API** (`/api/speed/download`):
- `size` parameter parsed with `parseInt`
- NaN check returns 400
- Capped at 50MB maximum

**Environment Variables** (`src/libs/Env.ts`):
- Zod schema validation at startup
- `DATABASE_URL` required
- `ARCJET_KEY` validated format (`ajkey_` prefix)
- `NODE_ENV` enum validation
- `NEXT_PUBLIC_LOGGING_LEVEL` enum with default

### CORS

- Download endpoint currently allows `Access-Control-Allow-Origin: *`
- In production, should restrict to specific domain
- Other endpoints use same-origin by default (no CORS headers)

### Error Handling

- All API routes return appropriate HTTP status codes (400, 403, 500, 502, 503)
- Errors are caught and return JSON responses (no stack traces exposed)
- Sentry captures errors for monitoring (with reduced sampling in production)

### Headers

- `poweredByHeader: false` — removes `X-Powered-By` header
- `Cache-Control: no-store` on speed test endpoints — prevents caching of test data
- Sentry tunnel route (`/monitoring`) — bypasses ad blockers for error reporting

---

## 11. Deployment Pipeline

### Platform: Vercel

**Build command:** `next build` (configured in `vercel.json`)
**Note:** Does NOT run `db:migrate` — migrations cannot execute in Vercel's build environment (no database access)

### Build Process

```
1. npm install                    # Install dependencies
2. next build                     # Next.js production build
   ├── Compile pages (RSC + client)
   ├── Generate static params
   ├── Build API routes
   ├── Optimize images
   └── Output .next/ directory
3. Deploy to Vercel Edge Network
   ├── Serverless functions (API routes, SSR pages)
   ├── Edge middleware (proxy.ts)
   └── Static assets (CDN cached)
```

### Environment Variables

| Variable | Scope | Required | Description |
|----------|-------|----------|-------------|
| `DATABASE_URL` | Server | Yes | PostgreSQL connection string |
| `ARCJET_KEY` | Server | No | Bot protection API key (format: `ajkey_...`) |
| `NEXT_PUBLIC_APP_URL` | Client | No | Production domain URL |
| `NEXT_PUBLIC_LOGGING_LEVEL` | Client | No | Log level: `error`, `info`, `debug`, `warning`, `trace`, `fatal` (default: `info`) |
| `NEXT_PUBLIC_SENTRY_DSN` | Client | No | Sentry error tracking DSN |
| `SENTRY_AUTH_TOKEN` | Server | No | Sentry source map upload token |
| `SENTRY_ORGANIZATION` | Server | No | Sentry org slug |
| `SENTRY_PROJECT` | Server | No | Sentry project name |
| `NEXT_PUBLIC_ADS_ENABLED` | Client | No | Master ad toggle (`true`/`false`) |
| `NEXT_PUBLIC_GOOGLE_ADSENSE_ID` | Client | No | AdSense publisher ID |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Client | No | Google Search Console verification |

### Vercel Configuration

```json
{
  "buildCommand": "next build",
  "env": {
    "NEXT_TELEMETRY_DISABLED": "1",
    "NEXT_PUBLIC_LOGGING_LEVEL": "info"
  }
}
```

### Local Development vs Production

| Aspect | Local | Production |
|--------|-------|------------|
| Database | PGLite (file or memory) | PostgreSQL (managed) |
| Build | `npm run build-local` | `next build` |
| Dev Server | Turbopack (`next dev`) | — |
| React Compiler | Disabled | Enabled |
| Sentry Sampling | 100% | 10% traces, 1% replays |

### Database Migrations

```bash
# Production (run separately, not during build)
npm run db:migrate

# Local development
npm run db-server:memory   # PGLite in-memory
npm run db-server:file     # PGLite with file persistence
npm run db:generate        # Generate migration from schema changes
npm run db:migrate         # Apply migrations
npm run db:studio          # GUI database browser
```

---

## 12. Testing Strategy

### Test Types

| Type | Framework | Location | Command |
|------|-----------|----------|---------|
| Unit | Vitest | Co-located `*.test.ts` | `npm run test` |
| Integration | Vitest | `tests/integration/` | `npm run test` |
| E2E | Playwright | `tests/e2e/` | `npm run test:e2e` |
| Storybook | Storybook 10 | `*.stories.*` | `npm run storybook` |

### Test Conventions

- **Unit tests:** Co-located with implementation files (`*.test.ts`)
- **Integration tests:** In `tests/integration/` directory
- **E2E tests:** In `tests/e2e/` directory with Playwright
- **Naming:** `describe` = subject, `it` = short third-person present tense
- **No mocking** unless necessary (test real behavior)

### Test Commands

```bash
npm run test              # Unit + integration tests (Vitest)
npm run test:e2e          # End-to-end tests (Playwright)
npm run storybook:test    # Storybook tests
```

### Coverage

- Speed measurement logic (`useSpeedTest`) — unit test ping/download/upload phases
- API route handlers — integration test request/response
- Component rendering — Storybook stories + Vitest browser tests
- E2E flows — full speed test lifecycle in browser

---

## 13. Development Workflow

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build-local` | Build with PGLite (memory DB) |
| `npm run build` | Production build with migrations |
| `npm run build-stats` | Build with bundle analysis |
| `npm run start` | Start production server |
| `npm run lint` | Lint + type-check (Ultracite) |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run check:types` | TypeScript type checking |
| `npm run check:deps` | Find unused dependencies (knip) |
| `npm run check:i18n` | Validate i18n completeness |
| `npm run test` | Run unit + integration tests |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npm run db:generate` | Generate Drizzle migration |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Open Drizzle Studio GUI |
| `npm run storybook` | Start Storybook dev server |
| `npm run clean` | Remove .next, out, coverage |

### Code Conventions (from AGENTS.md)

- **TypeScript strict mode** — no `any` unless isolated
- **Named exports only** — no default exports (except Next.js pages)
- **Absolute imports** via `@/` alias
- **No `useMemo`/`useCallback`** — React Compiler handles optimization
- **Avoid `useEffect`** — prefer derived state and event handlers
- **Single `props` param** with inline type, access as `props.foo` (no destructuring)
- **Zod type-only imports:** `import type * as z from 'zod'`
- **Environment vars** validated in `Env.ts` — never read `process.env` directly
- **i18n:** Never hard-code user-visible strings; use `next-intl`
- **Git commits:** Conventional Commits format (`type: summary`)

### Git Commit Types

`feat` | `fix` | `docs` | `style` | `refactor` | `perf` | `test` | `build` | `ci` | `chore` | `revert`

### Pre-commit Hooks

Managed by Lefthook. Runs linting and type checking before commits.

### Branch Strategy

- `main` — production branch
- Feature branches — `feat/description`
- Semantic release via `@semantic-release` (auto-versioning from commit messages)

---

## 14. How to Extend

### Adding a New Page

1. **Create page file:**
   ```
   src/app/[locale]/(marketing)/your-page/page.tsx
   ```

2. **Add SEO metadata:**
   ```tsx
   import type { Metadata } from 'next';
   import { generateSeoMetadata } from '@/libs/Seo';

   export const metadata: Metadata = generateSeoMetadata({
     title: 'Your Page',
     description: 'Description of your page.',
     canonical: '/your-page',
   });
   ```

3. **Add navigation link** in `src/app/[locale]/(marketing)/layout.tsx`:
   ```tsx
   <li><CyberNavLink href="/your-page/">{t('your_page_link')}</CyberNavLink></li>
   ```

4. **Add translation keys** in `src/locales/en.json` and `src/locales/fr.json`

5. **Update sitemap** in `src/app/sitemap.ts`:
   ```ts
   { path: '/your-page', priority: 0.6, changeFrequency: 'monthly' },
   ```

### Adding a New API Route

1. **Create route file:**
   ```
   src/app/[locale]/(marketing)/api/your-endpoint/route.ts
   ```

2. **Export HTTP method handlers:**
   ```tsx
   import { NextResponse } from 'next/server';

   export async function GET(request: Request) {
     // Handle GET
     return NextResponse.json({ data: 'value' });
   }

   export async function POST(request: Request) {
     // Validate input
     const body = await request.json();
     // Process
     return NextResponse.json({ success: true });
   }
   ```

3. **Add input validation** — use type narrowing, range checks, try/catch for JSON parsing

4. **Add Arcjet rules** if the endpoint needs bot protection (extend base Arcjet instance)

### Adding a New Database Table

1. **Edit schema:** `src/models/Schema.ts`
   ```tsx
   export const yourTable = pgTable('your_table', {
     id: serial('id').primaryKey(),
     name: varchar('name', { length: 255 }).notNull(),
     // ...
   });
   ```

2. **Generate migration:**
   ```bash
   npm run db:generate
   ```

3. **Apply migration:**
   ```bash
   npm run db:migrate
   ```

4. **Use in API routes:**
   ```tsx
   import { db } from '@/libs/DB';
   import { yourTable } from '@/models/Schema';

   const results = await db.select().from(yourTable);
   ```

### Adding a New Component

1. **Create component file** in appropriate directory:
   - `src/components/speed-test/` — speed test related
   - `src/components/history/` — history page related
   - `src/components/ads/` — advertising related
   - `src/components/` — shared components

2. **Follow conventions:**
   - Named export
   - TypeScript strict types
   - `props` param with inline type (no destructuring)
   - Use `@/` for absolute imports
   - Client components: `'use client'` directive at top

3. **Add Storybook story** (optional but recommended):
   ```tsx
   // YourComponent.stories.tsx
   import type { Meta } from '@storybook/nextjs-vite';
   import { YourComponent } from './YourComponent';

   const meta: Meta<typeof YourComponent> = { component: YourComponent };
   export default meta;
   export const Default = {};
   ```

### Adding a New Translation

1. **Add key** to `src/locales/en.json`:
   ```json
   {
     "YourPage": {
       "title": "Your Page Title",
       "description": "Page description."
     }
   }
   ```

2. **Add French translation** to `src/locales/fr.json`

3. **Use in components:**
   - Server: `const t = await getTranslations({ locale, namespace: 'YourPage' })`
   - Client: `const t = useTranslations('YourPage')`

4. **Validate:**
   ```bash
   npm run check:i18n
   ```

### Adding a New Ad Placement

1. **Define slot** in `src/config/SiteConfig.ts`:
   ```ts
   slots: {
     yourPlacement: {
       id: process.env.NEXT_PUBLIC_AD_SLOT_YOUR_PLACEMENT || '',
       format: 'vertical',
       size: '300x250',
     },
   }
   ```

2. **Add env var** to `.env.local` and production

3. **Render AdSlot:**
   ```tsx
   <AdSlot
     slotId={process.env.NEXT_PUBLIC_AD_SLOT_YOUR_PLACEMENT ?? ''}
     format="vertical"
     className="my-4"
   />
   ```

### Adding Error Monitoring

Sentry is already configured. To add custom error boundaries or capture specific errors:

```tsx
import * as Sentry from '@sentry/nextjs';

// Capture custom error
Sentry.captureException(error, {
  tags: { feature: 'speed-test' },
  contexts: { test: { phase: 'download' } },
});
```

### Adding Analytics Events

Vercel Analytics tracks page views automatically. For custom events:

```tsx
import { track } from '@vercel/analytics/react';

track('speed_test_started', { phase: 'download' });
```

---

## Quick Reference

### File Locations

```
src/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # i18n route group
│   │   ├── layout.tsx            # Root layout
│   │   └── (marketing)/          # Public pages
│   │       ├── layout.tsx        # Marketing layout
│   │       ├── page.tsx          # Homepage
│   │       └── api/              # API routes
├── components/                   # React components
├── hooks/                        # Custom React hooks
│   └── useSpeedTest.ts           # Core speed test logic
├── libs/                         # Library configurations
│   ├── Env.ts                    # Environment validation
│   ├── Arcjet.ts                 # Bot protection
│   ├── DB.ts                     # Database connection
│   ├── I18n.ts                   # i18n config
│   ├── I18nRouting.ts            # Routing config
│   ├── Logger.ts                 # Logging
│   └── Seo.ts                    # SEO helpers
├── locales/                      # Translation files (en, fr)
├── models/                       # Database schema
│   └── Schema.ts                 # Drizzle tables
├── styles/                       # Global styles
│   └── global.css                # Tailwind + cyber theme
├── templates/                    # Layout templates
│   └── BaseTemplate.tsx          # Page wrapper
├── utils/                        # Utilities
│   ├── AppConfig.ts              # App config
│   ├── DBConnection.ts           # DB connection factory
│   └── Helpers.ts                # Helper functions
└── proxy.ts                      # Edge middleware
```

### Key Constants

| Constant | Value | Location |
|----------|-------|----------|
| `TEST_DURATION` | 10,000ms | `useSpeedTest.ts` |
| `WARMUP_DURATION` | 2,000ms | `useSpeedTest.ts` |
| `PARALLEL_CONNECTIONS` | 6 | `useSpeedTest.ts` |
| `DOWNLOAD_CHUNK_SIZE` | 5MB | `useSpeedTest.ts` |
| `UPLOAD_CHUNK_SIZE` | 2MB | `useSpeedTest.ts` |
| `BUFFER_SIZE` (server) | 64KB | `download/route.ts` |
| Max download size | 50MB | `download/route.ts` |
| Ping samples | 20 | `useSpeedTest.ts` |
| Result percentile | 80th | `useSpeedTest.ts` |

### Supported Locales

| Code | Language | URL Pattern |
|------|----------|-------------|
| `en` | English | `/` (default, no prefix) |
| `fr` | French | `/fr/` |

---

## Additional Documentation

- **TECHNICAL.md** — Detailed speed test methodology and API design decisions
- **PERFORMANCE_SPEC.md** — Performance targets and optimization plan
- **PERFORMANCE_REPORT.md** — Implemented optimizations and expected improvements
- **SEO.md** — Complete SEO configuration and extension guide
- **ADS.md** — Advertising system documentation and compliance guide
