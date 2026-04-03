const STORAGE_KEY = 'speed-test-history';

export type SpeedTestResult = {
  id: string;
  timestamp: string;
  download: number;
  upload: number;
  ping: number;
  jitter: number;
};

export function getResults(): SpeedTestResult[] {
  if (typeof window === 'undefined') {return [];}
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {return [];}
    return JSON.parse(data) as SpeedTestResult[];
  } catch {
    return [];
  }
}

export function saveResult(
  result: Omit<SpeedTestResult, 'id' | 'timestamp'>
): SpeedTestResult {
  const results = getResults();
  const newResult: SpeedTestResult = {
    ...result,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  results.unshift(newResult);
  const trimmed = results.slice(0, 100);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  return newResult;
}

export function deleteAllResults(): void {
  localStorage.removeItem(STORAGE_KEY);
}
