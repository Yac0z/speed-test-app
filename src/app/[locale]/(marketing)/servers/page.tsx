import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ServersPage } from '@/components/servers/ServersPage';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Index' });

  return {
    title: `Test Servers - ${t('meta_title')}`,
    description: 'Choose a test server for your speed test',
  };
}

export default function Servers() {
  return <ServersPage />;
}
