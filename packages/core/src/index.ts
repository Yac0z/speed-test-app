/** @speedtest/core - Shared speed test engine and utilities. */

// Types
export {
  type SpeedTestResult,
  type ConnectionInfo,
  type TestPhase,
  type TestConfig,
  type PhaseChangeCallback,
  type ProgressCallback,
  type RunSpeedTestOptions,
} from './types.js';

// Engine
export { runSpeedTest, createAbortController } from './engine.js';

// Storage
export {
  getResults,
  saveResult,
  deleteAllResults,
  exportResults,
} from './storage.js';

// Connection
export { getConnectionInfo } from './connection.js';
