export const SiteConfig = {
  name: 'Speed Test',
  title: 'Speed Test - Free Internet Connection Speed Test',
  description: 'Test your internet connection speed with precision. Measure download, upload, and ping latency. Track your speed history over time.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://speed-test-app-nu.vercel.app',
  ogImage: '/og-image.png',
  twitter: {
    handle: '@speedtestapp',
    site: '@speedtestapp',
    cardType: 'summary_large_image',
  },
  locale: 'en_US',
  type: 'website',
  keywords: [
    'speed test',
    'internet speed test',
    'bandwidth test',
    'download speed',
    'upload speed',
    'ping test',
    'network speed',
    'internet connection test',
    'wifi speed test',
    'broadband speed',
  ],
  authors: [{ name: 'Yacin' }],
  creator: 'Yacin',
  publisher: 'Speed Test',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
};

export const AdConfig = {
  enabled: process.env.NEXT_PUBLIC_ADS_ENABLED === 'true',
  googleAdSense: {
    id: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || '',
  },
  slots: {
    leaderboard: {
      id: process.env.NEXT_PUBLIC_AD_SLOT_LEADERBOARD || '',
      format: 'horizontal',
      size: '728x90',
    },
    sidebar: {
      id: process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR || '',
      format: 'vertical',
      size: '300x250',
    },
    inContent: {
      id: process.env.NEXT_PUBLIC_AD_SLOT_IN_CONTENT || '',
      format: 'rectangle',
      size: '336x280',
    },
    mobileBanner: {
      id: process.env.NEXT_PUBLIC_AD_SLOT_MOBILE_BANNER || '',
      format: 'horizontal',
      size: '320x50',
    },
  },
};
