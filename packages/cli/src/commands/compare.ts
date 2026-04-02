import ora from 'ora';
import chalk from 'chalk';
import { runSpeedTest, getResults } from '@speedtest/core';
import { formatCompareTable } from '../formatters.js';

interface CompareOptions {
  last: number;
}

export async function compareCommand(opts: CompareOptions): Promise<void> {
  const results = getResults(opts.last);

  if (results.length === 0) {
    console.log(chalk.yellow('No saved results found. Run a speed test first.'));
    return;
  }

  const avg = {
    download: results.reduce((sum, r) => sum + r.download, 0) / results.length,
    upload: results.reduce((sum, r) => sum + r.upload, 0) / results.length,
    ping: results.reduce((sum, r) => sum + r.ping, 0) / results.length,
    jitter: results.reduce((sum, r) => sum + r.jitter, 0) / results.length,
    timestamp: new Date().toISOString(),
  };

  const spinner = ora('Running speed test for comparison...').start();

  const current = await runSpeedTest({
    onPhaseChange: (phase) => {
      spinner.text = `Running ${phase} test...`;
    },
    onProgress: (phase, progress) => {
      const pct = Math.round(progress * 100);
      spinner.text = `Running ${phase} test... ${pct}%`;
    },
  });

  spinner.succeed('Speed test complete!');

  console.log(chalk.bold.cyan(`\nComparison (vs average of ${results.length} tests)`));
  console.log(formatCompareTable(current, avg));
}
