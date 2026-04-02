import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  runSpeedTestSchema,
  runSpeedTestHandler,
} from './tools/run_speed_test.js';
import {
  getHistorySchema,
  getHistoryHandler,
} from './tools/get_history.js';
import { getConnectionInfoHandler } from './tools/get_connection_info.js';
import {
  compareResultsSchema,
  compareResultsHandler,
} from './tools/compare_results.js';

const server = new McpServer({
  name: 'speedtest-mcp',
  version: '1.0.0',
});

server.tool(
  'run_speed_test',
  'Run an internet speed test measuring download, upload, and ping',
  runSpeedTestSchema.shape,
  async (args) => {
    try {
      const result = await runSpeedTestHandler(args);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  },
);

server.tool(
  'get_history',
  'Retrieve speed test history with optional filtering',
  getHistorySchema.shape,
  async (args) => {
    try {
      const result = await getHistoryHandler(args);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  },
);

server.tool(
  'get_connection_info',
  'Get current network connection information including IP, ISP, and location',
  {},
  async () => {
    try {
      const result = await getConnectionInfoHandler();
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  },
);

server.tool(
  'compare_results',
  'Compare current speed test with historical average',
  compareResultsSchema.shape,
  async (args) => {
    try {
      const result = await compareResultsHandler(args);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('[speedtest-mcp] Server running on stdio\n');
}

main().catch((error) => {
  process.stderr.write(
    `[speedtest-mcp] Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}\n`,
  );
  process.exit(1);
});
