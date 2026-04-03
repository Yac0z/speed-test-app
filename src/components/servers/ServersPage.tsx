'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTheme } from '@/components/ThemeProvider';

type Server = {
  id: number;
  name: string;
  location: string;
  url: string;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  latency?: number;
};

const DEFAULT_SERVERS: Server[] = [
  {
    id: 1,
    name: 'Auto Detect',
    location: 'Nearest to you',
    url: '/api/speed',
    latitude: null,
    longitude: null,
    isActive: true,
  },
  {
    id: 2,
    name: 'Local Server',
    location: 'Your Network',
    url: '/api/speed',
    latitude: null,
    longitude: null,
    isActive: true,
  },
  {
    id: 3,
    name: 'Cloudflare',
    location: 'Global Edge',
    url: 'https://speed.cloudflare.com',
    latitude: null,
    longitude: null,
    isActive: true,
  },
  {
    id: 4,
    name: 'Fast.com',
    location: 'Netflix CDN',
    url: 'https://fast.com',
    latitude: null,
    longitude: null,
    isActive: true,
  },
];

export function ServersPage() {
  const { resolvedTheme } = useTheme();
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingLatency, setTestingLatency] = useState<number | null>(null);

  const measureLatency = useCallback(
    async (server: Server): Promise<number> => {
      const start = performance.now();
      try {
        await fetch(`${server.url}/ping?t=${Date.now()}`, {
          method: 'HEAD',
          cache: 'no-store',
          mode: server.url.startsWith('http') ? 'cors' : 'same-origin',
        });
        return performance.now() - start;
      } catch {
        return -1;
      }
    },
    []
  );

  const testAllLatencies = useCallback(async () => {
    const updated = [...servers];
    for (const server of updated) {
      setTestingLatency(server.id);
      const latency = await measureLatency(server);
      server.latency = latency;
      setServers([...updated]);
    }
    setTestingLatency(null);
  }, [servers, measureLatency]);

  useEffect(() => {
    const loadServers = async () => {
      try {
        const response = await fetch('/api/servers');
        if (response.ok) {
          const data: Server[] = await response.json();
          setServers(data);
        } else {
          setServers(DEFAULT_SERVERS);
        }
      } catch {
        setServers(DEFAULT_SERVERS);
      } finally {
        setLoading(false);
      }
    };

    void loadServers();
  }, []);

  const bgClass =
    resolvedTheme === 'dark'
      ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900'
      : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100';

  if (loading) {
    return (
      <div className={`min-h-screen ${bgClass} p-4 sm:p-6 lg:p-8`}>
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-slate-700" />
            {[1, 2, 3, 4].map((i) => (
              <div
                key={`server-skeleton-${i}`}
                className="h-20 rounded-2xl bg-slate-800/50"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} p-4 sm:p-6 lg:p-8`}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Test Servers
            </h1>
            <p className="mt-1 text-slate-400">
              Select a server for speed testing
            </p>
          </div>
          <button
            type="button"
            onClick={testAllLatencies}
            disabled={testingLatency !== null}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {testingLatency === null ? 'Test Latency' : 'Testing...'}
          </button>
        </div>

        <div className="space-y-3">
          {servers.map((server) => (
            <div
              key={server.id}
              className="flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 backdrop-blur-sm"
            >
              <div>
                <h3 className="font-semibold text-white">{server.name}</h3>
                <p className="text-sm text-slate-400">{server.location}</p>
              </div>
              <div className="flex items-center gap-4">
                {server.latency !== undefined && server.latency > 0 && (
                  <div className="text-right">
                    <span className="text-sm text-slate-400">Latency</span>
                    <p className="font-mono text-lg font-bold text-green-400">
                      {server.latency.toFixed(0)} ms
                    </p>
                  </div>
                )}
                {server.latency === -1 && (
                  <span className="text-sm text-red-400">Unavailable</span>
                )}
                {testingLatency === server.id && (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
