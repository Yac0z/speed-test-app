import { useState, useCallback, useRef } from 'react';

export type TestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'complete';

export type SpeedTestResult = {
  timestamp: Date;
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

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
const TEST_DURATION = 10_000; // 10 seconds
const PARALLEL_CONNECTIONS = 4;

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
    const url = `/api/speed/ping?t=${Date.now()}`;

    for (let i = 0; i < 10; i += 1) {
      if (abortRef.current) {
        break;
      }

      const start = performance.now();
      try {
        await fetch(url, { method: 'HEAD', cache: 'no-store' });
        const duration = performance.now() - start;
        samples.push(duration);
      } catch {
        samples.push(0);
      }

      // Update progress during ping test
      const lastSample = samples.at(-1) ?? 0;
      setState((prev) => ({
        ...prev,
        currentSpeed: lastSample,
        progress: (samples.length / 10) * 20,
      }));
    }

    const validSamples = samples.filter((s) => s > 0);
    let avgPing = 0;
    if (validSamples.length > 0) {
      let sum = 0;
      for (const sample of validSamples) {
        sum += sample;
      }
      avgPing = sum / validSamples.length;
    }

    let jitter = 0;
    if (validSamples.length > 1) {
      let diffSum = 0;
      for (let i = 1; i < validSamples.length; i += 1) {
        const current = validSamples[i];
        const previous = validSamples[i - 1];
        if (current !== undefined && previous !== undefined) {
          diffSum += Math.abs(current - previous);
        }
      }
      jitter = diffSum / (validSamples.length - 1);
    }

    return { ping: avgPing, jitter };
  }, []);

  const measureDownload = useCallback(async (): Promise<number> => {
    const samples: number[] = [];
    const startTime = performance.now();
    let totalBytes = 0;

    const downloadChunk = async () => {
      while (
        performance.now() - startTime < TEST_DURATION &&
        !abortRef.current
      ) {
        try {
          const response = await fetch(
            `/api/speed/download?size=${CHUNK_SIZE}&t=${Date.now()}`,
            { cache: 'no-store' }
          );
          const blob = await response.blob();
          totalBytes += blob.size;
          const elapsed = (performance.now() - startTime) / 1000;
          const speedMbps = (totalBytes * 8) / (elapsed * 1_000_000);

          samples.push(speedMbps);
          setState((prev) => ({
            ...prev,
            currentSpeed: speedMbps,
            progress:
              20 + Math.min((elapsed / (TEST_DURATION / 1000)) * 40, 40),
          }));
        } catch {
          break;
        }
      }
    };

    // Run parallel downloads
    const workers = Array.from({ length: PARALLEL_CONNECTIONS }, async () =>
      downloadChunk()
    );
    await Promise.all(workers);

    return samples.length > 0
      ? samples
          .slice(Math.floor(samples.length * 0.1))
          .reduce((a, b) => a + b, 0) /
          samples.slice(Math.floor(samples.length * 0.1)).length
      : 0;
  }, []);

  const measureUpload = useCallback(async (): Promise<number> => {
    const samples: number[] = [];
    const startTime = performance.now();
    let totalBytes = 0;

    const uploadChunk = async () => {
      while (
        performance.now() - startTime < TEST_DURATION &&
        !abortRef.current
      ) {
        const data = new Blob([new ArrayBuffer(CHUNK_SIZE / 4)]);
        try {
          await fetch('/api/speed/upload', {
            method: 'POST',
            body: data,
          });
          totalBytes += data.size;
          const elapsed = (performance.now() - startTime) / 1000;
          const speedMbps = (totalBytes * 8) / (elapsed * 1_000_000);

          samples.push(speedMbps);
          setState((prev) => ({
            ...prev,
            currentSpeed: speedMbps,
            progress:
              60 + Math.min((elapsed / (TEST_DURATION / 1000)) * 40, 40),
          }));
        } catch {
          break;
        }
      }
    };

    const workers = Array.from({ length: PARALLEL_CONNECTIONS }, async () =>
      uploadChunk()
    );
    await Promise.all(workers);

    return samples.length > 0
      ? samples
          .slice(Math.floor(samples.length * 0.1))
          .reduce((a, b) => a + b, 0) /
          samples.slice(Math.floor(samples.length * 0.1)).length
      : 0;
  }, []);

  const startTest = useCallback(async () => {
    abortRef.current = false;
    setState({ phase: 'ping', currentSpeed: 0, progress: 0 });
    setResults(null);

    try {
      // Phase 1: Ping test
      setState((prev) => ({ ...prev, phase: 'ping' }));
      const { ping, jitter } = await measurePing();

      if (abortRef.current) {
        return;
      }

      // Phase 2: Download test
      setState((prev) => ({ ...prev, phase: 'download', progress: 20 }));
      const download = await measureDownload();

      if (abortRef.current) {
        return;
      }

      // Phase 3: Upload test
      setState((prev) => ({ ...prev, phase: 'upload', progress: 60 }));
      const upload = await measureUpload();

      if (abortRef.current) {
        return;
      }

      // Complete
      const result: SpeedTestResult = {
        timestamp: new Date(),
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
