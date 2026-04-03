'use client';

import { useEffect, useRef } from 'react';
import { AdConfig } from '@/config/SiteConfig';

type AdSlotProps = {
  slotId: string;
  format?: 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
};

export function AdSlot(props: AdSlotProps) {
  const { slotId, format = 'rectangle', className = '' } = props;
  const adRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!AdConfig.enabled || !AdConfig.googleAdSense.id || hasLoadedRef.current)
      {return;}
    hasLoadedRef.current = true;

    try {
      // oxlint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).adsbygoogle = (window as any).adsbygoogle ?? [];
      // oxlint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).adsbygoogle.push({});
    } catch {
      // Ad failed to load
    }
  }, []);

  if (!AdConfig.enabled) {return null;}

  const sizeMap = {
    horizontal: { width: '100%', height: '90px', minWidth: '320px' },
    vertical: { width: '300px', height: '250px' },
    rectangle: { width: '336px', height: '280px', maxWidth: '100%' },
  };

  const size = sizeMap[format];

  return (
    <div
      ref={adRef}
      className={`ad-slot ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...size,
      }}
      aria-label="Advertisement"
      role="complementary"
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={`ca-${AdConfig.googleAdSense.id}`}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={format === 'horizontal'}
      />
    </div>
  );
}
