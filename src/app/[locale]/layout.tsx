import { Analytics } from '@vercel/analytics/react';
import type { Metadata, Viewport } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AdScript } from '@/components/ads/AdScript';
import { AdConsentBanner } from '@/components/ads/AdConsentBanner';
import { generateSeoMetadata, generateJsonLd } from '@/libs/Seo';
import { routing } from '@/libs/I18nRouting';
import '@/styles/global.css';

export const metadata: Metadata = generateSeoMetadata({
  title: 'Free Internet Speed Test',
  description: 'Test your internet connection speed with precision. Measure download, upload, and ping latency. Track your speed history over time.',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a1a',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const jsonLd = generateJsonLd('WebApplication', {
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  });

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <NextIntlClientProvider>
          {props.children}
          <AdConsentBanner />
          <Analytics />
          <AdScript />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
