import type { MetadataRoute } from 'next';
import { routing } from '@/libs/I18nRouting';
import { getBaseUrl, getI18nPath } from '@/utils/Helpers';

type RouteConfig = {
  path: string;
  priority: number;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
};

const routes: RouteConfig[] = [
  { path: '', priority: 1.0, changeFrequency: 'daily' },
  { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/history', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/servers', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/settings', priority: 0.4, changeFrequency: 'monthly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();

  return routes.flatMap((route) =>
    routing.locales.map((locale) => ({
      url: `${baseUrl}${getI18nPath(route.path, locale)}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries(
          routing.locales
            .filter((l) => l !== locale)
            .map((l) => [l, `${baseUrl}${getI18nPath(route.path, l)}`])
        ),
      },
    }))
  );
}
