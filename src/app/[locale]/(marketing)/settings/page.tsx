import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SettingsPage } from '@/components/settings/SettingsPage';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Index' });

  return {
    title: `Settings - ${t('meta_title')}`,
    description: 'Configure your speed test preferences',
  };
}

export default function Settings() {
  return <SettingsPage />;
}
