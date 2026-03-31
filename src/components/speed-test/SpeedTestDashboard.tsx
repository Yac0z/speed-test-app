'use client';

import { useCallback, useEffect, useState } from 'react';
import { CyberBackground } from '@/components/CyberBackground';
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
    return { text: 'INITIALIZE', variant: 'primary' as const, action: 'start' as const };
  }
  if (phase === 'ping' || phase === 'download' || phase === 'upload') {
    return { text: 'ABORT', variant: 'danger' as const, action: 'cancel' as const };
  }
  return { text: 'RE-TEST', variant: 'primary' as const, action: 'start' as const };
}

export function SpeedTestDashboard() {
  const { state, startTest, cancelTest, results } = useSpeedTest();
  const [testHistory, setTestHistory] = useState<SavedResult[]>([]);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch('/api/results');
        if (response.ok) {
          const data: { id: number; timestamp: string; downloadMbps: number; uploadMbps: number; pingMs: number; jitterMs: number }[] = await response.json();
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

  const isTesting = state.phase === 'ping' || state.phase === 'download' || state.phase === 'upload';

  return (
    <div className="relative min-h-screen overflow-hidden bg-cyber-dark">
      <CyberBackground />

      {/* Top accent line */}
      <div className="fixed left-0 right-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-cyan-neon to-transparent" />

      <div className={`relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="mb-2 inline-flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isTesting ? 'animate-pulse bg-cyan-neon shadow-[0_0_8px_#00f0ff]' : 'bg-slate-600'}`} />
            <span className="text-xs font-mono tracking-widest text-cyan-neon/60 uppercase">
              {isTesting ? `${state.phase} test active` : 'System ready'}
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            <span className="cyber-text-glow text-cyan-neon">SPEED</span>
            <span className="text-white/90"> TEST</span>
          </h1>
          <p className="mt-2 font-mono text-sm text-slate-500">
            // network diagnostics v2.0
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Test Area */}
          <div className="lg:col-span-2">
            <div className="cyber-card p-6">
              <SpeedGauge
                currentSpeed={state.currentSpeed}
                phase={state.phase}
                progress={state.progress}
              />

              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleButtonClick}
                  className={`cyber-btn relative rounded-lg px-10 py-4 text-lg font-bold tracking-wider text-white uppercase transition-all duration-300 ${
                    buttonConfig.variant === 'danger'
                      ? 'bg-red-600/80 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]'
                      : 'bg-cyan-neon/10 text-cyan-neon shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:bg-cyan-neon/20 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] border border-cyan-neon/30 hover:border-cyan-neon/60'
                  }`}
                >
                  <span className="relative z-10">{buttonConfig.text}</span>
                </button>
              </div>

              {state.phase === 'complete' && results && (
                <div className="mt-8 animate-fade-in-up">
                  <TestResults
                    results={results}
                    onComplete={handleTestComplete}
                  />
                </div>
              )}

              {saving && (
                <p className="mt-4 text-center font-mono text-sm text-cyan-neon/60">
                  {'> Saving results...'}
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <ISPInfo />
            </div>

            {testHistory.length > 0 && (
              <div className="cyber-card p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-mono font-semibold tracking-wider text-cyan-neon uppercase">
                    {'>'} Recent Tests
                  </h3>
                  <span className="text-xs text-slate-600 font-mono">
                    [{testHistory.length}]
                  </span>
                </div>
                <div className="space-y-2">
                  {testHistory.slice(0, 5).map((result, i) => (
                    <div
                      key={result.timestamp.toISOString()}
                      className="flex items-center justify-between rounded-lg bg-slate-900/50 p-3 font-mono text-xs transition-colors hover:bg-slate-800/50"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <span className="text-slate-500">
                        {result.timestamp.toLocaleTimeString()}
                      </span>
                      <div className="flex gap-3">
                        <span className="text-green-neon">
                          ↓{result.download.toFixed(1)}
                        </span>
                        <span className="text-blue-400">
                          ↑{result.upload.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer accent */}
        <footer className="mt-12 text-center">
          <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          <p className="mt-4 font-mono text-xs text-slate-700">
            {'//'} powered by next.js {'//'} {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}
