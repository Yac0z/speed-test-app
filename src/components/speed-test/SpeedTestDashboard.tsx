'use client';

import { useEffect, useState } from 'react';
import { CyberBackground } from '@/components/CyberBackground';
import { AdSlot } from '@/components/ads/AdSlot';
import { ISPInfo } from '@/components/speed-test/ISPInfo';
import { SpeedGauge } from '@/components/speed-test/SpeedGauge';
import { TestResults } from '@/components/speed-test/TestResults';
import { useTheme } from '@/components/ThemeProvider';
import { useSpeedTest } from '@/hooks/useSpeedTest';
import { getResults, saveResult } from '@/utils/SpeedTestStorage';

type SavedResult = {
  id: string;
  timestamp: string;
  download: number;
  upload: number;
  ping: number;
  jitter: number;
};

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

function DataStream({ delay, left }: { delay: number; left: string }) {
  return (
    <div
      className="pointer-events-none absolute top-0 h-24 w-px opacity-20"
      style={{
        left,
        background: 'linear-gradient(to bottom, transparent, #00f0ff, transparent)',
        animation: `data-stream ${3 + Math.random() * 4}s linear ${delay}s infinite`,
      }}
    />
  );
}

export function SpeedTestDashboard() {
  const { state, startTest, cancelTest, results } = useSpeedTest();
  const { resolvedTheme } = useTheme();
  const [testHistory, setTestHistory] = useState<SavedResult[]>([]);
  const [mounted, setMounted] = useState(false);
  const [typedText, setTypedText] = useState('');
  const fullText = '> establishing connection...';

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (state.phase !== 'idle') return;
    setTypedText('');
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [state.phase]);

  useEffect(() => {
    const stored = getResults();
    const mapped: SavedResult[] = stored.map((r) => ({
      id: r.id,
      timestamp: new Date(r.timestamp).toLocaleString(),
      download: r.download,
      upload: r.upload,
      ping: r.ping,
      jitter: r.jitter,
    }));
    setTestHistory(mapped.slice(0, 50));
  }, []);

  useEffect(() => {
    if (!results) return;
    const saved = saveResult({
      download: results.download,
      upload: results.upload,
      ping: results.ping,
      jitter: results.jitter,
    });
    setTestHistory((prev) => [{
      id: saved.id,
      timestamp: new Date(saved.timestamp).toLocaleString(),
      download: saved.download,
      upload: saved.upload,
      ping: saved.ping,
      jitter: saved.jitter,
    }, ...prev].slice(0, 50));
  }, [results]);

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
    <div className={`relative min-h-screen overflow-hidden ${resolvedTheme === 'dark' ? 'bg-cyber-dark' : 'bg-slate-50'}`}>
      <CyberBackground />

      {/* Top accent line */}
      <div className="fixed left-0 right-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-cyan-neon to-transparent" />

      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-10 opacity-[0.015]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.08) 2px, rgba(0,240,255,0.08) 4px)' }} />

      {/* Data streams */}
      {isTesting && (
        <>
          <DataStream delay={0} left="10%" />
          <DataStream delay={1.5} left="25%" />
          <DataStream delay={0.8} left="50%" />
          <DataStream delay={2.2} left="75%" />
          <DataStream delay={0.3} left="90%" />
        </>
      )}

      <div className={`relative z-20 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

        {/* Header */}
        <header className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full ${isTesting ? 'animate-pulse bg-cyan-neon shadow-[0_0_8px_#00f0ff]' : 'bg-slate-600'}`} />
            <span className="font-mono text-xs tracking-[0.2em] text-cyan-neon/60 uppercase">
              {isTesting ? `${state.phase}_phase active` : 'system_ready'}
            </span>
            {isTesting && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-neon/40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-neon" />
              </span>
            )}
          </div>

          {/* Glitch title */}
          <div className="relative inline-block group/title">
            <h1 className="text-5xl font-black tracking-tighter text-white sm:text-6xl">
              <span className="cyber-text-glow text-cyan-neon">SPEED</span>
              <span className="text-white/90"> TEST</span>
            </h1>
            <h1 className="absolute inset-0 text-5xl font-black tracking-tighter text-red-500/0 opacity-0 transition-all duration-75 group-hover/title:opacity-20 group-hover/title:translate-x-[3px] sm:text-6xl">
              <span className="text-red-500">SPEED</span>
              <span> TEST</span>
            </h1>
            <h1 className="absolute inset-0 text-5xl font-black tracking-tighter text-cyan-neon/0 opacity-0 transition-all duration-75 group-hover/title:opacity-20 group-hover/title:translate-x-[-3px] sm:text-6xl">
              <span className="text-cyan-neon">SPEED</span>
              <span> TEST</span>
            </h1>
          </div>

          <p className="mt-3 font-mono text-sm text-slate-500">
            // network diagnostics v2.0
          </p>

          <div className="mt-4 h-5 font-mono text-xs text-cyan-neon/40">
            <span>{typedText}</span>
            <span className="ml-0.5 inline-block h-4 w-2 bg-cyan-neon/40 animate-pulse" />
          </div>
        </header>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Main Test Area */}
          <div className="lg:col-span-2">
            <div className="relative flex flex-col items-center">

              <div className={`absolute top-0 h-80 w-80 rounded-full blur-3xl transition-all duration-1000 ${
                isTesting
                  ? 'bg-cyan-neon/5 scale-110'
                  : state.phase === 'complete'
                    ? 'bg-green-neon/5 scale-100'
                    : 'bg-transparent scale-90'
              }`} />

              <div className="relative w-full max-w-md">
                <div className={`absolute -top-4 left-1/2 h-px -translate-x-1/2 transition-all duration-500 ${
                  isTesting ? 'w-3/4 bg-gradient-to-r from-transparent via-cyan-neon/40 to-transparent' : 'w-1/2 bg-gradient-to-r from-transparent via-slate-700/50 to-transparent'
                }`} />

                <SpeedGauge
                  currentSpeed={state.currentSpeed}
                  phase={state.phase}
                  progress={state.progress}
                />

                <div className={`absolute -bottom-4 left-1/2 h-px -translate-x-1/2 transition-all duration-500 ${
                  isTesting ? 'w-3/4 bg-gradient-to-r from-transparent via-purple-neon/40 to-transparent' : 'w-1/2 bg-gradient-to-r from-transparent via-slate-700/50 to-transparent'
                }`} />
              </div>

              <div className="mt-10">
                <button
                  type="button"
                  onClick={handleButtonClick}
                  className={`cyber-btn group/btn relative rounded-sm px-16 py-5 text-lg font-bold tracking-[0.3em] uppercase transition-all duration-500 ${
                    buttonConfig.variant === 'danger'
                      ? 'bg-red-600/60 text-white shadow-[0_0_30px_rgba(239,68,68,0.2)] hover:bg-red-500 hover:shadow-[0_0_50px_rgba(239,68,68,0.4)]'
                      : 'bg-transparent text-cyan-neon shadow-[0_0_20px_rgba(0,240,255,0.1)] border border-cyan-neon/20 hover:border-cyan-neon/60 hover:shadow-[0_0_40px_rgba(0,240,255,0.25)]'
                  }`}
                >
                  <span className="absolute -left-1 -top-1 h-3 w-3 border-l border-t border-cyan-neon/40 transition-all group-hover/btn:border-cyan-neon" />
                  <span className="absolute -right-1 -top-1 h-3 w-3 border-r border-t border-cyan-neon/40 transition-all group-hover/btn:border-cyan-neon" />
                  <span className="absolute -bottom-1 -left-1 h-3 w-3 border-b border-l border-cyan-neon/40 transition-all group-hover/btn:border-cyan-neon" />
                  <span className="absolute -bottom-1 -right-1 h-3 w-3 border-b border-r border-cyan-neon/40 transition-all group-hover/btn:border-cyan-neon" />

                  <span className="relative z-10">{buttonConfig.text}</span>
                </button>
              </div>

              {state.phase === 'complete' && results && (
                <div className="mt-12 w-full animate-fade-in-up">
                  <TestResults results={results} />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <ISPInfo />
            </div>

            <AdSlot
              slotId={process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR ?? ''}
              format="vertical"
              className="mx-auto"
            />

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
                      key={result.id}
                      className="group/row flex items-center justify-between rounded-lg bg-slate-900/50 p-3 font-mono text-xs transition-all duration-300 hover:bg-slate-800/50 hover:shadow-[inset_0_0_10px_rgba(0,240,255,0.05)]"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <span className="text-slate-500 transition-colors group-hover/row:text-slate-400">
                        {result.timestamp}
                      </span>
                      <div className="flex gap-3">
                        <span className="text-green-neon transition-all group-hover/row:text-green-400 group-hover/row:drop-shadow-[0_0_4px_rgba(34,197,94,0.5)]">
                          ↓{result.download.toFixed(1)}
                        </span>
                        <span className="text-blue-400 transition-all group-hover/row:text-blue-300 group-hover/row:drop-shadow-[0_0_4px_rgba(96,165,250,0.5)]">
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

        <footer className="mt-16 text-center">
          <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          <p className="mt-4 font-mono text-xs text-slate-700">
            {'//'} powered by next.js {'//'} {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}
