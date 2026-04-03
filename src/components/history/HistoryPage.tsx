'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback } from 'react';
import { DateFilter } from '@/components/history/DateFilter';
import { ExportButton } from '@/components/history/ExportButton';
import { getResults, deleteAllResults } from '@/utils/SpeedTestStorage';

const SpeedChart = dynamic(
   async () =>
    import('@/components/history/SpeedChart').then((mod) => ({
      default: mod.SpeedChart,
    })),
  {
    loading: () => (
      <div className="h-[300px] animate-pulse rounded-lg bg-slate-800/50" />
    ),
    ssr: false,
  }
);
import { StatsSummary } from '@/components/history/StatsSummary';

type SpeedResult = {
  id: string;
  timestamp: string;
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
  jitterMs: number;
};

type DateRange = '7d' | '30d' | '90d' | '1y' | 'all';

function loadResults(): SpeedResult[] {
  const data = getResults();
  return data.map((r) => ({
    id: r.id,
    timestamp: r.timestamp,
    downloadMbps: r.download,
    uploadMbps: r.upload,
    pingMs: r.ping,
    jitterMs: r.jitter,
  }));
}

export function HistoryPage() {
  const [results, setResults] = useState<SpeedResult[]>([]);
  const [mounted, setMounted] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  useEffect(() => {
    setMounted(true);
    setResults(loadResults());
  }, []);

  const handleClearAll = useCallback(() => {
    if (window.confirm('Clear all speed test history?')) {
      deleteAllResults();
      setResults([]);
    }
  }, []);

  const filteredResults = results.filter((result) => {
    if (dateRange === 'all') {return true;}
    const now = new Date();
    const testDate = new Date(result.timestamp);
    const diffMs = now.getTime() - testDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    switch (dateRange) {
      case '7d': {
        return diffDays <= 7;
      }
      case '30d': {
        return diffDays <= 30;
      }
      case '90d': {
        return diffDays <= 90;
      }
      case '1y': {
        return diffDays <= 365;
      }
      default: {
        return true;
      }
    }
  });

  if (!mounted) {
    return (
      <div className="min-h-screen bg-cyber-dark p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-slate-800" />
            <div className="h-64 rounded-2xl bg-slate-800/50" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={`skeleton-${i}`}
                  className="h-24 rounded-2xl bg-slate-800/50"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-dark p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Speed History
            </h1>
            <p className="mt-1 text-slate-400">
              {filteredResults.length} test
              {filteredResults.length === 1 ? '' : 's'} recorded
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DateFilter value={dateRange} onChange={setDateRange} />
            {results.length > 0 && (
              <>
                <ExportButton results={filteredResults} />
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="rounded border border-red-500/30 px-3 py-2 font-mono text-xs text-red-400/80 transition-all hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-400"
                >
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-12 text-center backdrop-blur-sm">
            <p className="text-lg text-slate-400">
              {results.length === 0
                ? 'No speed tests recorded yet'
                : 'No tests in selected date range'}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Run a speed test to start tracking your history
            </p>
          </div>
        ) : (
          <>
            {/* Chart */}
            <div className="mb-6 rounded-2xl border border-slate-700/50 bg-slate-800/50 p-4 backdrop-blur-sm sm:p-6">
              <SpeedChart results={filteredResults} />
            </div>

            {/* Stats */}
            <StatsSummary results={filteredResults} />

            {/* Recent Tests Table */}
            <div className="mt-6 rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="px-4 py-3 text-left text-slate-400">
                        Date
                      </th>
                      <th className="px-4 py-3 text-right text-green-400">
                        Download
                      </th>
                      <th className="px-4 py-3 text-right text-blue-400">
                        Upload
                      </th>
                      <th className="px-4 py-3 text-right text-yellow-400">
                        Ping
                      </th>
                      <th className="px-4 py-3 text-right text-purple-400">
                        Jitter
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.slice(0, 20).map((result) => (
                      <tr
                        key={result.id}
                        className="border-b border-slate-700/30 transition-colors hover:bg-slate-700/20"
                      >
                        <td className="px-4 py-3 text-slate-300">
                          {new Date(result.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-green-400">
                          {result.downloadMbps.toFixed(1)} Mbps
                        </td>
                        <td className="px-4 py-3 text-right text-blue-400">
                          {result.uploadMbps.toFixed(1)} Mbps
                        </td>
                        <td className="px-4 py-3 text-right text-yellow-400">
                          {result.pingMs.toFixed(0)} ms
                        </td>
                        <td className="px-4 py-3 text-right text-purple-400">
                          {result.jitterMs.toFixed(1)} ms
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
