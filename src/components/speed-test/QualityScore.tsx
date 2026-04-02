'use client';

import { calculateQualityScore } from '@/lib/quality';

type QualityScoreProps = {
  download: number;
  upload: number;
  ping: number;
  jitter: number;
};

const GRADE_COLORS: Record<string, string> = {
  A: 'text-green-400 border-green-400/30 bg-green-500/10',
  B: 'text-cyan-400 border-cyan-400/30 bg-cyan-500/10',
  C: 'text-yellow-400 border-yellow-400/30 bg-yellow-500/10',
  D: 'text-orange-400 border-orange-400/30 bg-orange-500/10',
  F: 'text-red-400 border-red-400/30 bg-red-500/10',
};

export function QualityScore(props: QualityScoreProps) {
  const { download, upload, ping, jitter } = props;
  const { score, grade, label } = calculateQualityScore({ download, upload, ping, jitter });
  const colorClass = GRADE_COLORS[grade] ?? GRADE_COLORS.F;

  return (
    <div className="cyber-card rounded-xl p-5">
      <div className="mb-4 font-mono text-xs text-cyan-neon/60 uppercase tracking-wider">
        {'>'} Connection Quality
      </div>

      <div className="flex items-center gap-6">
        <div
          className={`flex h-20 w-20 flex-col items-center justify-center rounded-xl border-2 ${colorClass}`}
        >
          <span className="font-mono text-4xl font-bold">{grade}</span>
          <span className="font-mono text-[10px] uppercase tracking-wider opacity-70">Grade</span>
        </div>

        <div className="flex-1">
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-slate-400">Score</span>
              <span className="font-mono text-lg font-bold text-white">{score}/100</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-neon to-purple-neon transition-all duration-700"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          <div className="font-mono text-sm text-slate-300">{label}</div>
        </div>
      </div>
    </div>
  );
}