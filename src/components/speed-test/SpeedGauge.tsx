export type SpeedGaugeProps = {
  currentSpeed: number;
  phase: 'idle' | 'ping' | 'download' | 'upload' | 'complete';
  progress: number;
};

function getStrokeColor(percentage: number): string {
  if (percentage < 30) {return '#ef4444';}
  if (percentage < 60) {return '#eab308';}
  return '#22c55e';
}

function getSpeedUnit(speed: number): { value: number; unit: string } {
  if (speed < 1) {return { value: speed * 1000, unit: 'Kbps' };}
  if (speed >= 1000) {return { value: speed / 1000, unit: 'Gbps' };}
  return { value: speed, unit: 'Mbps' };
}

function getPingDisplay(pingMs: number): { value: string; unit: string } {
  if (pingMs < 1) {return { value: (pingMs * 1000).toFixed(0), unit: 'μs' };}
  if (pingMs >= 1000) {return { value: (pingMs / 1000).toFixed(1), unit: 's' };}
  return { value: pingMs.toFixed(0), unit: 'ms' };
}

function getGaugeMax(speed: number): number {
  if (speed <= 0) {return 100;}
  if (speed <= 10) {return 10;}
  if (speed <= 25) {return 25;}
  if (speed <= 50) {return 50;}
  if (speed <= 100) {return 100;}
  if (speed <= 250) {return 250;}
  if (speed <= 500) {return 500;}
  if (speed <= 1000) {return 1000;}
  return Math.ceil(speed / 1000) * 1000;
}

function getPingGaugeMax(pingMs: number): number {
  if (pingMs <= 0) {return 50;}
  if (pingMs <= 5) {return 5;}
  if (pingMs <= 10) {return 10;}
  if (pingMs <= 20) {return 20;}
  if (pingMs <= 50) {return 50;}
  if (pingMs <= 100) {return 100;}
  if (pingMs <= 200) {return 200;}
  if (pingMs <= 500) {return 500;}
  return Math.ceil(pingMs / 100) * 100;
}

export function SpeedGauge(props: SpeedGaugeProps) {
  const { currentSpeed, phase, progress } = props;

  const isPing = phase === 'ping';
  const { displayValue, displayUnit, gaugeMax, gaugePercentage } = isPing
    ? (() => {
        const { value, unit } = getPingDisplay(currentSpeed);
        const max = getPingGaugeMax(currentSpeed);
        return {
          displayValue: value,
          displayUnit: unit,
          gaugeMax: max,
          gaugePercentage: Math.min((currentSpeed / max) * 100, 100),
        };
      })()
    : (() => {
        const { value, unit } = getSpeedUnit(currentSpeed);
        const max = getGaugeMax(currentSpeed);
        return {
          displayValue: value.toFixed(1),
          displayUnit: unit,
          gaugeMax: max,
          gaugePercentage: Math.min((currentSpeed / max) * 100, 100),
        };
      })();

  const angle = (gaugePercentage / 100) * 180;
  const arcLength = Math.PI * 80;

  const isTesting =
    phase === 'ping' || phase === 'download' || phase === 'upload';
  const arcColor = isTesting ? '#00f0ff' : getStrokeColor(gaugePercentage);

  const phaseLabels = {
    idle: 'SYSTEM READY',
    ping: 'MEASURING LATENCY...',
    download: 'DOWNLOADING DATA...',
    upload: 'UPLOADING DATA...',
    complete: 'TEST COMPLETE',
  };

  return (
    <div className="flex flex-col items-center">
      {/* Phase indicator with cyber styling */}
      <div className="mb-6 flex items-center gap-3">
        {isTesting && (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-neon opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-neon" />
          </span>
        )}
        <span
          className={`font-mono text-xs tracking-widest uppercase transition-colors ${isTesting ? 'text-cyan-neon' : 'text-slate-500'}`}
        >
          {phaseLabels[phase]}
        </span>
      </div>

      {/* SVG Gauge */}
      <div className="relative h-64 w-64 sm:h-80 sm:w-80">
        {/* Outer glow ring */}
        <div
          className={`absolute inset-0 rounded-full transition-opacity duration-500 ${isTesting ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="absolute inset-4 rounded-full border border-cyan-neon/10 blur-sm" />
        </div>

        <svg
          viewBox="0 0 200 120"
          className="relative z-10 h-full w-full"
          role="img"
          aria-label={`Speed gauge showing ${displayValue} ${displayUnit}`}
        >
          {/* Defs for glow filter */}
          <defs>
            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="arc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>

          {/* Background arc - dark */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1a1a3e"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Background arc - subtle border */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#2d2d5e"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* Progress arc with glow */}
          {gaugePercentage > 0 && (
            <>
              {/* Glow layer */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke={arcColor}
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${(angle / 180) * arcLength} ${arcLength}`}
                opacity="0.3"
                filter="url(#neon-glow)"
                className="transition-all duration-150"
              />
              {/* Main arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke={isTesting ? 'url(#arc-gradient)' : arcColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(angle / 180) * arcLength} ${arcLength}`}
                className="transition-all duration-150"
              />
              {/* Bright center line */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${(angle / 180) * arcLength} ${arcLength}`}
                opacity="0.6"
                className="transition-all duration-150"
              />
            </>
          )}

          {/* Tick marks */}
          {Array.from({ length: 11 }, (_, i) => {
            const tickAngle = (i / 10) * 180;
            const rad = ((tickAngle - 180) * Math.PI) / 180;
            const innerR = i % 5 === 0 ? 62 : 66;
            const outerR = 74;
            const x1 = 100 + innerR * Math.cos(rad);
            const y1 = 100 + innerR * Math.sin(rad);
            const x2 = 100 + outerR * Math.cos(rad);
            const y2 = 100 + outerR * Math.sin(rad);
            const isMajor = i % 5 === 0;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isMajor ? '#00f0ff' : '#334155'}
                strokeWidth={isMajor ? 1.5 : 0.5}
                opacity={isMajor ? 0.8 : 0.4}
              />
            );
          })}

          {/* Scale labels */}
          <text
            x="16"
            y="116"
            textAnchor="middle"
            fill="#475569"
            style={{ fontSize: '9px', fontFamily: 'monospace' }}
          >
            0
          </text>
          <text
            x="184"
            y="116"
            textAnchor="middle"
            fill="#475569"
            style={{ fontSize: '9px', fontFamily: 'monospace' }}
          >
            {isPing
              ? (gaugeMax >= 1000
                ? `${gaugeMax / 1000}s`
                : `${gaugeMax}ms`)
              : (gaugeMax >= 1000
                ? `${gaugeMax / 1000}G`
                : gaugeMax)}
          </text>

          {/* Speed value with glow */}
          <text
            x="100"
            y="72"
            textAnchor="middle"
            fill="white"
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              fontFamily: 'monospace',
            }}
            filter="url(#neon-glow)"
            opacity="0.2"
          >
            {displayValue}
          </text>
          <text
            x="100"
            y="72"
            textAnchor="middle"
            fill="white"
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              fontFamily: 'monospace',
            }}
          >
            {displayValue}
          </text>
          <text
            x="100"
            y="94"
            textAnchor="middle"
            fill="#00f0ff"
            opacity="0.8"
            style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              letterSpacing: '2px',
            }}
          >
            {displayUnit}
          </text>
        </svg>
      </div>

      {/* Progress bar */}
      {(phase === 'ping' || phase === 'download' || phase === 'upload') && (
        <div className="mt-6 w-full max-w-xs">
          <div className="relative h-1 overflow-hidden rounded-full bg-slate-800">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-neon via-purple-neon to-green-neon transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
            {/* Shimmer effect */}
            <div className="animate-shimmer absolute inset-0" />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10px] text-slate-600">
            <span>PING</span>
            <span>DOWNLOAD</span>
            <span>UPLOAD</span>
          </div>
        </div>
      )}
    </div>
  );
}
