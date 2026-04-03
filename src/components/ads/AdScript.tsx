'use client';

import { useEffect } from 'react';
import { AdConfig } from '@/config/SiteConfig';

export function AdScript() {
  useEffect(() => {
    if (!AdConfig.enabled || !AdConfig.googleAdSense.id) {return;}

    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${AdConfig.googleAdSense.id}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.append(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}
