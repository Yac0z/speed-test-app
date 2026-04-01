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

const TEST_DURATION = 10_000;
const WARMUP_DURATION = 2_000;
const PARALLEL_CONNECTIONS = 6;
const DOWNLOAD_CHUNK_SIZE = 5 * 1024 * 1024;

export function useSpeedTest(): UseSpeedTestReturn {
  const [state, setState] = useState<SpeedTestState>({
    phase: 'idle',
    currentSpeed: 0,
    progress: 0,
  });
  const [results, setResults] = useState<SpeedTestResult | null>(null);
  const abortRef = useRef(false);
  const speedUpdatesRef = useRef<number[]>([]);

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
        samples.push(performance.now() - start);
      } catch {
        // skip
      }

      setState((prev) => ({
        ...prev,
        currentSpeed: samples.at(-1) ?? 0,
        progress: (samples.length / 20) * 15,
      }));
    }

    const validSamples = samples.filter((s) => s > 0);
    const avgPing =
      validSamples.length > 0
        ? validSamples.reduce((a, b) => a + b, 0) / validSamples.length
        : 0;

    let jitter = 0;
    if (validSamples.length > 1) {
      const diffs: number[] = [];
      for (let i = 1; i < validSamples.length; i += 1) {
        const current = validSamples[i];
        const previous = validSamples[i - 1];
        if (current !== undefined && previous !== undefined) {
          diffs.push(Math.abs(current - previous));
        }
      }
      jitter = diffs.length > 0 ? diffs.reduce((a, b) => a + b, 0) / diffs.length : 0;
    }

    return { ping: avgPing, jitter };
  }, []);

  const measureDownload = useCallback(async (): Promise<number> => {
    const samples: number[] = [];
    const startTime = performance.now();
    let totalBytes = 0;
    let isWarmup = true;
    speedUpdatesRef.current = [];

    const downloadStream = async () => {
      while (
        performance.now() - startTime < TEST_DURATION + WARMUP_DURATION &&
        !abortRef.current
      ) {
        try {
          const response = await fetch(
            `/api/speed/download?size=${DOWNLOAD_CHUNK_SIZE}&t=${Date.now()}-${Math.random()}`,
            { cache: 'no-store' }
          );

          if (!response.body) break;

          const reader = response.body.getReader();
          let chunkBytes = 0;

          // eslint-disable-next-line no-constant-condition
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            chunkBytes += value.length;
            const now = performance.now();
            const elapsed = (now - startTime) / 1000;

            if (elapsed > 0) {
              const instantSpeed = (chunkBytes * 8) / (elapsed * 1_000_000);
              speedUpdatesRef.current.push(instantSpeed);

              // Update UI every few chunks for smooth gauge animation
              setState((prev) => ({
                ...prev,
                currentSpeed: instantSpeed,
                progress: isWarmup
                  ? 15 + (elapsed / (WARMUP_DURATION / 1000)) * 10
                  : 25 +
                    Math.min(
                      ((elapsed - WARMUP_DURATION / 1000) /
                        (TEST_DURATION / 1000)) *
                        35,
                      35
                    ),
              }));
            }
          }

          totalBytes += chunkBytes;

          // Mark warmup complete
          if (isWarmup && performance.now() - startTime > WARMUP_DURATION) {
            isWarmup = false;
            totalBytes = 0; // Reset bytes counted during warmup
            samples.length = 0; // Clear samples from warmup
          }

          // Record sample after warmup
          if (!isWarmup) {
            const elapsed = (performance.now() - startTime) / 1000;
            const speedMbps = (totalBytes * 8) / (elapsed * 1_000_000);
            samples.push(speedMbps);
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

    if (samples.length === 0) return 0;

    // Use percentile-based calculation (80th percentile) for accuracy
    const sorted = [...samples].sort((a, b) => a - b);
    const p80Index = Math.floor(sorted.length * 0.8);
    return sorted[Math.min(p80Index, sorted.length - 1)] ?? 0;
  }, []);

  const measureUpload = useCallback(async (): Promise<number> => {
    const samples: number[] = [];
    const startTime = performance.now();
    let totalBytes = 0;
    let isWarmup = true;
    speedUpdatesRef.current = [];

    const UPLOAD_CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks
    const uploadData = new Blob([new ArrayBuffer(UPLOAD_CHUNK_SIZE)]);

    const uploadStream = async () => {
      while (
        performance.now() - startTime < TEST_DURATION + WARMUP_DURATION &&
        !abortRef.current
      ) {
        const fetchStart = performance.now();
        try {
          await fetch('/api/speed/upload', {
            method: 'POST',
            body: uploadData,
          });

          const elapsed = (performance.now() - fetchStart) / 1000;
          const instantSpeed =
            (UPLOAD_CHUNK_SIZE * 8) / (elapsed * 1_000_000);

          // Mark warmup complete
          if (isWarmup && performance.now() - startTime > WARMUP_DURATION) {
            isWarmup = false;
            totalBytes = 0;
            samples.length = 0;
          }

          if (!isWarmup) {
            totalBytes += UPLOAD_CHUNK_SIZE;
            const totalElapsed =
              (performance.now() - startTime - WARMUP_DURATION) / 1000;
            if (totalElapsed > 0) {
              const speedMbps = (totalBytes * 8) / (totalElapsed * 1_000_000);
              samples.push(speedMbps);
            }
          }

          setState((prev) => ({
            ...prev,
            currentSpeed: instantSpeed,
            progress: isWarmup
              ? 60 +
                ((performance.now() - startTime) / WARMUP_DURATION) * 10
              : 70 +
                Math.min(
                  ((performance.now() - startTime - WARMUP_DURATION) /
                    TEST_DURATION) *
                    30,
                  30
                ),
          }));
        } catch {
          break;
        }
      }
    };

    const workers = Array.from({ length: PARALLEL_CONNECTIONS }, () =>
      uploadStream()
    );
    await Promise.all(workers);

    if (samples.length === 0) return 0;

    const sorted = [...samples].sort((a, b) => a - b);
    const p80Index = Math.floor(sorted.length * 0.8);
    return sorted[Math.min(p80Index, sorted.length - 1)] ?? 0;
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

      setState((prev) => ({ ...prev, phase: 'upload', progress: 60 }));
      const upload = await measureUpload();

      if (abortRef.current) return;

      const result: SpeedTestResult = {
        timestamp: new Date().toISOString(),
        download,
        upload,
        ping,
        jitter,
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
