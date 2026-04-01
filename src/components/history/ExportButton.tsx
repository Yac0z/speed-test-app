'use client';

import { useState } from 'react';

type SpeedResult = {
  id: string | number;
  timestamp: string;
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
  jitterMs: number;
};

type ExportButtonProps = {
  results: SpeedResult[];
};

export function ExportButton(props: ExportButtonProps) {
  const { results } = props;
  const [exporting, setExporting] = useState(false);

  const exportCSV = () => {
    setExporting(true);

    const headers = [
      'Date',
      'Download (Mbps)',
      'Upload (Mbps)',
      'Ping (ms)',
      'Jitter (ms)',
    ];
    const rows = results.map((r) => [
      new Date(r.timestamp).toISOString(),
      r.downloadMbps.toFixed(2),
      r.uploadMbps.toFixed(2),
      r.pingMs.toFixed(2),
      r.jitterMs.toFixed(2),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `speed-test-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setExporting(false);
  };

  return (
    <button
      type="button"
      onClick={exportCSV}
      disabled={exporting || results.length === 0}
      className="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {exporting ? 'Exporting...' : 'Export CSV'}
    </button>
  );
}
