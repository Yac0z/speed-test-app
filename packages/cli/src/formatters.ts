import type { SpeedTestResult } from 'speedtest-core';
import chalk from 'chalk';
import Table from 'cli-table3';

export function formatTable(result: SpeedTestResult): string {
  const table = new Table({
    head: [chalk.cyan.bold('Metric'), chalk.cyan.bold('Result')],
    colWidths: [20, 25],
    style: { head: [], border: [] },
  });

  table.push(
    ['Download', `${chalk.green.bold(result.download.toFixed(2))} Mbps`],
    ['Upload', `${chalk.green.bold(result.upload.toFixed(2))} Mbps`],
    ['Ping', `${chalk.yellow.bold(result.ping.toFixed(2))} ms`],
    ['Jitter', `${chalk.yellow.bold(result.jitter.toFixed(2))} ms`],
    ['Timestamp', chalk.dim(result.timestamp)]
  );

  return table.toString();
}

export function formatJson(
  result: SpeedTestResult | SpeedTestResult[]
): string {
  return JSON.stringify(result, null, 2);
}

export function formatCsv(result: SpeedTestResult | SpeedTestResult[]): string {
  const results = Array.isArray(result) ? result : [result];
  const header = 'timestamp,download_mbps,upload_mbps,ping_ms,jitter_ms';
  const rows = results.map(
    (r) => `${r.timestamp},${r.download},${r.upload},${r.ping},${r.jitter}`
  );
  return [header, ...rows].join('\n');
}

export function formatHistoryTable(results: SpeedTestResult[]): string {
  if (results.length === 0) {
    return chalk.yellow('No saved results found.');
  }

  const table = new Table({
    head: [
      chalk.cyan.bold('#'),
      chalk.cyan.bold('Date'),
      chalk.cyan.bold('Download'),
      chalk.cyan.bold('Upload'),
      chalk.cyan.bold('Ping'),
      chalk.cyan.bold('Jitter'),
    ],
    colWidths: [5, 22, 14, 14, 12, 12],
    style: { head: [], border: [] },
  });

  results.forEach((r, i) => {
    const date = new Date(r.timestamp).toLocaleString();
    table.push([
      i + 1,
      chalk.dim(date),
      `${r.download.toFixed(2)} Mbps`,
      `${r.upload.toFixed(2)} Mbps`,
      `${r.ping.toFixed(2)} ms`,
      `${r.jitter.toFixed(2)} ms`,
    ]);
  });

  return table.toString();
}

export function formatCompareTable(
  current: SpeedTestResult,
  avg: SpeedTestResult
): string {
  const pctChange = (curr: number, avg: number): string => {
    if (avg === 0) {return chalk.gray('N/A');}
    const change = ((curr - avg) / avg) * 100;
    const sign = change >= 0 ? '+' : '';
    const color = change >= 0 ? chalk.green : chalk.red;
    return color(`${sign}${change.toFixed(1)}%`);
  };

  const table = new Table({
    head: [
      chalk.cyan.bold('Metric'),
      chalk.cyan.bold('Current'),
      chalk.cyan.bold('Average'),
      chalk.cyan.bold('Change'),
    ],
    colWidths: [14, 18, 18, 14],
    style: { head: [], border: [] },
  });

  table.push(
    [
      'Download',
      `${current.download.toFixed(2)} Mbps`,
      `${avg.download.toFixed(2)} Mbps`,
      pctChange(current.download, avg.download),
    ],
    [
      'Upload',
      `${current.upload.toFixed(2)} Mbps`,
      `${avg.upload.toFixed(2)} Mbps`,
      pctChange(current.upload, avg.upload),
    ],
    [
      'Ping',
      `${current.ping.toFixed(2)} ms`,
      `${avg.ping.toFixed(2)} ms`,
      pctChange(current.ping, avg.ping),
    ],
    [
      'Jitter',
      `${current.jitter.toFixed(2)} ms`,
      `${avg.jitter.toFixed(2)} ms`,
      pctChange(current.jitter, avg.jitter),
    ]
  );

  return table.toString();
}
