# SEO Documentation

## 1. Overview

The Speed Test app uses Next.js App Router's built-in Metadata API for SEO. The strategy centers on:

- **Centralized configuration** via `SiteConfig.ts` for site-wide defaults
- **Reusable metadata helper** (`Seo.ts`) that generates consistent metadata across pages
- **Dynamic sitemap** with i18n alternates for all locales
- **Robots.txt** that allows general crawlers but blocks AI scrapers
- **JSON-LD structured data** for rich search results
- **Open Graph & Twitter Cards** for social sharing
- **Google Search Console verification** via environment variable

## 2. SiteConfig Configuration

Edit `src/config/SiteConfig.ts` to update site-wide SEO defaults:

```ts
export const SiteConfig = {
  name: 'Speed Test',           // Site name (appears in title suffix)
  title: 'Speed Test - ...',    // Default page title
  description: '...',           // Default meta description
  url: 'https://...',           // Canonical site URL
  ogImage: '/og-image.png',     // Default OG/Twitter image (1200x630)
  twitter: {
    handle: '@speedtestapp',    // Creator handle
    site: '@speedtestapp',      // Site handle
    cardType: 'summary_large_image',
  },
  locale: 'en_US',              // OG locale
  type: 'website',              // OG type
  keywords: [...],              // SEO keywords array
  authors: [{ name: 'Yacin' }], // Author metadata
  creator: 'Yacin',             // Creator name
  publisher: 'Speed Test',      // Publisher name
  robots: {                     // Default robots directives
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
```

**Key fields to update when launching:**

| Field | When to change |
|-------|---------------|
| `url` | Set production URL or `NEXT_PUBLIC_APP_URL` env var |
| `ogImage` | Replace `/og-image.png` with your branded image |
| `twitter.handle` / `site` | Update to your actual Twitter handle |
| `authors` / `creator` / `publisher` | Update to your team/org |
| `keywords` | Add/remove relevant keywords |
| `robots` | Set `index: false` for staging environments |

## 3. Seo.ts Helper

### generateSeoMetadata

Generates a Next.js `Metadata` object with all standard SEO fields.

```ts
import { generateSeoMetadata } from '@/libs/Seo';

export const metadata = generateSeoMetadata({
  title: 'Page Title',        // Optional; defaults to SiteConfig.title
  description: 'Description', // Optional; defaults to SiteConfig.description
  canonical: '/page',         // Optional; defaults to SiteConfig.url
  ogImage: '/custom-og.png',  // Optional; defaults to SiteConfig.ogImage
  noindex: false,             // Optional; sets robots to noindex/nofollow
});
```

**What it generates:**

- `title` — Formatted as `Page Title | Speed Test`
- `description` — Meta description
- `metadataBase` — Base URL for relative paths
- `alternates.canonical` — Canonical URL
- `keywords` — Comma-separated from `SiteConfig.keywords`
- `authors` / `creator` / `publisher` — From SiteConfig
- `robots` — Indexing directives
- `openGraph` — Full OG tags (type, locale, url, title, description, siteName, images)
- `twitter` — Twitter Card tags (card, site, creator, title, description, images)
- `icons` — Favicon configuration (16x16, 32x32, .ico, apple-touch-icon)
- `manifest` — Web app manifest path
- `verification.google` — Google Search Console verification ID

### generateJsonLd

Generates JSON-LD structured data for rich search results.

```ts
import { generateJsonLd } from '@/libs/Seo';

const jsonLd = generateJsonLd('WebApplication', {
  applicationCategory: 'UtilityApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
});
```

**Supported types:**

| Type | Use case | Default fields |
|------|----------|----------------|
| `WebApplication` | App pages | name, description, url, applicationCategory, operatingSystem, offers |
| `Organization` | About pages, footer | name, url |
| `WebPage` | Generic pages | name, description, url |

Additional `props` are spread into the output, so you can add any Schema.org properties.

## 4. Sitemap Configuration

Located at `src/app/sitemap.ts`. Generates a dynamic sitemap with i18n alternates.

### Route Configuration

```ts
const routes: RouteConfig[] = [
  { path: '', priority: 1.0, changeFrequency: 'daily' },
  { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/history', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/servers', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/settings', priority: 0.4, changeFrequency: 'monthly' },
];
```

### Priority Guidelines

| Priority | Page type |
|----------|-----------|
| 1.0 | Homepage (primary landing page) |
| 0.7-0.9 | Key feature pages (servers, results) |
| 0.5-0.6 | Secondary pages (history, about) |
| 0.3-0.4 | Utility pages (settings, privacy) |
| 0.0-0.2 | Low-value pages (terms, legal) |

### Change Frequency Guidelines

| Frequency | Use for |
|-----------|---------|
| `daily` | Homepage, frequently updated content |
| `weekly` | Pages with regular updates (history) |
| `monthly` | Static content pages (about, servers, settings) |
| `yearly` | Legal pages, terms |
| `never` | Archived/removed pages |

### i18n Alternates

The sitemap automatically generates entries for all locales (`en`, `fr`) with `alternates.languages` pointing to each locale variant. Default locale (`en`) uses root paths; non-default locales get prefixed paths (e.g., `/fr/about`).

### Adding New Routes

1. Add entry to the `routes` array
2. Set appropriate `priority` and `changeFrequency`
3. The sitemap auto-generates locale variants

## 5. Robots.txt Configuration

Located at `src/app/robots.ts`.

### Current Rules

```ts
{
  rules: [
    { userAgent: '*', allow: '/' },           // Allow all crawlers
    { userAgent: 'GPTBot', disallow: '/' },   // Block OpenAI crawler
    { userAgent: 'ChatGPT-User', disallow: '/' }, // Block ChatGPT user
    { userAgent: 'CCBot', disallow: '/' },    // Block Common Crawl
  ],
  sitemap: `${getBaseUrl()}/sitemap.xml`,
}
```

### Allowed Bots

- All standard search engines (Google, Bing, DuckDuckGo, etc.)

### Blocked Bots

| Bot | Purpose |
|-----|---------|
| `GPTBot` | OpenAI web crawler |
| `ChatGPT-User` | ChatGPT browsing feature |
| `CCBot` | Common Crawl dataset |

### Adding Bot Rules

```ts
{
  rules: [
    { userAgent: '*', allow: '/' },
    { userAgent: 'SomeBot', disallow: '/private' },  // Partial block
    { userAgent: 'BadBot', disallow: '/' },           // Full block
  ],
}
```

## 6. JSON-LD Structured Data

### Current Implementation

The root layout (`src/app/[locale]/layout.tsx`) injects `WebApplication` JSON-LD into every page:

```tsx
const jsonLd = generateJsonLd('WebApplication', {
  applicationCategory: 'UtilityApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
});

// In <head>:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

### Extending JSON-LD

**For specific pages**, add page-level JSON-LD in the page component:

```tsx
import { generateJsonLd } from '@/libs/Seo';

export default function AboutPage() {
  const orgJsonLd = generateJsonLd('Organization', {
    sameAs: [
      'https://twitter.com/speedtestapp',
      'https://github.com/speedtestapp',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@speedtest.app',
    },
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      {/* page content */}
    </>
  );
}
```

### Common Schema.org Types to Add

| Type | Where to use |
|------|-------------|
| `FAQPage` | FAQ sections |
| `BreadcrumbList` | Pages with breadcrumbs |
| `Article` | Blog posts |
| `SoftwareApplication` | App download pages |
| `Review` / `AggregateRating` | Pages with user reviews |

## 7. Open Graph and Twitter Cards

### Open Graph

Automatically generated by `generateSeoMetadata`:

```ts
openGraph: {
  type: 'website',
  locale: 'en_US',
  url: 'https://...',
  title: 'Page Title | Speed Test',
  description: '...',
  siteName: 'Speed Test',
  images: [{
    url: '/og-image.png',
    width: 1200,
    height: 630,
    alt: 'Speed Test - Free Internet Connection Speed Test',
  }],
}
```

### Twitter Cards

```ts
twitter: {
  card: 'summary_large_image',
  site: '@speedtestapp',
  creator: '@speedtestapp',
  title: 'Page Title | Speed Test',
  description: '...',
  images: ['/og-image.png'],
}
```

### OG Image Requirements

- **Size:** 1200x630px (1.91:1 ratio)
- **Format:** PNG or JPG
- **File:** Place at `public/og-image.png`
- **Custom per page:** Pass `ogImage` to `generateSeoMetadata`

### Testing

- **OG:** Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- **Twitter:** Use [Card Validator](https://cards-dev.twitter.com/validator)

## 8. Adding SEO Metadata to New Pages

### Server Component (Recommended)

```tsx
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { generateSeoMetadata } from '@/libs/Seo';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'PageName' });

  return generateSeoMetadata({
    title: t('meta_title'),
    description: t('meta_description'),
    canonical: `/${locale}/your-path`,
  });
}

export default function YourPage() {
  return <div>Content</div>;
}
```

### Static Metadata (No i18n needed)

```tsx
import { generateSeoMetadata } from '@/libs/Seo';

export const metadata = generateSeoMetadata({
  title: 'About',
  description: 'Learn about our speed test service.',
  canonical: '/about',
});
```

### Hiding Pages from Search Engines

```tsx
export const metadata = generateSeoMetadata({
  title: 'Settings',
  noindex: true,  // Sets robots: { index: false, follow: false }
});
```

### Custom OG Image for a Page

```tsx
export const metadata = generateSeoMetadata({
  title: 'Servers',
  ogImage: '/og-servers.png',  // Place in public/
});
```

## 9. Google Search Console Verification

### Setup

1. Get your verification token from [Google Search Console](https://search.google.com/search-console)
2. Set the environment variable:

```env
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-token
```

3. The verification meta tag is automatically injected via `generateSeoMetadata`:

```ts
verification: {
  google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
}
```

### Post-Verification

1. Submit `sitemap.xml` in Search Console
2. Request indexing for key pages
3. Monitor coverage reports for crawl errors
4. Check Core Web Vitals performance

## 10. Best Practices

### Content

- Write unique, descriptive titles (50-60 characters)
- Write compelling meta descriptions (150-160 characters)
- Use sentence case for all translations
- Never hard-code user-visible strings; use i18n keys

### Images

- Provide OG images at 1200x630px
- Use descriptive `alt` text
- Optimize image file sizes
- Include favicon variants (16x16, 32x32, apple-touch-icon 180x180)

### URLs

- Set canonical URLs to prevent duplicate content
- Use `getI18nPath` for locale-aware paths
- Keep URLs short and descriptive

### Performance

- Sitemap auto-generates on build; no manual updates needed
- `lastModified` is set to current date; consider using actual page update dates for production
- JSON-LD is server-rendered; no client-side overhead

### Maintenance Checklist

- [ ] Update `SiteConfig.ts` when site branding changes
- [ ] Add new routes to `sitemap.ts` routes array
- [ ] Add `generateMetadata` to every new page
- [ ] Test OG/Twitter cards after major changes
- [ ] Monitor Search Console for crawl errors monthly
- [ ] Review and update keywords quarterly
- [ ] Verify OG image renders correctly after design updates
- [ ] Check robots.txt blocks are still appropriate
- [ ] Audit JSON-LD with [Rich Results Test](https://search.google.com/test/rich-results)

### Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_APP_URL` | Production URL for sitemap/canonicals | Yes (production) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | GSC verification | No |
| `NEXT_PUBLIC_ADS_ENABLED` | Toggle ads (affects layout, not SEO) | No |
| `NEXT_PUBLIC_GOOGLE_ADSENSE_ID` | AdSense publisher ID | No (if using ads) |
