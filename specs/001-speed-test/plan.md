# Technical Implementation Plan

## Architecture Overview

### Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **Database**: DrizzleORM + PGlite (local) / Neon (production PostgreSQL)
- **Charts**: Lightweight charting library (lightweight-charts or recharts)
- **Testing**: Vitest (unit), Playwright (E2E)
- **Deployment**: Vercel (recommended) or any Node.js host

### Project Structure
```
speed-test-app/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (dashboard)/              # Dashboard route group
│   │   │   ├── page.tsx              # Main speed test page
│   │   │   ├── history/              # Speed history page
│   │   │   ├── servers/              # Server selection page
│   │   │   └── settings/             # Settings page
│   │   ├── api/                      # API routes
│   │   │   ├── speed/                # Speed test endpoints
│   │   │   │   ├── download/         # Download test data
│   │   │   │   ├── upload/           # Upload test handler
│   │   │   │   └── ping/             # Latency measurement
│   │   │   ├── isp/                  # ISP detection
│   │   │   └── results/              # CRUD for test results
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── speed-test/               # Speed test components
│   │   │   ├── SpeedGauge.tsx        # Animated speed gauge
│   │   │   ├── TestRunner.tsx        # Main test orchestrator
│   │   │   ├── ProgressBar.tsx       # Test progress indicator
│   │   │   └── ResultCard.tsx        # Result display card
│   │   ├── dashboard/                # Dashboard components
│   │   │   ├── DashboardHeader.tsx   # Header with quick stats
│   │   │   ├── QuickTest.tsx         # One-click test button
│   │   │   ├── ISPCard.tsx           # ISP information display
│   │   │   └── RecentResults.tsx     # Last 5 results
│   │   ├── history/                  # History components
│   │   │   ├── SpeedChart.tsx        # Interactive speed chart
│   │   │   ├── StatsSummary.tsx      # Avg/min/max stats
│   │   │   ├── DateFilter.tsx        # Date range selector
│   │   │   └── ExportButton.tsx      # CSV export
│   │   ├── servers/                  # Server components
│   │   │   ├── ServerList.tsx        # Available servers
│   │   │   ├── ServerCard.tsx        # Individual server card
│   │   │   └── AutoDetect.tsx        # Auto-detect best server
│   │   ├── shared/                   # Shared components
│   │   │   ├── Header.tsx            # App header/navigation
│   │   │   ├── Footer.tsx            # App footer
│   │   │   ├── ThemeToggle.tsx       # Light/dark toggle
│   │   │   ├── ShareModal.tsx        # Share results modal
│   │   │   └── LoadingSpinner.tsx    # Loading indicator
│   │   └── ui/                       # Base UI primitives
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Select.tsx
│   │       └── Modal.tsx
│   ├── lib/
│   │   ├── db/                       # Database layer
│   │   │   ├── schema.ts             # Drizzle schema
│   │   │   ├── index.ts              # DB connection
│   │   │   └── migrations/           # Migration files
│   │   ├── speed-test/               # Speed test engine
│   │   │   ├── engine.ts             # Core test logic
│   │   │   ├── download.ts           # Download measurement
│   │   │   ├── upload.ts             # Upload measurement
│   │   │   ├── ping.ts               # Latency measurement
│   │   │   └── network-api.ts        # Browser Network API
│   │   ├── isp/                      # ISP detection
│   │   │   └── detector.ts           # ISP info service
│   │   ├── servers/                  # Server management
│   │   │   ├── registry.ts           # Server list
│   │   │   └── selector.ts           # Best server logic
│   │   └── utils/                    # Utilities
│   │       ├── formatters.ts         # Number/date formatting
│   │       ├── share.ts              # Share result logic
│   │       └── constants.ts          # App constants
│   ├── hooks/                        # Custom React hooks
│   │   ├── useSpeedTest.ts           # Speed test hook
│   │   ├── useTheme.ts               # Theme management
│   │   ├── useResults.ts             # Results data hook
│   │   └── useServers.ts             # Server management hook
│   ├── types/                        # TypeScript types
│   │   ├── speed-test.ts             # Speed test types
│   │   ├── server.ts                 # Server types
│   │   └── index.ts                  # Type exports
│   └── config/                       # Configuration
│       └── app.ts                    # App configuration
├── public/
│   ├── assets/                       # Static assets
│   └── servers.json                  # Server registry
├── tests/
│   ├── unit/                         # Unit tests
│   ├── integration/                  # Integration tests
│   └── e2e/                          # E2E tests
└── package.json
```

## Key Technical Decisions

### Speed Test Engine
- **Download Test**: Parallel fetch requests to download large binary blobs (10MB chunks), measure throughput
- **Upload Test**: POST requests with generated binary data, measure upload throughput
- **Ping Test**: Multiple HEAD requests, calculate average and jitter
- **Browser API Fallback**: Use Network Information API for connection type and estimated speed
- **Accuracy**: Warm-up period, discard outliers, use median of samples

### Database Strategy
- **Local Dev**: PGlite (in-browser PostgreSQL, no setup needed)
- **Production**: Neon (serverless PostgreSQL with free tier)
- **ORM**: DrizzleORM for type-safe queries
- **Migrations**: Drizzle Kit for schema migrations

### State Management
- React hooks for component state
- Custom hooks for data fetching (`useResults`, `useServers`)
- React Context for theme and preferences
- No external state library needed

### Performance Optimizations
- Server-side rendering for initial page load
- Static generation for server list
- Streaming for speed test results
- Image optimization for share cards
- Code splitting by route

### Security Considerations
- Rate limiting on API routes (Arcjet built into boilerplate)
- Input validation on all API endpoints
- No sensitive data in URLs
- CORS configured for allowed origins only

## Implementation Phases

### Phase 1: Foundation
- Set up project structure and routing
- Configure database schema and DrizzleORM
- Create base UI components and layout
- Implement theme system (light/dark)

### Phase 2: Speed Test Engine
- Build download speed measurement
- Build upload speed measurement
- Build ping/latency measurement
- Create real-time progress UI with animated gauge

### Phase 3: Dashboard & History
- Build main dashboard with quick test
- Implement ISP detection
- Create speed history with charts
- Add statistics calculations

### Phase 4: Server Selection & Sharing
- Build server registry and selection UI
- Implement auto-detect best server
- Create share functionality (image, text, URL)
- Add social media sharing

### Phase 5: Polish & Testing
- Add settings page
- Implement data export (CSV)
- Write unit and integration tests
- E2E testing with Playwright
- Performance optimization and Lighthouse audit

## Dependencies

### Core
- `next` (16.x) - Framework
- `react` (19.x) - UI library
- `typescript` (5.x) - Type safety
- `tailwindcss` (4.x) - Styling

### Database
- `drizzle-orm` - Type-safe ORM
- `@electric-sql/pglite` - Local PostgreSQL
- `drizzle-kit` - Migrations

### Charts
- `recharts` or `lightweight-charts` - Speed history visualization

### Utilities
- `html-to-image` - Generate shareable result cards
- `date-fns` - Date formatting
- `zustand` (optional) - If complex state management needed

### Already in Boilerplate
- `@clerk/nextjs` - Authentication (can remove if not needed)
- `@sentry/nextjs` - Error monitoring
- `@arcjet/next` - Security/bot protection
- `vitest` - Unit testing
- `@playwright/test` - E2E testing
- `storybook` - Component development
