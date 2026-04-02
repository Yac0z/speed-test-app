/** Cloudflare speed test engine using direct HTTP requests to edge endpoints. */

import { EventEmitter } from 'node:events';
import {
  type SpeedTestResult,
  type TestConfig,
  type TestPhase,
  type PhaseChangeCallback,
  type ProgressCallback,
} from './types.js';

const DOWNLOAD_URL = 'https://speed.cloudflare.com/__down';
const UPLOAD_URL = 'https://speed.cloudflare.com/__up';

/** Default configuration values. */
const DEFAULT_CONFIG: Required<TestConfig> = {
  duration: 10,
  connections: 4,
  phases: ['ping', 'download', 'upload'],
};

/** Emitter for test progress events. */
class TestEmitter extends EventEmitter {
  onPhaseChange(callback: PhaseChangeCallback): void {
    this.on('phaseChange', callback);
  }

  onProgress(callback: ProgressCallback): void {
    this.on('progress', callback);
  }
}

/**
 * Measures latency by sending small requests and timing round-trip.
 */
async function measurePing(
  count: number,
  signal?: AbortSignal,
): Promise<{ ping: number; jitter: number }> {
  const latencies: number[] = [];

  for (let i = 0; i < count; i++) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    const start = performance.now();
    try {
      const response = await fetch(`${DOWNLOAD_URL}?bytes=0`, { signal });
      if (!response.ok) {
        throw new Error(`Ping request failed: ${response.status}`);
      }
      await response.arrayBuffer();
      const elapsed = performance.now() - start;
      latencies.push(elapsed);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }
      // Skip failed requests but continue
      continue;
    }
  }

  if (latencies.length === 0) {
    throw new Error('All ping requests failed');
  }

  const ping = latencies.reduce((a, b) => a + b, 0) / latencies.length;

  let jitter = 0;
  if (latencies.length > 1) {
    const diffs: number[] = [];
    for (let i = 1; i < latencies.length; i++) {
      const prev = latencies[i - 1];
      const curr = latencies[i];
      if (prev !== undefined && curr !== undefined) {
        diffs.push(Math.abs(curr - prev));
      }
    }
    jitter = diffs.length > 0 ? diffs.reduce((a, b) => a + b, 0) / diffs.length : 0;
  }

  return { ping, jitter };
}

/**
 * Measures download bandwidth by downloading chunks of data.
 */
async function measureDownload(
  durationMs: number,
  parallelConnections: number,
  signal?: AbortSignal,
  onProgress?: ProgressCallback,
): Promise<number> {
  const startTime = performance.now();
  let totalBytes = 0;
  let chunkSize = 1_000_000; // Start with 1MB chunks
  const completedRequests: number[] = [];

  async function downloadChunk(): Promise<void> {
    while (performance.now() - startTime < durationMs) {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      const requestStart = performance.now();
      try {
        const response = await fetch(`${DOWNLOAD_URL}?bytes=${chunkSize}`, {
          signal,
        });
        if (!response.ok) {
          throw new Error(`Download request failed: ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        const requestDuration = performance.now() - requestStart;
        totalBytes += buffer.byteLength;
        completedRequests.push(requestDuration);

        // Adjust chunk size based on request duration
        if (requestDuration < 200 && chunkSize < 25_000_000) {
          chunkSize = Math.min(chunkSize * 2, 25_000_000);
        } else if (requestDuration > 2000 && chunkSize > 100_000) {
          chunkSize = Math.max(chunkSize / 2, 100_000);
        }

        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        onProgress?.('download', progress);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw error;
        }
        // Skip failed requests but continue
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }

  // Run parallel connections
  const workers = Array.from({ length: parallelConnections }, () => downloadChunk());
  await Promise.allSettled(workers);

  const elapsedSeconds = (performance.now() - startTime) / 1000;
  const bits = totalBytes * 8;
  const bps = elapsedSeconds > 0 ? bits / elapsedSeconds : 0;

  return bps;
}

/**
 * Measures upload bandwidth by uploading chunks of data.
 */
async function measureUpload(
  durationMs: number,
  parallelConnections: number,
  signal?: AbortSignal,
  onProgress?: ProgressCallback,
): Promise<number> {
  const startTime = performance.now();
  let totalBytes = 0;
  let chunkSize = 1_000_000; // Start with 1MB chunks

  async function uploadChunk(): Promise<void> {
    while (performance.now() - startTime < durationMs) {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      const requestStart = performance.now();
      try {
        const data = new Uint8Array(chunkSize);
        const response = await fetch(UPLOAD_URL, {
          method: 'POST',
          body: data,
          signal,
        });
        if (!response.ok) {
          throw new Error(`Upload request failed: ${response.status}`);
        }
        await response.arrayBuffer();

        const requestDuration = performance.now() - requestStart;
        totalBytes += chunkSize;

        // Adjust chunk size based on request duration
        if (requestDuration < 200 && chunkSize < 25_000_000) {
          chunkSize = Math.min(chunkSize * 2, 25_000_000);
        } else if (requestDuration > 2000 && chunkSize > 100_000) {
          chunkSize = Math.max(chunkSize / 2, 100_000);
        }

        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        onProgress?.('upload', progress);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw error;
        }
        // Skip failed requests but continue
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }

  // Run parallel connections
  const workers = Array.from({ length: parallelConnections }, () => uploadChunk());
  await Promise.allSettled(workers);

  const elapsedSeconds = (performance.now() - startTime) / 1000;
  const bits = totalBytes * 8;
  const bps = elapsedSeconds > 0 ? bits / elapsedSeconds : 0;

  return bps;
}

/**
 * Runs a complete speed test and returns the results.
 *
 * @param options - Configuration and callbacks for the test
 * @returns Promise resolving to the test results
 * @throws {Error} If the test is aborted or all requests fail
 *
 * @example
 * ```typescript
 * const result = await runSpeedTest({
 *   config: { duration: 10, connections: 4 },
 *   onPhaseChange: (phase) => console.log(`Phase: ${phase}`),
 *   onProgress: (phase, progress) => console.log(`${phase}: ${Math.round(progress * 100)}%`),
 * });
 * ```
 */
export async function runSpeedTest(options?: {
  config?: TestConfig;
  onPhaseChange?: PhaseChangeCallback;
  onProgress?: ProgressCallback;
  signal?: AbortSignal;
}): Promise<SpeedTestResult> {
  const config = { ...DEFAULT_CONFIG, ...options?.config };
  const emitter = new TestEmitter();

  options?.onPhaseChange && emitter.onPhaseChange(options.onPhaseChange);
  options?.onProgress && emitter.onProgress(options.onProgress);

  const signal = options?.signal;
  const durationMs = config.duration * 1000;

  let ping = 0;
  let jitter = 0;
  let downloadBps = 0;
  let uploadBps = 0;

  // Run phases in configured order
  for (const phase of config.phases) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    switch (phase) {
      case 'ping': {
        emitter.emit('phaseChange', 'ping' as TestPhase);
        const pingResult = await measurePing(20, signal);
        ping = pingResult.ping;
        jitter = pingResult.jitter;
        break;
      }
      case 'download': {
        emitter.emit('phaseChange', 'download' as TestPhase);
        downloadBps = await measureDownload(
          durationMs,
          config.connections,
          signal,
          options?.onProgress,
        );
        break;
      }
      case 'upload': {
        emitter.emit('phaseChange', 'upload' as TestPhase);
        uploadBps = await measureUpload(
          durationMs,
          config.connections,
          signal,
          options?.onProgress,
        );
        break;
      }
    }
  }

  emitter.emit('phaseChange', 'complete' as TestPhase);

  // Convert bps to Mbps (1 Mbps = 1,000,000 bps)
  const downloadMbps = downloadBps / 1_000_000;
  const uploadMbps = uploadBps / 1_000_000;

  return {
    download: Math.round(downloadMbps * 100) / 100,
    upload: Math.round(uploadMbps * 100) / 100,
    ping: Math.round(ping * 100) / 100,
    jitter: Math.round(jitter * 100) / 100,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Creates an AbortController for canceling a running test.
 *
 * @returns An AbortController instance
 *
 * @example
 * ```typescript
 * const controller = createAbortController();
 * const resultPromise = runSpeedTest({ signal: controller.signal });
 * // Later, to cancel:
 * controller.abort();
 * ```
 */
export function createAbortController(): AbortController {
  return new AbortController();
}
