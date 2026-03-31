import type { LocalePrefixMode } from 'next-intl/routing';

/** Locale prefix strategy for next-intl routing. */
const localePrefix: LocalePrefixMode = 'as-needed';

export const AppConfig = {
  name: 'Speed Test',
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    localePrefix,
  },
};
