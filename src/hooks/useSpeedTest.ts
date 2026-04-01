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

const DOWNLOAD_DURATION = 10_000;
const UPLOAD_DURATION = 10_000;
const WARMUP_DURATION = 2_000;
const PARALLEL_CONNECTIONS = 6;

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

    for (let i = 0; i < 20; i += 1) {
      if (abortRef.current) break;

      const start = performance.now();
      try {
        await fetch(`/api/speed/ping?t=${Date.now()}-${i}`, {
          method: 'HEAD',
          cache: 'no-store',
        });
        const duration = performance.now() - start;
        if (duration > 0) samples.push(duration);
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

    const avgPing = samples.reduce((a, b) => a + b, 0) / samples.length;

    let jitter = 0;
    if (samples.length > 1) {
      const diffs: number[] = [];
      for (let i = 1; i < samples.length; i += 1) {
        const a = samples[i];
        const b = samples[i - 1];
        if (a !== undefined && b !== undefined) {
          diffs.push(Math.abs(a - b));
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
    let warmupDone = false;
    let measurementStartTime = 0;

    const worker = async () => {
      while (!abortRef.current) {
        const elapsed = performance.now() - startTime;
        if (elapsed > DOWNLOAD_DURATION + WARMUP_DURATION) break;

        try {
          const response = await fetch(
            `/api/speed/download?size=10000000&t=${Date.now()}-${Math.random()}`,
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

            // Update gauge with instantaneous speed
            const now = performance.now();
            const totalElapsed = (now - startTime) / 1000;
            if (totalElapsed > 0.1) {
              const instantMbps = (chunkBytes * 8) / (totalElapsed * 1_000_000);
              setState((prev) => ({
                ...prev,
                currentSpeed: instantMbps,
                progress: 15 + Math.min((totalElapsed / ((DOWNLOAD_DURATION + WARMUP_DURATION) / 1000)) * 35, 35),
              }));
            }
          }

          // Track bytes for measurement
          if (!warmupDone) {
            warmupBytes += chunkBytes;
            if (performance.now() - startTime > WARMUP_DURATION) {
              warmupDone = true;
              measurementStartTime = performance.now();
              totalBytes = 0;
            }
          }

          if (warmupDone) {
            totalBytes += chunkBytes;
          }
        } catch {
          break;
        }
      }
    };

    await Promise.all(Array.from({ length: PARALLEL_CONNECTIONS }, () => worker()));

    const measurementElapsed = (performance.now() - measurementStartTime) / 1000;
    if (measurementElapsed > 0 && totalBytes > 0) {
      return (totalBytes * 8) / (measurementElapsed * 1_000_000);
    }
    return 0;
  }, []);

  const measureUpload = useCallback(async (): Promise<number> => {
    const startTime = performance.now();
    let totalBytes = 0;
    let warmupDone = false;
    let measurementStartTime = 0;

    const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB
    const uploadData = new Blob([new ArrayBuffer(CHUNK_SIZE)]);

    const worker = async () => {
      while (!abortRef.current) {
        const elapsed = performance.now() - startTime;
        if (elapsed > UPLOAD_DURATION + WARMUP_DURATION) break;

        try {
          const fetchStart = performance.now();
          await fetch('/api/speed/upload', {
            method: 'POST',
            body: uploadData,
          });
          const fetchElapsed = performance.now() - fetchStart;

          // Update gauge
          if (fetchElapsed > 0) {
            const instantMbps = (CHUNK_SIZE * 8) / (fetchElapsed * 1_000_000);
            setState((prev) => ({
              ...prev,
              currentSpeed: instantMbps,
              progress: 50 + Math.min((elapsed / ((UPLOAD_DURATION + WARMUP_DURATION) / 1000)) * 50, 50),
            }));
          }

          // Track bytes after warmup
          if (!warmupDone && elapsed > WARMUP_DURATION) {
            warmupDone = true;
            measurementStartTime = performance.now();
            totalBytes = 0;
          }

          if (warmupDone) {
            totalBytes += CHUNK_SIZE;
          }
        } catch {
          break;
        }
      }
    };

    await Promise.all(Array.from({ length: PARALLEL_CONNECTIONS }, () => worker()));

    const measurementElapsed = (performance.now() - measurementStartTime) / 1000;
    if (measurementElapsed > 0 && totalBytes > 0) {
      return (totalBytes * 8) / (measurementElapsed * 1_000_000);
    }
    return 0;
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

      setResults({
        timestamp: new Date().toISOString(),
        download: Math.round(download * 100) / 100,
        upload: Math.round(upload * 100) / 100,
        ping: Math.round(ping * 100) / 100,
        jitter: Math.round(jitter * 100) / 100,
      });
      setState({ phase: 'complete', currentSpeed: 0, progress: 100 });
    } catch {
      setState({ phase: 'idle', currentSpeed: 0, progress: 0 });
    }
  }, [measurePing, measureDownload, measureUpload]);

  const cancelTest = useCallback(() => {
    abortRef.current = true;
    setState({ phase: 'idle', currentSpeed: 0, progress: 0 });
  }, []);

  return { state, results, startTest, cancelTest };
}
