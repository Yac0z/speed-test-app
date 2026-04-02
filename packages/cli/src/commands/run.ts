import { writeFileSync } from 'node:fs';
import ora from 'ora';
import chalk from 'chalk';
import { runSpeedTest, saveResult } from '@speedtest/core';
import { formatTable, formatJson, formatCsv } from '../formatters.js';

interface RunOptions {
  format: 'json' | 'table' | 'csv';
  duration: number;
  output?: string;
}

export async function runCommand(opts: RunOptions): Promise<void> {
  const spinner = ora('Starting speed test...').start();

  const result = await runSpeedTest({
    config: { duration: opts.duration },
    onPhaseChange: (phase) => {
      spinner.text = `Running ${phase} test...`;
    },
    onProgress: (phase, progress) => {
      const pct = Math.round(progress * 100);
      spinner.text = `Running ${phase} test... ${pct}%`;
    },
  });

  spinner.succeed('Speed test complete!');

  let output: string;
  switch (opts.format) {
    case 'json':
      output = formatJson(result);
      break;
    case 'csv':
      output = formatCsv(result);
      break;
    case 'table':
    default:
      console.log(chalk.bold.cyan('\nSpeed Test Results'));
      output = formatTable(result);
      break;
  }

  console.log(output);

  saveResult({
    download: result.download,
    upload: result.upload,
    ping: result.ping,
    jitter: result.jitter,
  });

  if (opts.output) {
    writeFileSync(opts.output, formatJson(result), 'utf-8');
  }
}
