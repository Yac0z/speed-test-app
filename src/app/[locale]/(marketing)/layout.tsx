import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CyberNavLink } from '@/components/CyberNavLink';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { BaseTemplate } from '@/templates/BaseTemplate';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'RootLayout',
  });

  return (
    <BaseTemplate
      leftNav={
        <>
          <li><CyberNavLink href="/">{t('home_link')}</CyberNavLink></li>
          <li><CyberNavLink href="/history/">{t('history_link')}</CyberNavLink></li>
          <li><CyberNavLink href="/servers/">{t('servers_link')}</CyberNavLink></li>
          <li><CyberNavLink href="/settings/">{t('settings_link')}</CyberNavLink></li>
        </>
      }
      rightNav={
        <li>
          <LocaleSwitcher />
        </li>
      }
    >
      <div className="py-5 text-xl [&_p]:my-6">{props.children}</div>
    </BaseTemplate>
  );
}
