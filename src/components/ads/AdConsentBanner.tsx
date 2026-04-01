'use client';

import { useEffect, useState } from 'react';

const CONSENT_KEY = 'speed-test-ad-consent';

export function AdConsentBanner() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setShow(false);
    window.location.reload();
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setShow(false);
  };

  if (!mounted || !show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-cyan-neon/10 bg-cyber-dark/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-300">
              We use cookies and similar technologies to serve ads and analyze traffic.
              By accepting, you agree to our use of cookies for personalized advertising.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              <a href="/privacy" className="text-cyan-neon/60 underline hover:text-cyan-neon">
                Privacy Policy
              </a>
              {' '}·{' '}
              <a href="/terms" className="text-cyan-neon/60 underline hover:text-cyan-neon">
                Terms of Service
              </a>
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <button
              type="button"
              onClick={decline}
              className="rounded border border-slate-700 px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-300"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={accept}
              className="rounded bg-cyan-neon/10 px-4 py-2 text-sm font-medium text-cyan-neon border border-cyan-neon/30 transition-all hover:bg-cyan-neon/20 hover:border-cyan-neon/60"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
