# Specification: Internet Speed Test Application

## Overview
A modern, privacy-first internet speed test web application that measures download speed, upload speed, and latency. Features a comprehensive dashboard with speed history tracking, ISP detection, customizable server selection, and shareable results.

## User Personas

### Primary Users
- **Home Users** - Want to verify their ISP is delivering promised speeds
- **Remote Workers** - Need to ensure their connection meets work requirements
- **Gamers** - Require low latency and stable connections
- **IT Professionals** - Need to diagnose and document network issues

## Functional Requirements

### FR-1: Speed Measurement
- **FR-1.1**: Measure download speed using parallel chunked HTTP downloads
- **FR-1.2**: Measure upload speed using parallel chunked HTTP uploads
- **FR-1.3**: Measure latency (ping) with multiple samples for accuracy
- **FR-1.4**: Display real-time speed during measurement with animated gauge
- **FR-1.5**: Support both browser-based Network API measurements and custom backend server tests

### FR-2: Dashboard
- **FR-2.1**: Display current test results prominently (download, upload, ping, jitter)
- **FR-2.2**: Show ISP information (name, IP address, connection type)
- **FR-2.3**: Display speed history as interactive charts (daily, weekly, monthly, yearly)
- **FR-2.4**: Show connection quality score based on combined metrics
- **FR-2.5**: Provide quick-start one-click speed test button

### FR-3: Speed History
- **FR-3.1**: Automatically save all test results locally
- **FR-3.2**: Display historical data in interactive line/bar charts
- **FR-3.3**: Allow filtering by date range
- **FR-3.4**: Show statistics: average, min, max, median speeds
- **FR-3.5**: Export history as CSV

### FR-4: Server Selection
- **FR-4.1**: Auto-detect nearest/fastest test server
- **FR-4.2**: Allow manual server selection from available servers
- **FR-4.3**: Display server location and distance
- **FR-4.4**: Show server latency before running test
- **FR-4.5**: Support custom server URLs for self-hosted backends

### FR-5: ISP Detection
- **FR-5.1**: Detect and display ISP name
- **FR-5.2**: Show public IP address (IPv4 and IPv6)
- **FR-5.3**: Display approximate geographic location
- **FR-5.4**: Show connection type (fiber, cable, DSL, cellular)
- **FR-5.5**: Display network information (Network Information API)

### FR-6: Result Sharing
- **FR-6.1**: Generate shareable result cards as images
- **FR-6.2**: Copy results to clipboard as formatted text
- **FR-6.3**: Generate shareable URL with encoded results
- **FR-6.4**: Social media sharing (Twitter, Facebook, LinkedIn)

### FR-7: Settings
- **FR-7.1**: Theme toggle (light/dark/system)
- **FR-7.2**: Configure test parameters (duration, parallel connections)
- **FR-7.3**: Set default server preference
- **FR-7.4**: Data retention settings
- **FR-7.5**: Clear history option

## Non-Functional Requirements

### NFR-1: Performance
- Initial page load under 2 seconds on 3G
- Speed test accuracy within 5% of industry standards
- 60fps animations during test execution
- Lighthouse score 90+ across all categories

### NFR-2: Reliability
- Graceful degradation when features unavailable
- Retry logic for failed test segments
- Offline indicator when connection lost
- Error handling with user-friendly messages

### NFR-3: Privacy
- No data sent to third parties without consent
- All history stored locally (IndexedDB/SQLite)
- No tracking cookies or analytics by default
- Clear data option with one click

### NFR-4: Compatibility
- Support Chrome 120+, Firefox 120+, Safari 17+, Edge 120+
- Responsive design: mobile, tablet, desktop
- Works on both IPv4 and IPv6 networks

## User Stories

### US-1: Quick Speed Test
> As a home user, I want to run a speed test with one click so I can quickly check my internet performance.

**Acceptance Criteria:**
- Landing page has prominent "Start Test" button
- Test runs automatically: ping → download → upload
- Results displayed with animated gauges
- Results saved to history automatically

### US-2: View Speed History
> As a remote worker, I want to see my speed history over time so I can identify patterns and report issues to my ISP.

**Acceptance Criteria:**
- History page with interactive charts
- Filter by date range (7d, 30d, 90d, 1y, all)
- Show avg/min/max statistics
- Export to CSV option

### US-3: Compare Servers
> As a gamer, I want to test against different servers so I can find the best connection for my needs.

**Acceptance Criteria:**
- Server selection dropdown with latency display
- Auto-recommended server highlighted
- Manual override option
- Server distance shown

### US-4: Share Results
> As an IT professional, I want to share speed test results with my team so we can document network performance.

**Acceptance Criteria:**
- Generate image card with results
- Copy formatted text to clipboard
- Share via social media links
- Generate shareable URL

### US-5: ISP Information
> As a consumer, I want to see my ISP details so I can verify I'm getting what I pay for.

**Acceptance Criteria:**
- Display ISP name and IP address
- Show connection type when available
- Display approximate location
- Show network technology info

## Data Model

### SpeedTestResult
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique identifier |
| timestamp | datetime | When test was performed |
| downloadMbps | number | Download speed in Mbps |
| uploadMbps | number | Upload speed in Mbps |
| pingMs | number | Average ping in milliseconds |
| jitterMs | number | Ping variation in milliseconds |
| serverId | string | Test server identifier |
| serverName | string | Test server display name |
| serverLocation | string | Server geographic location |
| ispName | string | Detected ISP name |
| ipAddress | string | Public IP address |
| connectionType | string | Network connection type |
| downloadSamples | number[] | Individual download samples |
| uploadSamples | number[] | Individual upload samples |
| pingSamples | number[] | Individual ping samples |

### Server
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| name | string | Display name |
| location | string | Geographic location |
| url | string | Server endpoint URL |
| latitude | number | Geographic latitude |
| longitude | number | Geographic longitude |
| isActive | boolean | Whether server is available |

### UserPreferences
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier (singleton) |
| theme | enum | light, dark, system |
| defaultServerId | string | Preferred test server |
| testDuration | number | Test duration in seconds |
| parallelConnections | number | Number of parallel streams |
| dataRetentionDays | number | How long to keep history |
| lastUpdated | datetime | Last preference update |
