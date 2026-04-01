import type { Metadata } from 'next';
import { SiteConfig } from '@/config/SiteConfig';

type SeoProps = {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
};

export function generateSeoMetadata(props: SeoProps = {}): Metadata {
  const {
    title,
    description = SiteConfig.description,
    canonical,
    ogImage = SiteConfig.ogImage,
    noindex = false,
  } = props;

  const fullTitle = title
    ? `${title} | ${SiteConfig.name}`
    : SiteConfig.title;

  const url = canonical || SiteConfig.url;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SiteConfig.url),
    alternates: {
      canonical: url,
    },
    keywords: SiteConfig.keywords.join(', '),
    authors: SiteConfig.authors,
    creator: SiteConfig.creator,
    publisher: SiteConfig.publisher,
    robots: noindex
      ? { index: false as const, follow: false as const }
      : SiteConfig.robots,
    openGraph: {
      type: 'website' as const,
      locale: SiteConfig.locale,
      url,
      title: fullTitle,
      description,
      siteName: SiteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: SiteConfig.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      site: SiteConfig.twitter.site,
      creator: SiteConfig.twitter.handle,
      title: fullTitle,
      description,
      images: [ogImage],
    },
    icons: {
      icon: [
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon.ico', sizes: 'any' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180' },
      ],
    },
    manifest: '/site.webmanifest',
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  };
}

export function generateJsonLd(type: 'WebApplication' | 'WebPage' | 'Organization', props: Record<string, unknown>) {
  const base = {
    '@context': 'https://schema.org',
    '@type': type,
  };

  if (type === 'WebApplication') {
    return {
      ...base,
      name: SiteConfig.name,
      description: SiteConfig.description,
      url: SiteConfig.url,
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      ...props,
    };
  }

  if (type === 'Organization') {
    return {
      ...base,
      name: SiteConfig.name,
      url: SiteConfig.url,
      ...props,
    };
  }

  return {
    ...base,
    name: props.name || SiteConfig.name,
    description: props.description || SiteConfig.description,
    url: props.url || SiteConfig.url,
    ...props,
  };
}
