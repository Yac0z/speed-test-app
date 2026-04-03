import type { SpeedTestResult } from 'speedtest-core';
import { getResults } from 'speedtest-core';
import { z } from 'zod';

export const getHistorySchema = z.object({
  limit: z
    .number()
    .min(1)
    .max(1000)
    .default(10)
    .describe('Number of results to return (default: 10)'),
  days: z
    .number()
    .min(1)
    .optional()
    .describe('Only include results from last N days'),
});

export async function getHistoryHandler(
  args: z.infer<typeof getHistorySchema>
) {
  const { limit, days } = args;

  let results = getResults(limit);

  if (days !== undefined) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffMs = cutoff.getTime();

    results = results.filter((r: SpeedTestResult) => {
      const resultTime = new Date(r.timestamp).getTime();
      return resultTime >= cutoffMs;
    });
  }

  const count = results.length;

  const average =
    count > 0
      ? {
          download:
            results.reduce(
              (sum: number, r: SpeedTestResult) => sum + r.download,
              0
            ) / count,
          upload:
            results.reduce(
              (sum: number, r: SpeedTestResult) => sum + r.upload,
              0
            ) / count,
          ping:
            results.reduce(
              (sum: number, r: SpeedTestResult) => sum + r.ping,
              0
            ) / count,
        }
      : { download: 0, upload: 0, ping: 0 };

  return {
    results: results.map((r: SpeedTestResult) => ({
      timestamp: r.timestamp,
      download: r.download,
      upload: r.upload,
      ping: r.ping,
      jitter: r.jitter,
    })),
    count,
    average,
  };
}
