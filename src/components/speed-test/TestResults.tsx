'use client';

import { useState } from 'react';
import { ShareModal } from '@/components/share/ShareModal';

type TestResultsProps = {
  results: {
    download: number;
    upload: number;
    ping: number;
    jitter: number;
    timestamp: Date;
  };
  onComplete: (results: TestResultsProps['results']) => void;
};

export function TestResults(props: TestResultsProps) {
  const { results } = props;
  const [showShare, setShowShare] = useState(false);

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-slate-700/30 p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {results.download.toFixed(1)}
          </div>
          <div className="text-xs text-slate-400">Download Mbps</div>
        </div>
        <div className="rounded-xl bg-slate-700/30 p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {results.upload.toFixed(1)}
          </div>
          <div className="text-xs text-slate-400">Upload Mbps</div>
        </div>
        <div className="rounded-xl bg-slate-700/30 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {results.ping.toFixed(0)}
          </div>
          <div className="text-xs text-slate-400">Ping ms</div>
        </div>
        <div className="rounded-xl bg-slate-700/30 p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {results.jitter.toFixed(1)}
          </div>
          <div className="text-xs text-slate-400">Jitter ms</div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => {
            setShowShare(true);
          }}
          className="rounded-lg bg-slate-700/50 px-6 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-600/50 hover:text-white"
        >
          Share Results
        </button>
      </div>

      {showShare && (
        <ShareModal
          results={{
            download: results.download,
            upload: results.upload,
            ping: results.ping,
            jitter: results.jitter,
          }}
          onClose={() => {
            setShowShare(false);
          }}
        />
      )}
    </>
  );
}
