# Tasks: Internet Speed Test Application

## Phase 1: Foundation

### 1.1 Project Setup
- [ ] T001: Clean up boilerplate - remove auth-related pages and unused components
- [ ] T002: Update app configuration (title, description, metadata, favicon)
- [ ] T003: Set up route groups: `(dashboard)` for main app pages
- [ ] T004: Create base layout with Header, Footer, and navigation
- [ ] T005: Configure Tailwind CSS custom theme (colors, fonts, animations)

### 1.2 Database Setup
- [ ] T006: Define DrizzleORM schema for SpeedTestResult, Server, UserPreferences
- [ ] T007: Configure Drizzle connection (PGlite for dev, Neon for prod)
- [ ] T008: Create initial migration and run it
- [ ] T009: Create database utility functions (CRUD operations for results)
- [ ] T010: Create seed script with sample test servers

### 1.3 Base UI Components
- [ ] T011: Create Button component with variants (primary, secondary, ghost)
- [ ] T012: Create Card component with header, body, footer slots
- [ ] T013: Create Select component for dropdowns
- [ ] T014: Create Modal component with overlay and animations
- [ ] T015: Create LoadingSpinner component
- [ ] T016: Create ThemeToggle component (light/dark/system)

## Phase 2: Speed Test Engine

### 2.1 Download Speed Measurement
- [ ] T017: Create download test function with parallel chunked fetch requests
- [ ] T018: Implement warm-up period and outlier detection
- [ ] T019: Calculate Mbps from bytes transferred over time
- [ ] T020: Create API route `/api/speed/download` serving binary test data
- [ ] T021: Add progress callback for real-time speed updates

### 2.2 Upload Speed Measurement
- [ ] T022: Create upload test function with parallel POST requests
- [ ] T023: Generate random binary data for upload payloads
- [ ] T024: Calculate Mbps from bytes uploaded over time
- [ ] T025: Create API route `/api/speed/upload` to receive and discard upload data
- [ ] T026: Add progress callback for real-time speed updates

### 2.3 Ping/Latency Measurement
- [ ] T027: Create ping test function with multiple HEAD requests
- [ ] T028: Calculate average ping and jitter (standard deviation)
- [ ] T029: Create API route `/api/speed/ping` for latency measurement
- [ ] T030: Add progress callback for real-time ping updates

### 2.4 Speed Test Orchestrator
- [ ] T031: Create `useSpeedTest` hook to manage test lifecycle
- [ ] T032: Implement test sequence: ping → download → upload
- [ ] T033: Add abort/cancel functionality
- [ ] T034: Handle errors and retries gracefully
- [ ] T035: Save results to database after test completion

### 2.5 Real-Time UI
- [ ] T036: Create SpeedGauge component with animated SVG/canvas
- [ ] T037: Create ProgressBar component for test phases
- [ ] T038: Create TestRunner component orchestrating the UI
- [ ] T039: Create ResultCard component to display final results
- [ ] T040: Add 60fps animations using requestAnimationFrame

## Phase 3: Dashboard & History

### 3.1 Main Dashboard
- [ ] T041: Create dashboard page with QuickTest button
- [ ] T042: Create DashboardHeader with quick stats
- [ ] T043: Create ISPCard component showing ISP information
- [ ] T044: Create RecentResults component showing last 5 tests
- [ ] T045: Implement ISP detection using ip-api.com or similar

### 3.2 Speed History
- [ ] T046: Create history page with interactive chart
- [ ] T047: Create SpeedChart component using recharts
- [ ] T048: Create DateFilter component (7d, 30d, 90d, 1y, all)
- [ ] T049: Create StatsSummary with avg/min/max/median
- [ ] T050: Implement data aggregation for chart display
- [ ] T051: Create ExportButton for CSV export

### 3.3 API Routes for Results
- [ ] T052: Create `GET /api/results` - fetch results with date filtering
- [ ] T053: Create `POST /api/results` - save new result
- [ ] T054: Create `DELETE /api/results` - delete results (clear history)
- [ ] T055: Create `GET /api/results/stats` - get aggregated statistics

## Phase 4: Server Selection & Sharing

### 4.1 Server Registry
- [ ] T056: Create server registry with default test servers
- [ ] T057: Create ServerList component with latency display
- [ ] T058: Create ServerCard component with location info
- [ ] T059: Implement auto-detect best server logic
- [ ] T060: Create servers page for manual selection
- [ ] T061: Add server preference to UserPreferences

### 4.2 Share Functionality
- [ ] T062: Create ShareModal component
- [ ] T063: Implement image generation using html-to-image
- [ ] T064: Implement copy results as formatted text
- [ ] T065: Generate shareable URL with encoded results
- [ ] T066: Add social media share buttons (Twitter, Facebook, LinkedIn)

## Phase 5: Settings & Polish

### 5.1 Settings Page
- [ ] T067: Create settings page layout
- [ ] T068: Implement theme settings (light/dark/system)
- [ ] T069: Implement test parameter settings (duration, connections)
- [ ] T070: Implement data retention settings
- [ ] T071: Add clear history with confirmation dialog
- [ ] T072: Persist settings to UserPreferences table

### 5.2 Browser Network API Integration
- [ ] T073: Create network-api.ts utility using Network Information API
- [ ] T074: Display connection type (4g, 3g, etc.) in UI
- [ ] T075: Use Resource Timing API for additional metrics
- [ ] T076: Add fallback when Network API not available

### 5.3 Testing
- [ ] T077: Write unit tests for speed test engine functions
- [ ] T078: Write unit tests for utility functions (formatters, calculations)
- [ ] T079: Write integration tests for API routes
- [ ] T080: Write E2E test for complete speed test flow
- [ ] T081: Write E2E test for history page
- [ ] T082: Write E2E test for settings page

### 5.4 Performance & Polish
- [ ] T083: Optimize bundle size and code splitting
- [ ] T084: Add loading states and skeleton screens
- [ ] T085: Add error boundaries for graceful error handling
- [ ] T086: Run Lighthouse audit and fix issues (target 90+)
- [ ] T087: Add SEO metadata and Open Graph tags
- [ ] T088: Add sitemap.xml and robots.txt
- [ ] T089: Test cross-browser compatibility
- [ ] T090: Test responsive design on mobile/tablet/desktop

## Priority Order

### Sprint 1 (Foundation + Core Engine)
T001-T010, T017-T021, T027-T030, T031-T035, T036-T040

### Sprint 2 (Dashboard + History)
T011-T016, T041-T055

### Sprint 3 (Servers + Sharing + Settings)
T056-T076

### Sprint 4 (Testing + Polish)
T077-T090
