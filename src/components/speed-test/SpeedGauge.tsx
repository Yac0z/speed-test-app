export type SpeedGaugeProps = {
  currentSpeed: number;
  phase: 'idle' | 'ping' | 'download' | 'upload' | 'complete';
  progress: number;
};

function getStrokeColor(percentage: number): string {
  if (percentage < 30) {
    return '#ef4444';
  }
  if (percentage < 60) {
    return '#eab308';
  }
  return '#22c55e';
}

export function SpeedGauge(props: SpeedGaugeProps) {
  const { currentSpeed, phase, progress } = props;

  // Gauge calculations
  const maxSpeed = 1000;
  const percentage = Math.min((currentSpeed / maxSpeed) * 100, 100);
  const angle = (percentage / 100) * 180;

  const phaseLabels = {
    idle: 'Ready',
    ping: 'Testing Ping...',
    download: 'Testing Download...',
    upload: 'Testing Upload...',
    complete: 'Test Complete',
  };

  return (
    <div className="flex flex-col items-center">
      {/* Phase indicator */}
      <div className="mb-4 text-sm font-medium text-slate-400">
        {phaseLabels[phase]}
      </div>

      {/* SVG Gauge */}
      <div className="relative h-64 w-64 sm:h-80 sm:w-80">
        <svg
          viewBox="0 0 200 120"
          className="h-full w-full"
          aria-label={`Speed gauge showing ${currentSpeed.toFixed(1)} Mbps`}
        >
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#334155"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Progress arc */}
          {percentage > 0 && (
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={getStrokeColor(percentage)}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(angle / 180) * 251.2} 251.2`}
              className="transition-all duration-150"
            />
          )}

          {/* Speed text */}
          <text
            x="100"
            y="85"
            textAnchor="middle"
            className="fill-white text-4xl font-bold"
            style={{ fontSize: '28px', fontWeight: 'bold' }}
          >
            {currentSpeed.toFixed(1)}
          </text>
          <text
            x="100"
            y="105"
            textAnchor="middle"
            className="fill-slate-400"
            style={{ fontSize: '12px' }}
          >
            Mbps
          </text>
        </svg>
      </div>

      {/* Progress bar */}
      {(phase === 'ping' || phase === 'download' || phase === 'upload') && (
        <div className="mt-4 w-full max-w-xs">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
