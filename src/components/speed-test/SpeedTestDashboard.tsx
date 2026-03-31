'use client';

import { useState, useCallback, useEffect } from 'react';
import { ISPInfo } from '@/components/speed-test/ISPInfo';
import { SpeedGauge } from '@/components/speed-test/SpeedGauge';
import { TestResults } from '@/components/speed-test/TestResults';
import { useSpeedTest } from '@/hooks/useSpeedTest';
import type { SpeedTestResult } from '@/hooks/useSpeedTest';

type SavedResult = SpeedTestResult & { id?: number };

function getButtonContent(
  phase: 'idle' | 'ping' | 'download' | 'upload' | 'complete'
) {
  if (phase === 'idle') {
    return {
      text: 'Start Test',
      variant: 'primary' as const,
      action: 'start' as const,
    };
  }
  if (phase === 'ping' || phase === 'download' || phase === 'upload') {
    return {
      text: 'Cancel',
      variant: 'danger' as const,
      action: 'cancel' as const,
    };
  }
  return {
    text: 'Test Again',
    variant: 'primary' as const,
    action: 'start' as const,
  };
}

export function SpeedTestDashboard() {
  const { state, startTest, cancelTest, results } = useSpeedTest();

  const [testHistory, setTestHistory] = useState<SavedResult[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch('/api/results');
        if (response.ok) {
          const data: {
            id: number;
            timestamp: string;
            downloadMbps: number;
            uploadMbps: number;
            pingMs: number;
            jitterMs: number;
          }[] = await response.json();
          const mapped: SavedResult[] = data.map((r) => ({
            id: r.id,
            timestamp: new Date(r.timestamp),
            download: r.downloadMbps,
            upload: r.uploadMbps,
            ping: r.pingMs,
            jitter: r.jitterMs,
          }));
          setTestHistory(mapped.slice(0, 50));
        }
      } catch {
        // Silently fail
      }
    };
    void loadHistory();
  }, []);

  const saveResult = useCallback(async (result: SpeedTestResult) => {
    setSaving(true);
    try {
      await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          download: result.download,
          upload: result.upload,
          ping: result.ping,
          jitter: result.jitter,
        }),
      });
    } catch {
      // Silently fail
    } finally {
      setSaving(false);
    }
  }, []);

  const handleTestComplete = useCallback(
    (result: SpeedTestResult) => {
      setTestHistory((prev) => [result, ...prev].slice(0, 50));
      void saveResult(result);
    },
    [saveResult]
  );

  const buttonConfig = getButtonContent(state.phase);

  const handleButtonClick = () => {
    if (buttonConfig.action === 'start') {
      startTest();
    } else {
      cancelTest();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Internet Speed Test
          </h1>
          <p className="mt-2 text-slate-400">
            Test your connection speed with precision
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Test Area */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm">
              <SpeedGauge
                currentSpeed={state.currentSpeed}
                phase={state.phase}
                progress={state.progress}
              />

              <div className="mt-6 flex justify-center gap-4">
                <button
                  type="button"
                  onClick={handleButtonClick}
                  className={`rounded-full px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all active:scale-95 ${
                    buttonConfig.variant === 'danger'
                      ? 'bg-red-600 shadow-red-500/25 hover:bg-red-500'
                      : 'bg-blue-600 shadow-blue-500/25 hover:bg-blue-500 hover:shadow-blue-500/40'
                  }`}
                >
                  {buttonConfig.text}
                </button>
              </div>

              {state.phase === 'complete' && results && (
                <TestResults
                  results={results}
                  onComplete={handleTestComplete}
                />
              )}

              {saving && (
                <p className="mt-4 text-center text-sm text-slate-400">
                  Saving results...
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ISPInfo />

            {/* Quick Stats */}
            {testHistory.length > 0 && (
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm">
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Recent Tests
                </h3>
                <div className="space-y-3">
                  {testHistory.slice(0, 5).map((result) => (
                    <div
                      key={result.timestamp.toISOString()}
                      className="flex items-center justify-between rounded-lg bg-slate-700/30 p-3"
                    >
                      <div className="text-sm text-slate-400">
                        {result.timestamp.toLocaleTimeString()}
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-400">
                          ↓ {result.download.toFixed(1)} Mbps
                        </span>
                        <span className="text-blue-400">
                          ↑ {result.upload.toFixed(1)} Mbps
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
