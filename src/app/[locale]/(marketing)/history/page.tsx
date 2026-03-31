import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HistoryPage } from '@/components/history/HistoryPage';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Index' });

  return {
    title: `Speed History - ${t('meta_title')}`,
    description: 'View your internet speed test history and trends',
  };
}

export default function History() {
  return <HistoryPage />;
}
