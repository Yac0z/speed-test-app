import { useMemo } from 'react';

export type SpeedGaugeProps = {
  currentSpeed: number;
  phase: 'idle' | 'ping' | 'download' | 'upload' | 'complete';
  progress: number;
};

function getStrokeColor(percentage: number): string {
  if (percentage < 30) return '#ef4444';
  if (percentage < 60) return '#eab308';
  return '#22c55e';
}

function getSpeedUnit(speed: number): { value: number; unit: string } {
  if (speed < 1) {
    return { value: speed * 1000, unit: 'Kbps' };
  }
  if (speed >= 1000) {
    return { value: speed / 1000, unit: 'Gbps' };
  }
  return { value: speed, unit: 'Mbps' };
}

function getGaugeMax(speed: number): number {
  if (speed <= 0) return 100;
  if (speed <= 10) return 10;
  if (speed <= 25) return 25;
  if (speed <= 50) return 50;
  if (speed <= 100) return 100;
  if (speed <= 250) return 250;
  if (speed <= 500) return 500;
  if (speed <= 1000) return 1000;
  return Math.ceil(speed / 1000) * 1000;
}

export function SpeedGauge(props: SpeedGaugeProps) {
  const { currentSpeed, phase, progress } = props;

  const { displayValue, displayUnit } = useMemo(() => {
    const { value, unit } = getSpeedUnit(currentSpeed);
    return { displayValue: value, displayUnit: unit };
  }, [currentSpeed]);

  const gaugeMax = useMemo(() => getGaugeMax(currentSpeed), [currentSpeed]);
  const gaugePercentage = Math.min((currentSpeed / gaugeMax) * 100, 100);
  const angle = (gaugePercentage / 100) * 180;
  const arcLength = Math.PI * 80;

  const phaseLabels = {
    idle: 'Ready',
    ping: 'Testing Ping...',
    download: 'Testing Download...',
    upload: 'Testing Upload...',
    complete: 'Test Complete',
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-sm font-medium text-slate-400">
        {phaseLabels[phase]}
      </div>

      <div className="relative h-64 w-64 sm:h-80 sm:w-80">
        <svg
          viewBox="0 0 200 120"
          className="h-full w-full"
          aria-label={`Speed gauge showing ${displayValue.toFixed(1)} ${displayUnit}`}
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
          {gaugePercentage > 0 && (
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={getStrokeColor(gaugePercentage)}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(angle / 180) * arcLength} ${arcLength}`}
              className="transition-all duration-150"
            />
          )}

          {/* Tick marks */}
          {Array.from({ length: 11 }, (_, i) => {
            const tickAngle = (i / 10) * 180;
            const rad = ((tickAngle - 180) * Math.PI) / 180;
            const innerR = 68;
            const outerR = 74;
            const x1 = 100 + innerR * Math.cos(rad);
            const y1 = 100 + innerR * Math.sin(rad);
            const x2 = 100 + outerR * Math.cos(rad);
            const y2 = 100 + outerR * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#64748b"
                strokeWidth="1"
              />
            );
          })}

          {/* Scale labels */}
          <text
            x="18"
            y="115"
            textAnchor="middle"
            className="fill-slate-500"
            style={{ fontSize: '10px' }}
          >
            0
          </text>
          <text
            x="182"
            y="115"
            textAnchor="middle"
            className="fill-slate-500"
            style={{ fontSize: '10px' }}
          >
            {gaugeMax >= 1000 ? `${gaugeMax / 1000}G` : gaugeMax}
          </text>

          {/* Speed value */}
          <text
            x="100"
            y="78"
            textAnchor="middle"
            className="fill-white"
            style={{ fontSize: '32px', fontWeight: 'bold' }}
          >
            {displayValue.toFixed(1)}
          </text>
          <text
            x="100"
            y="98"
            textAnchor="middle"
            className="fill-slate-400"
            style={{ fontSize: '14px' }}
          >
            {displayUnit}
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
