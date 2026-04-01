'use client';

import { useEffect, useState } from 'react';

type ISPData = {
  ip: string;
  org: string;
  city: string;
  region: string;
  country: string;
};

export function ISPInfo() {
  const [ispData, setIspData] = useState<ISPData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadISPData() {
      try {
        const response = await fetch('/api/isp', { cache: 'no-store' });
        if (!response.ok) return;
        const data: ISPData = await response.json();
        if (!cancelled) setIspData(data);
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadISPData();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="cyber-card p-6">
        <div className="mb-4 font-mono text-xs text-cyan-neon/60 uppercase tracking-wider">
          {'>'} Connection Info
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-3 w-24 rounded bg-slate-800" />
          <div className="h-3 w-32 rounded bg-slate-800" />
          <div className="h-3 w-28 rounded bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-card p-6">
      <div className="mb-4 font-mono text-xs text-cyan-neon/60 uppercase tracking-wider">
        {'>'} Connection Info
      </div>
      {ispData ? (
        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between rounded-lg bg-slate-900/50 px-3 py-2">
            <span className="text-slate-500">ISP</span>
            <span className="text-cyan-neon/80">{ispData.org}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-900/50 px-3 py-2">
            <span className="text-slate-500">IP</span>
            <span className="text-purple-neon/80">{ispData.ip}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-900/50 px-3 py-2">
            <span className="text-slate-500">LOC</span>
            <span className="text-green-neon/80">
              {ispData.city}, {ispData.country}
            </span>
          </div>
        </div>
      ) : (
        <p className="font-mono text-xs text-slate-600">
          {'//'} Unable to detect ISP
        </p>
      )}
    </div>
  );
}
