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
        const response = await fetch(
          'http://ip-api.com/json/?fields=status,message,country,regionName,city,isp,org,as,query'
        );
        const data = await response.json();
        if (data.status === 'success' && !cancelled) {
          setIspData({
            ip: data.query,
            org: data.org ?? data.isp,
            city: data.city,
            region: data.regionName,
            country: data.country,
          });
        }
      } catch {
        // Silently fail - ISP info is optional
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadISPData();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded bg-slate-700" />
          <div className="h-3 w-32 rounded bg-slate-700" />
          <div className="h-3 w-28 rounded bg-slate-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm">
      <h3 className="mb-4 text-lg font-semibold text-white">Connection Info</h3>
      {ispData ? (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">ISP</span>
            <span className="text-white">{ispData.org}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">IP Address</span>
            <span className="font-mono text-white">{ispData.ip}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Location</span>
            <span className="text-white">
              {ispData.city}, {ispData.country}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400">
          Unable to detect ISP information
        </p>
      )}
    </div>
  );
}
