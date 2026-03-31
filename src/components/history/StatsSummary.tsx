type SpeedResult = {
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
  jitterMs: number;
};

type StatsSummaryProps = {
  results: SpeedResult[];
};

function calculateStats(values: number[]) {
  if (values.length === 0) {
    return { avg: 0, min: 0, max: 0, median: 0 };
  }

  const sorted = [...values].toSorted((a, b) => a - b);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
      : (sorted[mid] ?? 0);

  return {
    avg: sum / values.length,
    min: sorted[0] ?? 0,
    max: sorted.at(-1) ?? 0,
    median,
  };
}

export function StatsSummary(props: StatsSummaryProps) {
  const { results } = props;

  const downloadStats = calculateStats(results.map((r) => r.downloadMbps));
  const uploadStats = calculateStats(results.map((r) => r.uploadMbps));
  const pingStats = calculateStats(results.map((r) => r.pingMs));

  const stats = [
    {
      label: 'Download',
      color: 'text-green-400',
      unit: 'Mbps',
      ...downloadStats,
    },
    {
      label: 'Upload',
      color: 'text-blue-400',
      unit: 'Mbps',
      ...uploadStats,
    },
    {
      label: 'Ping',
      color: 'text-yellow-400',
      unit: 'ms',
      ...pingStats,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4"
        >
          <h4 className={`mb-3 font-semibold ${stat.color}`}>{stat.label}</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-slate-500">Avg</span>
              <p className="text-white">
                {stat.avg.toFixed(1)} {stat.unit}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Median</span>
              <p className="text-white">
                {stat.median.toFixed(1)} {stat.unit}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Min</span>
              <p className="text-white">
                {stat.min.toFixed(1)} {stat.unit}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Max</span>
              <p className="text-white">
                {stat.max.toFixed(1)} {stat.unit}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
