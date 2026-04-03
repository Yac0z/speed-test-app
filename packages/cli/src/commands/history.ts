import { writeFileSync } from 'node:fs';
import chalk from 'chalk';
import { getResults, exportResults } from 'speedtest-core';
import { formatHistoryTable, formatJson, formatCsv } from '../formatters.js';

type HistoryOptions = {
  limit: number;
  format: 'json' | 'table' | 'csv';
  exportFile?: string;
}

export async function historyCommand(opts: HistoryOptions): Promise<void> {
  const results = getResults(opts.limit);

  if (results.length === 0) {
    console.log(
      chalk.yellow('No saved results found. Run a speed test first.')
    );
    return;
  }

  let output: string;
  switch (opts.format) {
    case 'json': {
      output = formatJson(results);
      break;
    }
    case 'csv': {
      output = formatCsv(results);
      break;
    }
    case 'table':
    default: {
      console.log(
        chalk.bold.cyan(`\nSpeed Test History (${results.length} results)`)
      );
      output = formatHistoryTable(results);
      break;
    }
  }

  console.log(output);

  if (opts.exportFile) {
    const exportFormat = opts.format === 'table' ? 'json' : opts.format;
    const data = exportResults(exportFormat);
    writeFileSync(opts.exportFile, data, 'utf8');
    console.log(chalk.green(`\nResults exported to ${opts.exportFile}`));
  }
}
