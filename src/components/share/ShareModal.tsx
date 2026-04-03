'use client';

import { useRef, useCallback } from 'react';

type ShareModalProps = {
  results: {
    download: number;
    upload: number;
    ping: number;
    jitter: number;
  };
  onClose: () => void;
};

export function ShareModal(props: ShareModalProps) {
  const { results, onClose } = props;
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadImage = useCallback(async () => {
    if (!cardRef.current) {
      return;
    }

    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: '#0f172a',
        quality: 1,
      });
      const link = document.createElement('a');
      link.download = `speed-test-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      link.remove();
    } catch {
      // Silently fail
    }
  }, []);

  const copyToClipboard = useCallback(() => {
    const text = `🚀 Speed Test Results
↓ Download: ${results.download.toFixed(1)} Mbps
↑ Upload: ${results.upload.toFixed(1)} Mbps
📡 Ping: ${results.ping.toFixed(0)} ms
📊 Jitter: ${results.jitter.toFixed(1)} ms`;

    void navigator.clipboard.writeText(text);
  }, [results]);

  const shareUrl = useCallback(() => {
    const encoded = btoa(JSON.stringify(results));
    const url = `${window.location.origin}?results=${encoded}`;
    void navigator.clipboard.writeText(url);
  }, [results]);

  const shareSocial = useCallback(
    (platform: string) => {
      const allowedPlatforms = ['twitter', 'facebook', 'linkedin'] as const;
      if (
        !allowedPlatforms.includes(
          platform as (typeof allowedPlatforms)[number]
        )
      )
        {return;}

      const text = `My internet speed: ↓${results.download.toFixed(1)} Mbps ↑${results.upload.toFixed(1)} Mbps`;
      const urls: Record<string, string> = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      };
      window.open(urls[platform], '_blank', 'width=600,height=400');
    },
    [results]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
      role="dialog"
      tabIndex={0}
      aria-label="Close share modal"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-slate-800 p-6"
        onClick={(e) => {
          e.stopPropagation();
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Share results"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Share Results</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Preview Card */}
        <div
          ref={cardRef}
          className="mb-6 rounded-xl bg-gradient-to-br from-slate-900 to-blue-950 p-6"
        >
          <div className="mb-4 text-center">
            <p className="text-sm text-slate-400">Speed Test Results</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">
                {results.download.toFixed(1)}
              </p>
              <p className="text-xs text-slate-400">Download Mbps</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">
                {results.upload.toFixed(1)}
              </p>
              <p className="text-xs text-slate-400">Upload Mbps</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {results.ping.toFixed(0)}
              </p>
              <p className="text-xs text-slate-400">Ping ms</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                {results.jitter.toFixed(1)}
              </p>
              <p className="text-xs text-slate-400">Jitter ms</p>
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={downloadImage}
              className="rounded-lg bg-slate-700/50 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-600/50"
            >
              Download Image
            </button>
            <button
              type="button"
              onClick={copyToClipboard}
              className="rounded-lg bg-slate-700/50 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-600/50"
            >
              Copy Text
            </button>
          </div>

          <button
            type="button"
            onClick={shareUrl}
            className="w-full rounded-lg bg-slate-700/50 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-600/50"
          >
            Copy Share Link
          </button>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                shareSocial('twitter');
              }}
              className="flex-1 rounded-lg bg-sky-600/20 px-3 py-2 text-sm font-medium text-sky-400 transition-colors hover:bg-sky-600/30"
            >
              Twitter
            </button>
            <button
              type="button"
              onClick={() => {
                shareSocial('facebook');
              }}
              className="flex-1 rounded-lg bg-blue-600/20 px-3 py-2 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-600/30"
            >
              Facebook
            </button>
            <button
              type="button"
              onClick={() => {
                shareSocial('linkedin');
              }}
              className="flex-1 rounded-lg bg-blue-700/20 px-3 py-2 text-sm font-medium text-blue-500 transition-colors hover:bg-blue-700/30"
            >
              LinkedIn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
