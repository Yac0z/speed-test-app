import { Command } from 'commander';
import chalk from 'chalk';
import { createAbortController } from '@speedtest/core';
import { runCommand } from './commands/run.js';
import { historyCommand } from './commands/history.js';
import { compareCommand } from './commands/compare.js';
import { infoCommand } from './commands/info.js';
import { monitorCommand } from './commands/monitor.js';

const program = new Command();

program
  .name('speedtest-cli')
  .description('CLI tool for running internet speed tests')
  .version('1.0.0');

program
  .command('run')
  .description('Run a speed test')
  .option('-f, --format <format>', 'Output format (json, table, csv)', 'table')
  .option('-d, --duration <seconds>', 'Test duration in seconds', '10')
  .option('-o, --output <file>', 'Save result to file')
  .action(async (opts) => {
    try {
      const format = opts.format as 'json' | 'table' | 'csv';
      const duration = parseInt(opts.duration, 10);

      if (isNaN(duration) || duration < 1) {
        console.error(chalk.red('Error: Duration must be a positive number.'));
        process.exit(1);
      }

      if (!['json', 'table', 'csv'].includes(format)) {
        console.error(chalk.red('Error: Format must be json, table, or csv.'));
        process.exit(1);
      }

      await runCommand({ format, duration, output: opts.output });

      if (opts.output) {
        console.log(chalk.green(`Result saved to ${opts.output}`));
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log(chalk.yellow('\nTest cancelled.'));
      } else {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exit(1);
      }
    }
  });

program
  .command('history')
  .description('Show saved speed test results')
  .option('-l, --limit <number>', 'Number of results to show', '10')
  .option('-f, --format <format>', 'Output format (json, table, csv)', 'table')
  .option('-e, --export <file>', 'Export results to file')
  .action(async (opts) => {
    try {
      const format = opts.format as 'json' | 'table' | 'csv';
      const limit = parseInt(opts.limit, 10);

      if (isNaN(limit) || limit < 1) {
        console.error(chalk.red('Error: Limit must be a positive number.'));
        process.exit(1);
      }

      if (!['json', 'table', 'csv'].includes(format)) {
        console.error(chalk.red('Error: Format must be json, table, or csv.'));
        process.exit(1);
      }

      await historyCommand({ limit, format, exportFile: opts.export });
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

program
  .command('compare')
  .description('Compare current speed test with average')
  .option('-l, --last <number>', 'Number of recent results to average', '10')
  .action(async (opts) => {
    try {
      const last = parseInt(opts.last, 10);

      if (isNaN(last) || last < 1) {
        console.error(chalk.red('Error: Last must be a positive number.'));
        process.exit(1);
      }

      await compareCommand({ last });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log(chalk.yellow('\nTest cancelled.'));
      } else {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exit(1);
      }
    }
  });

program
  .command('info')
  .description('Show connection information')
  .action(async () => {
    try {
      await infoCommand();
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

program
  .command('monitor')
  .description('Continuous speed test monitoring')
  .option('-i, --interval <seconds>', 'Interval between tests in seconds', '60')
  .option('-o, --output <file>', 'Append results to JSONL file')
  .option('-a, --alert <threshold>', 'Alert expression (e.g., "download < 50")')
  .action(async (opts) => {
    try {
      const interval = parseInt(opts.interval, 10);

      if (isNaN(interval) || interval < 1) {
        console.error(chalk.red('Error: Interval must be a positive number.'));
        process.exit(1);
      }

      await monitorCommand({ interval, output: opts.output, alert: opts.alert });
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

const controller = createAbortController();

process.on('SIGINT', () => {
  console.log(chalk.yellow('\nShutting down...'));
  controller.abort();
  process.exit(0);
});

process.on('SIGTERM', () => {
  controller.abort();
  process.exit(0);
});

program.parse();
