import { useState, useCallback, useRef } from 'react';

export type TestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'complete';

export type SpeedTestResult = {
  timestamp: string;
  download: number;
  upload: number;
  ping: number;
  jitter: number;
};

type SpeedTestState = {
  phase: TestPhase;
  currentSpeed: number;
  progress: number;
};

type UseSpeedTestReturn = {
  state: SpeedTestState;
  results: SpeedTestResult | null;
  startTest: () => void;
  cancelTest: () => void;
};

// Test configuration
const DOWNLOAD_DURATION = 10_000;
const UPLOAD_DURATION = 10_000;
const WARMUP_DURATION = 2_000;
const PARALLEL_CONNECTIONS = 6;
const DOWNLOAD_CHUNK_SIZE = 25 * 1024 * 1024; // 25MB per request
const UPLOAD_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per upload
const SPEED_SAMPLE_INTERVAL = 200; // Calculate speed every 200ms

export function useSpeedTest(): UseSpeedTestReturn {
  const [state, setState] = useState<SpeedTestState>({
    phase: 'idle',
    currentSpeed: 0,
    progress: 0,
  });
  const [results, setResults] = useState<SpeedTestResult | null>(null);
  const abortRef = useRef(false);

  const measurePing = useCallback(async (): Promise<{
    ping: number;
    jitter: number;
  }> => {
    const samples: number[] = [];
    const baseUrl = '/api/speed/ping';

    for (let i = 0; i < 20; i += 1) {
      if (abortRef.current) break;

      const start = performance.now();
      try {
        await fetch(`${baseUrl}?t=${Date.now()}-${i}`, {
          method: 'HEAD',
          cache: 'no-store',
        });
        const duration = performance.now() - start;
        if (duration > 0) {
          samples.push(duration);
        }
      } catch {
        // skip
      }

      setState((prev) => ({
        ...prev,
        currentSpeed: samples.at(-1) ?? 0,
        progress: (samples.length / 20) * 15,
      }));
    }

    if (samples.length === 0) return { ping: 0, jitter: 0 };

    // Remove outliers: discard fastest 10% and slowest 10%
    const sorted = [...samples].sort((a, b) => a - b);
    const trimCount = Math.max(1, Math.floor(sorted.length * 0.1));
    const trimmed = sorted.slice(trimCount, sorted.length - trimCount);

    const avgPing =
      trimmed.length > 0
        ? trimmed.reduce((a, b) => a + b, 0) / trimmed.length
        : samples.reduce((a, b) => a + b, 0) / samples.length;

    let jitter = 0;
    if (trimmed.length > 1) {
      const diffs: number[] = [];
      for (let i = 1; i < trimmed.length; i += 1) {
        const current = trimmed[i];
        const previous = trimmed[i - 1];
        if (current !== undefined && previous !== undefined) {
          diffs.push(Math.abs(current - previous));
        }
      }
      jitter = diffs.length > 0 ? diffs.reduce((a, b) => a + b, 0) / diffs.length : 0;
    }

    return { ping: avgPing, jitter };
  }, []);

  const measureDownload = useCallback(async (): Promise<number> => {
    const startTime = performance.now();
    let totalBytes = 0;
    let warmupBytes = 0;
    let measurementStarted = false;
    let measurementStart = 0;

    // Speed samples: bytes measured in each interval
    const speedSamples: number[] = [];
    let lastSampleTime = startTime;
    let lastSampleBytes = 0;

    const downloadStream = async () => {
      while (
        performance.now() - startTime < DOWNLOAD_DURATION + WARMUP_DURATION &&
        !abortRef.current
      ) {
        try {
          const response = await fetch(
            `/api/speed/download?size=${DOWNLOAD_CHUNK_SIZE}&t=${Date.now()}-${Math.random()}`,
            { cache: 'no-store' }
          );

          if (!response.body) break;

          const reader = response.body.getReader();

          // eslint-disable-next-line no-constant-condition
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const now = performance.now();
            const bytesReceived = value.length;
            totalBytes += bytesReceived;

            if (!measurementStarted) {
              warmupBytes += bytesReceived;
              if (now - startTime > WARMUP_DURATION) {
                measurementStarted = true;
                measurementStart = now;
                totalBytes = 0; // Reset: only count bytes after warmup
                warmupBytes = 0;
                lastSampleTime = now;
                lastSampleBytes = 0;
                speedSamples.length = 0;
              }
            }

            if (measurementStarted) {
              // Calculate speed in current interval
              const intervalBytes = totalBytes;
              const intervalSeconds = (now - measurementStart) / 1000;

              if (intervalSeconds > 0) {
                const speedMbps = (intervalBytes * 8) / (intervalSeconds * 1_000_000);

                // Sample every SPEED_SAMPLE_INTERVAL ms
                if (now - lastSampleTime >= SPEED_SAMPLE_INTERVAL) {
                  const sampleBytes = totalBytes - lastSampleBytes;
                  const sampleSeconds = (now - lastSampleTime) / 1000;
                  if (sampleSeconds > 0) {
                    const sampleSpeed = (sampleBytes * 8) / (sampleSeconds * 1_000_000);
                    speedSamples.push(sampleSpeed);
                  }
                  lastSampleTime = now;
                  lastSampleBytes = totalBytes;
                }

                setState((prev) => ({
                  ...prev,
                  currentSpeed: speedMbps,
                  progress: 15 + Math.min(
                    ((now - startTime) / (DOWNLOAD_DURATION + WARMUP_DURATION)) * 35,
                    35
                  ),
                }));
              }
            }
          }
        } catch {
          break;
        }
      }
    };

    const workers = Array.from({ length: PARALLEL_CONNECTIONS }, () =>
      downloadStream()
    );
    await Promise.all(workers);

    if (speedSamples.length === 0) {
      // Fallback: calculate from total
      const elapsed = (performance.now() - measurementStart) / 1000;
      if (elapsed > 0 && totalBytes > 0) {
        return (totalBytes * 8) / (elapsed * 1_000_000);
      }
      return 0;
    }

    // Remove outliers: discard lowest 10% and highest 10%
    const sorted = [...speedSamples].sort((a, b) => a - b);
    const trimCount = Math.max(1, Math.floor(sorted.length * 0.1));
    const trimmed = sorted.slice(trimCount, sorted.length - trimCount);

    // Use median of trimmed samples
    const mid = Math.floor(trimmed.length / 2);
    if (trimmed.length % 2 === 0) {
      const a = trimmed[mid - 1];
      const b = trimmed[mid];
      return a !== undefined && b !== undefined ? (a + b) / 2 : 0;
    }
    return trimmed[mid] ?? 0;
  }, []);

  const measureUpload = useCallback(async (): Promise<number> => {
    const startTime = performance.now();
    let totalBytes = 0;
    let measurementStarted = false;
    let measurementStart = 0;

    const speedSamples: number[] = [];
    let lastSampleTime = startTime;
    let lastSampleBytes = 0;

    // Generate upload data once (reused)
    const uploadData = new Blob([new ArrayBuffer(UPLOAD_CHUNK_SIZE)]);

    const uploadStream = async () => {
      while (
        performance.now() - startTime < UPLOAD_DURATION + WARMUP_DURATION &&
        !abortRef.current
      ) {
        const fetchStart = performance.now();
        try {
          await fetch('/api/speed/upload', {
            method: 'POST',
            body: uploadData,
          });

          const now = performance.now();
          const elapsed = (now - fetchStart) / 1000;

          if (elapsed > 0) {
            const instantSpeed = (UPLOAD_CHUNK_SIZE * 8) / (elapsed * 1_000_000);

            if (!measurementStarted) {
              if (now - startTime > WARMUP_DURATION) {
                measurementStarted = true;
                measurementStart = now;
                totalBytes = 0;
                lastSampleTime = now;
                lastSampleBytes = 0;
                speedSamples.length = 0;
              }
            }

            if (measurementStarted) {
              totalBytes += UPLOAD_CHUNK_SIZE;
              const totalElapsed = (now - measurementStart) / 1000;

              if (totalElapsed > 0) {
                const avgSpeed = (totalBytes * 8) / (totalElapsed * 1_000_000);

                // Sample every interval
                if (now - lastSampleTime >= SPEED_SAMPLE_INTERVAL) {
                  const sampleBytes = totalBytes - lastSampleBytes;
                  const sampleSeconds = (now - lastSampleTime) / 1000;
                  if (sampleSeconds > 0) {
                    const sampleSpeed = (sampleBytes * 8) / (sampleSeconds * 1_000_000);
                    speedSamples.push(sampleSpeed);
                  }
                  lastSampleTime = now;
                  lastSampleBytes = totalBytes;
                }

                setState((prev) => ({
                  ...prev,
                  currentSpeed: avgSpeed,
                  progress: 50 + Math.min(
                    ((now - startTime) / (UPLOAD_DURATION + WARMUP_DURATION)) * 50,
                    50
                  ),
                }));
              }
            }

            // Adaptive: if upload is fast, reduce wait; if slow, continue
            if (instantSpeed > 100 && elapsed < 0.5) {
              // Fast connection, continue immediately
            }
          }
        } catch {
          break;
        }
      }
    };

    const workers = Array.from({ length: PARALLEL_CONNECTIONS }, () =>
      uploadStream()
    );
    await Promise.all(workers);

    if (speedSamples.length === 0) {
      const elapsed = (performance.now() - measurementStart) / 1000;
      if (elapsed > 0 && totalBytes > 0) {
        return (totalBytes * 8) / (elapsed * 1_000_000);
      }
      return 0;
    }

    // Remove outliers: discard lowest 10% and highest 10%
    const sorted = [...speedSamples].sort((a, b) => a - b);
    const trimCount = Math.max(1, Math.floor(sorted.length * 0.1));
    const trimmed = sorted.slice(trimCount, sorted.length - trimCount);

    // Use median of trimmed samples
    const mid = Math.floor(trimmed.length / 2);
    if (trimmed.length % 2 === 0) {
      const a = trimmed[mid - 1];
      const b = trimmed[mid];
      return a !== undefined && b !== undefined ? (a + b) / 2 : 0;
    }
    return trimmed[mid] ?? 0;
  }, []);

  const startTest = useCallback(async () => {
    abortRef.current = false;
    setState({ phase: 'ping', currentSpeed: 0, progress: 0 });
    setResults(null);

    try {
      setState((prev) => ({ ...prev, phase: 'ping' }));
      const { ping, jitter } = await measurePing();

      if (abortRef.current) return;

      setState((prev) => ({ ...prev, phase: 'download', progress: 15 }));
      const download = await measureDownload();

      if (abortRef.current) return;

      setState((prev) => ({ ...prev, phase: 'upload', progress: 50 }));
      const upload = await measureUpload();

      if (abortRef.current) return;

      const result: SpeedTestResult = {
        timestamp: new Date().toISOString(),
        download: Math.round(download * 100) / 100,
        upload: Math.round(upload * 100) / 100,
        ping: Math.round(ping * 100) / 100,
        jitter: Math.round(jitter * 100) / 100,
      };

      setState({ phase: 'complete', currentSpeed: 0, progress: 100 });
      setResults(result);
    } catch (error) {
      console.error('Speed test failed:', error);
      setState({ phase: 'idle', currentSpeed: 0, progress: 0 });
    }
  }, [measurePing, measureDownload, measureUpload]);

  const cancelTest = useCallback(() => {
    abortRef.current = true;
    setState({ phase: 'idle', currentSpeed: 0, progress: 0 });
  }, []);

  return {
    state,
    results,
    startTest,
    cancelTest,
  };
}
