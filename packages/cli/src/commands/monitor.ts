import { appendFileSync } from 'node:fs';
import chalk from 'chalk';
import ora from 'ora';
import { runSpeedTest, saveResult } from 'speedtest-core';
import { formatTable } from '../formatters.js';

type MonitorOptions = {
  interval: number;
  output?: string;
  alert?: string;
}

type AlertRule = {
  metric: 'download' | 'upload' | 'ping' | 'jitter';
  operator: '<' | '>' | '<=' | '>=' | '==' | '!=';
  value: number;
}

function parseAlert(expression: string): AlertRule | null {
  const match = expression.match(/^(\w+)\s*(>=|<=|!=|==|<|>)\s*(\d+\.?\d*)$/);
  if (!match) {
    return null;
  }

  const [, metric, operator, value] = match;
  const validMetrics = ['download', 'upload', 'ping', 'jitter'];
  if (!validMetrics.includes(metric)) {
    return null;
  }

  return {
    metric: metric as AlertRule['metric'],
    operator: operator as AlertRule['operator'],
    value: Number.parseFloat(value),
  };
}

function checkAlert(
  result: { download: number; upload: number; ping: number; jitter: number },
  rule: AlertRule
): boolean {
  const actual = result[rule.metric];
  switch (rule.operator) {
    case '<': {
      return actual < rule.value;
    }
    case '>': {
      return actual > rule.value;
    }
    case '<=': {
      return actual <= rule.value;
    }
    case '>=': {
      return actual >= rule.value;
    }
    case '==': {
      return actual === rule.value;
    }
    case '!=': {
      return actual !== rule.value;
    }
  }
}

export async function monitorCommand(opts: MonitorOptions): Promise<void> {
  const alertRule = opts.alert ? parseAlert(opts.alert) : null;

  if (opts.alert && !alertRule) {
    console.error(
      chalk.red(
        'Invalid alert expression. Use format: "metric <operator> value"'
      )
    );
    console.error(chalk.dim('Example: "download < 50" or "ping > 100"'));
    process.exit(1);
  }

  console.log(chalk.bold.cyan('\nSpeed Test Monitor'));
  console.log(chalk.dim(`Interval: ${opts.interval}s`));
  if (alertRule) {
    console.log(
      chalk.dim(
        `Alert: ${alertRule.metric} ${alertRule.operator} ${alertRule.value}`
      )
    );
  }
  if (opts.output) {
    console.log(chalk.dim(`Output: ${opts.output}`));
  }
  console.log(chalk.dim('Press Ctrl+C to stop\n'));

  let runCount = 0;

  while (true) {
    runCount++;
    const spinner = ora(`Running test #${runCount}...`).start();

    try {
      const result = await runSpeedTest({
        onPhaseChange: (phase) => {
          spinner.text = `Test #${runCount}: ${phase}...`;
        },
        onProgress: (phase, progress) => {
          const pct = Math.round(progress * 100);
          spinner.text = `Test #${runCount}: ${phase} ${pct}%`;
        },
      });

      spinner.succeed(`Test #${runCount} complete`);

      console.log(formatTable(result));

      saveResult({
        download: result.download,
        upload: result.upload,
        ping: result.ping,
        jitter: result.jitter,
      });

      if (opts.output) {
        appendFileSync(opts.output, JSON.stringify(result) + '\n', 'utf8');
      }

      if (alertRule && checkAlert(result, alertRule)) {
        console.log(
          chalk.red.bold(
            `\n⚠ ALERT: ${alertRule.metric} ${alertRule.operator} ${alertRule.value} (actual: ${result[alertRule.metric]})\n`
          )
        );
      }
    } catch (error) {
      spinner.fail(`Test #${runCount} failed`);
      console.error(
        chalk.red(
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      );
    }

    console.log(chalk.dim(`\nNext test in ${opts.interval}s...\n`));

    await new Promise<void>((resolve) => {
      const timeout = setTimeout(resolve, opts.interval * 1000);
      const onSignal = () => {
        clearTimeout(timeout);
        resolve();
      };
      process.once('SIGINT', onSignal);
      process.once('SIGTERM', onSignal);
    });
  }
}
