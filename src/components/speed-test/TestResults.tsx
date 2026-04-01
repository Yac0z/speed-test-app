'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
const ShareModal = dynamic(
  () => import('@/components/share/ShareModal').then(mod => ({ default: mod.ShareModal })),
  { ssr: false }
);

type MetricCard = {
  label: string;
  value: string;
  unit: string;
  color: string;
  icon: string;
};

type TestResultsProps = {
  results: {
    download: number;
    upload: number;
    ping: number;
    jitter: number;
    timestamp: string;
  };
};

export function TestResults(props: TestResultsProps) {
  const { results } = props;
  const [showShare, setShowShare] = useState(false);

  const metrics: MetricCard[] = [
    { label: 'DOWNLOAD', value: results.download.toFixed(1), unit: 'Mbps', color: 'from-green-500/20 to-green-500/5 border-green-500/30', icon: '↓' },
    { label: 'UPLOAD', value: results.upload.toFixed(1), unit: 'Mbps', color: 'from-blue-500/20 to-blue-500/5 border-blue-500/30', icon: '↑' },
    { label: 'PING', value: results.ping.toFixed(0), unit: 'ms', color: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30', icon: '◉' },
    { label: 'JITTER', value: results.jitter.toFixed(1), unit: 'ms', color: 'from-purple-500/20 to-purple-500/5 border-purple-500/30', icon: '〰' },
  ];

  return (
    <>
      <div className="mt-6">
        <div className="mb-4 font-mono text-xs text-cyan-neon/60 uppercase tracking-wider">
          {'>'} Test Results
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {metrics.map((metric, i) => (
            <div
              key={metric.label}
              className={`cyber-card rounded-xl bg-gradient-to-br p-4 text-center transition-all duration-500 ${metric.color}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="mb-1 text-lg opacity-60">{metric.icon}</div>
              <div className="font-mono text-2xl font-bold text-white sm:text-3xl">
                {metric.value}
              </div>
              <div className="mt-1 font-mono text-[10px] tracking-wider text-slate-400 uppercase">
                {metric.label}
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-slate-600">
                {metric.unit}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => setShowShare(true)}
          className="cyber-btn rounded-lg border border-cyan-neon/20 bg-cyan-neon/5 px-6 py-2.5 font-mono text-sm tracking-wider text-cyan-neon/80 uppercase transition-all hover:border-cyan-neon/40 hover:bg-cyan-neon/10 hover:text-cyan-neon"
        >
          Share Results
        </button>
      </div>

      {showShare && (
        <ShareModal
          results={{
            download: results.download,
            upload: results.upload,
            ping: results.ping,
            jitter: results.jitter,
          }}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
}
