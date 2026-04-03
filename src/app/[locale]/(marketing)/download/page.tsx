import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Download - Speed Test',
    description: 'Download CLI and MCP server for speed testing',
  };
}

export default async function DownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">Download</h1>
          <p className="text-slate-400">
            Get CLI and MCP server for your platform
          </p>
        </div>

        <div className="space-y-6">
          {/* CLI Download */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-500/20">
                  <svg
                    className="h-8 w-8 text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Speed Test CLI
                  </h2>
                  <p className="text-sm text-slate-400">
                    Command-line speed test tool
                  </p>
                </div>
              </div>
              <a
                href="https://github.com/Yac0z/speed-test-app/releases/download/v1.0.0/speedtest-cli.exe"
                className="rounded-lg bg-cyan-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-cyan-500"
              >
                Download .exe
              </a>
            </div>
            <div className="mt-4 rounded-lg bg-slate-900/50 p-4">
              <p className="mb-2 text-xs text-slate-500 uppercase">Usage</p>
              <code className="block font-mono text-sm text-cyan-400">
                speedtest-cli.exe run
                <br />
                speedtest-cli.exe info
                <br />
                speedtest-cli.exe history
              </code>
            </div>
          </div>

          {/* MCP Server Download */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/20">
                  <svg
                    className="h-8 w-8 text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">MCP Server</h2>
                  <p className="text-sm text-slate-400">
                    For AI assistants (Claude, etc.)
                  </p>
                </div>
              </div>
              <a
                href="https://github.com/Yac0z/speed-test-app/releases/download/v1.0.0/speedtest-mcp.exe"
                className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-500"
              >
                Download .exe
              </a>
            </div>
            <div className="mt-4 rounded-lg bg-slate-900/50 p-4">
              <p className="mb-2 text-xs text-slate-500 uppercase">
                MCP Config
              </p>
              <code className="block font-mono text-sm text-purple-400">
                {`{
  "mcpServers": {
    "speedtest": {
      "command": "path/to/speedtest-mcp.exe"
    }
  }
}`}
              </code>
            </div>
          </div>

          {/* Source Code */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-500/20">
                  <svg
                    className="h-8 w-8 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Source Code</h2>
                  <p className="text-sm text-slate-400">
                    Build from source or contribute
                  </p>
                </div>
              </div>
              <a
                href="https://github.com/Yac0z/speed-test-app/releases"
                className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-500"
              >
                View Releases
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-500">
            Previous versions? Check{' '}
            <a
              href="https://github.com/Yac0z/speed-test-app/releases"
              className="text-cyan-400 hover:underline"
            >
              GitHub Releases
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
