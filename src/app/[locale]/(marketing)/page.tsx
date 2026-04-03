import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AdSlot } from '@/components/ads/AdSlot';
import { SpeedTestDashboard } from '@/components/speed-test/SpeedTestDashboard';
import { generateSeoMetadata } from '@/libs/Seo';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Index' });

  return generateSeoMetadata({
    title: t('meta_title'),
    description: t('meta_description'),
    canonical: `/${locale}`,
  });
}

export default function IndexPage() {
  return (
    <>
      <SpeedTestDashboard />
      <AdSlot
        slotId={process.env.NEXT_PUBLIC_AD_SLOT_FOOTER ?? ''}
        format="horizontal"
        className="mx-auto mt-8 mb-8 max-w-4xl"
      />
    </>
  );
}
