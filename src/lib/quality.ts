type QualityInput = {
  download: number;
  upload: number;
  ping: number;
  jitter: number;
};

type QualityResult = {
  score: number;
  grade: string;
  label: string;
};

type GradeThreshold = {
  grade: string;
  min: number;
  label: string;
};

const GRADE_THRESHOLDS: GradeThreshold[] = [
  { grade: 'A', min: 90, label: 'Excellent' },
  { grade: 'B', min: 75, label: 'Very Good' },
  { grade: 'C', min: 60, label: 'Good' },
  { grade: 'D', min: 40, label: 'Fair' },
  { grade: 'F', min: 0, label: 'Poor' },
];

function normalizeDownload(value: number): number {
  if (value >= 100) return 100;
  if (value <= 0) return 0;
  return Math.min(100, (value / 100) * 100);
}

function normalizeUpload(value: number): number {
  if (value >= 50) return 100;
  if (value <= 0) return 0;
  return (value / 50) * 100;
}

function normalizePing(value: number): number {
  if (value <= 20) return 100;
  if (value >= 200) return 0;
  return 100 - ((value - 20) / 180) * 100;
}

function normalizeJitter(value: number): number {
  if (value <= 5) return 100;
  if (value >= 50) return 0;
  return 100 - ((value - 5) / 45) * 100;
}

export function calculateQualityScore(input: QualityInput): QualityResult {
  const downloadScore = normalizeDownload(input.download);
  const uploadScore = normalizeUpload(input.upload);
  const pingScore = normalizePing(input.ping);
  const jitterScore = normalizeJitter(input.jitter);

  const weights = {
    download: 0.35,
    upload: 0.25,
    ping: 0.25,
    jitter: 0.15,
  };

  const weightedScore =
    downloadScore * weights.download +
    uploadScore * weights.upload +
    pingScore * weights.ping +
    jitterScore * weights.jitter;

  const score = Math.round(weightedScore);

  const gradeInfo = GRADE_THRESHOLDS.reduce<GradeThreshold>((acc, threshold) => {
    if (score >= threshold.min) return threshold;
    return acc;
  }, GRADE_THRESHOLDS[GRADE_THRESHOLDS.length - 1]!);

  return {
    score,
    grade: gradeInfo.grade,
    label: gradeInfo.label,
  };
}