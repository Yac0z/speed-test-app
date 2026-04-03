import SpeedTest from '@cloudflare/speedtest';
import { useState, useCallback, useRef, useEffect } from 'react';

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

export function useSpeedTest(): UseSpeedTestReturn {
  const [state, setState] = useState<SpeedTestState>({
    phase: 'idle',
    currentSpeed: 0,
    progress: 0,
  });
  const [results, setResults] = useState<SpeedTestResult | null>(null);
  const speedTestRef = useRef<SpeedTest | null>(null);

  useEffect(() => () => {
      if (speedTestRef.current) {
        speedTestRef.current.pause();
      }
    }, []);

  const startTest = useCallback(() => {
    if (speedTestRef.current) {
      speedTestRef.current.restart();
      return;
    }

    setState({ phase: 'ping', currentSpeed: 0, progress: 0 });
    setResults(null);

    const st = new SpeedTest({
      autoStart: true,
      downloadApiUrl: 'https://speed.cloudflare.com/__down',
      uploadApiUrl: 'https://speed.cloudflare.com/__up',
      latencyPercentile: 0.5,
      bandwidthPercentile: 0.9,
      bandwidthMinRequestDuration: 10,
      bandwidthFinishRequestDuration: 1000,
      measureDownloadLoadedLatency: true,
      measureUploadLoadedLatency: true,
    });

    st.onRunningChange = (running: boolean) => {
      if (!running) {
        setState((prev) => ({ ...prev, phase: 'complete' as TestPhase }));
      }
    };

    st.onResultsChange = ({ type }: { type: string }) => {
      const r = st.results;
      if (type === 'latency') {
        const latency = r.getUnloadedLatency() ?? 0;
        setState((prev) => ({
          ...prev,
          phase: 'ping',
          currentSpeed: latency,
          progress: 10,
        }));
      } else if (type === 'download') {
        const downloadBps = r.getDownloadBandwidth() ?? 0;
        const downloadMbps = downloadBps / 1_000_000;
        setState((prev) => ({
          ...prev,
          phase: 'download',
          currentSpeed: downloadMbps,
          progress: 30,
        }));
      } else if (type === 'upload') {
        const uploadBps = r.getUploadBandwidth() ?? 0;
        const uploadMbps = uploadBps / 1_000_000;
        setState((prev) => ({
          ...prev,
          phase: 'upload',
          currentSpeed: uploadMbps,
          progress: 65,
        }));
      }
    };

    st.onFinish = (r) => {
      const downloadBps = r.getDownloadBandwidth() ?? 0;
      const uploadBps = r.getUploadBandwidth() ?? 0;
      const latency = r.getUnloadedLatency() ?? 0;
      const jitter = r.getUnloadedJitter() ?? 0;

      setResults({
        timestamp: new Date().toISOString(),
        download: Math.round((downloadBps / 1_000_000) * 100) / 100,
        upload: Math.round((uploadBps / 1_000_000) * 100) / 100,
        ping: Math.round(latency * 100) / 100,
        jitter: Math.round(jitter * 100) / 100,
      });
      setState({ phase: 'complete', currentSpeed: 0, progress: 100 });
    };

    st.onError = (error: string) => {
      console.error('Speed test error:', error);
      setState({ phase: 'idle', currentSpeed: 0, progress: 0 });
    };

    speedTestRef.current = st;
  }, []);

  const cancelTest = useCallback(() => {
    if (speedTestRef.current) {
      speedTestRef.current.pause();
      speedTestRef.current = null;
    }
    setState({ phase: 'idle', currentSpeed: 0, progress: 0 });
  }, []);

  return {
    state,
    results,
    startTest,
    cancelTest,
  };
}
