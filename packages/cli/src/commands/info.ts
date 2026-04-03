import chalk from 'chalk';
import Table from 'cli-table3';
import { getConnectionInfo } from 'speedtest-core';

export async function infoCommand(): Promise<void> {
  console.log('Fetching connection info...');

  try {
    const info = await getConnectionInfo();

    const table = new Table({
      head: [chalk.cyan.bold('Property'), chalk.cyan.bold('Value')],
      colWidths: [20, 40],
      style: { head: [], border: [] },
    });

    table.push(
      ['IP Address', info.ip],
      ['ISP', info.isp],
      ['City', `${info.city}, ${info.region}`],
      ['Country', info.country],
      ['Coordinates', `${info.latitude}, ${info.longitude}`]
    );

    console.log(chalk.bold.cyan('\nConnection Information'));
    console.log(table.toString());
  } catch (error) {
    console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    process.exit(1);
  }
}
