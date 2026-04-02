/** Shared type definitions for the speed test engine. */

/** Result of a completed speed test measurement. */
export type SpeedTestResult = {
  /** Download speed in Mbps */
  download: number;
  /** Upload speed in Mbps */
  upload: number;
  /** Latency in milliseconds */
  ping: number;
  /** Jitter in milliseconds */
  jitter: number;
  /** ISO 8601 timestamp of when the test completed */
  timestamp: string;
};

/** Network connection information from a geolocation service. */
export type ConnectionInfo = {
  /** Public IP address */
  ip: string;
  /** Internet service provider name */
  isp: string;
  /** City name */
  city: string;
  /** Region or state */
  region: string;
  /** Country name */
  country: string;
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
};

/** Current phase of a running speed test. */
export type TestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'complete';

/** Configuration options for running a speed test. */
export type TestConfig = {
  /** Duration in seconds per measurement phase (default: 10) */
  duration?: number;
  /** Number of parallel connections to use (default: 4) */
  connections?: number;
  /** Which phases to run (default: all three) */
  phases?: ('download' | 'upload' | 'ping')[];
};

/** Callback invoked when the test phase changes. */
export type PhaseChangeCallback = (phase: TestPhase) => void;

/** Callback invoked with progress updates during a phase. */
export type ProgressCallback = (phase: TestPhase, progress: number) => void;

/** Options for running a speed test with callbacks. */
export type RunSpeedTestOptions = {
  config?: TestConfig;
  onPhaseChange?: PhaseChangeCallback;
  onProgress?: ProgressCallback;
  signal?: AbortSignal;
};
