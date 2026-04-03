import type { TestPhase } from 'speedtest-core';
import { runSpeedTest, saveResult } from 'speedtest-core';
import { z } from 'zod';

export const runSpeedTestSchema = z.object({
  duration: z
    .number()
    .min(1)
    .max(60)
    .default(10)
    .describe('Test duration in seconds per phase (default: 10)'),
  phases: z
    .array(z.enum(['download', 'upload', 'ping']))
    .default(['ping', 'download', 'upload'])
    .describe('Which phases to run (default: all)'),
});

export async function runSpeedTestHandler(
  args: z.infer<typeof runSpeedTestSchema>
) {
  const { duration, phases } = args;

  const result = await runSpeedTest({
    config: { duration, phases },
    onPhaseChange: (phase: TestPhase) => {
      process.stderr.write(`[speedtest] Phase: ${phase}\n`);
    },
    onProgress: (phase: TestPhase, progress: number) => {
      const pct = Math.round(progress * 100);
      process.stderr.write(`[speedtest] ${phase}: ${pct}%\n`);
    },
  });

  saveResult({
    download: result.download,
    upload: result.upload,
    ping: result.ping,
    jitter: result.jitter,
  });

  const summary = `Download: ${result.download} Mbps, Upload: ${result.upload} Mbps, Ping: ${result.ping} ms`;

  return {
    download: result.download,
    upload: result.upload,
    ping: result.ping,
    jitter: result.jitter,
    timestamp: result.timestamp,
    summary,
  };
}
