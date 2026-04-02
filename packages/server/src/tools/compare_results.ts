import { z } from 'zod';
import type { TestPhase, SpeedTestResult } from '@speedtest/core';
import { runSpeedTest, getResults, saveResult } from '@speedtest/core';

export const compareResultsSchema = z.object({
  last_n: z
    .number()
    .min(1)
    .max(100)
    .default(5)
    .describe('Compare against last N tests (default: 5)'),
});

export async function compareResultsHandler(
  args: z.infer<typeof compareResultsSchema>,
) {
  const { last_n } = args;

  const history = getResults(last_n);

  if (history.length === 0) {
    throw new Error(
      'No saved results found. Run a speed test first.',
    );
  }

  const avg = {
    download:
      history.reduce((sum: number, r: SpeedTestResult) => sum + r.download, 0) /
      history.length,
    upload:
      history.reduce((sum: number, r: SpeedTestResult) => sum + r.upload, 0) /
      history.length,
    ping:
      history.reduce((sum: number, r: SpeedTestResult) => sum + r.ping, 0) /
      history.length,
  };

  const current = await runSpeedTest({
    onPhaseChange: (phase: TestPhase) => {
      process.stderr.write(`[speedtest] Phase: ${phase}\n`);
    },
    onProgress: (phase: TestPhase, progress: number) => {
      const pct = Math.round(progress * 100);
      process.stderr.write(`[speedtest] ${phase}: ${pct}%\n`);
    },
  });

  saveResult({
    download: current.download,
    upload: current.upload,
    ping: current.ping,
    jitter: current.jitter,
  });

  const pctChange = (curr: number, avg: number): string => {
    if (avg === 0) return 'N/A';
    const change = ((curr - avg) / avg) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const downloadChange = pctChange(
    current.download,
    avg.download,
  );
  const uploadChange = pctChange(current.upload, avg.upload);
  const pingChange = pctChange(current.ping, avg.ping);

  const summaryParts: string[] = [];
  if (parseFloat(downloadChange) >= 0) {
    summaryParts.push(`Download improved ${downloadChange}`);
  } else {
    summaryParts.push(`Download decreased ${downloadChange}`);
  }
  if (parseFloat(uploadChange) >= 0) {
    summaryParts.push(`upload improved ${uploadChange}`);
  } else {
    summaryParts.push(`upload decreased ${uploadChange}`);
  }
  if (parseFloat(pingChange) <= 0) {
    summaryParts.push(`ping improved ${pingChange}`);
  } else {
    summaryParts.push(`ping decreased ${pingChange}`);
  }

  return {
    current: {
      download: current.download,
      upload: current.upload,
      ping: current.ping,
    },
    average: {
      download: Math.round(avg.download * 100) / 100,
      upload: Math.round(avg.upload * 100) / 100,
      ping: Math.round(avg.ping * 100) / 100,
    },
    change: {
      download: downloadChange,
      upload: uploadChange,
      ping: pingChange,
    },
    summary: summaryParts.join(', '),
  };
}
