import { useTranslations } from 'next-intl';
import { AppConfig } from '@/utils/AppConfig';

export const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const t = useTranslations('BaseTemplate');

  return (
    <div className="relative w-full min-h-screen text-gray-700 antialiased">
      {/* Cyber background grid */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(0,240,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Top scanline */}
      <div className="fixed left-0 right-0 top-0 z-50 h-px bg-gradient-to-r from-transparent via-cyan-neon/60 to-transparent" />

      <div className="relative z-10 mx-auto max-w-3xl px-4">
        {/* Cyber Header */}
        <header className="relative border-b border-cyan-neon/10">
          {/* Animated line under header */}
          <div className="absolute -bottom-px left-0 h-px w-32 bg-gradient-to-r from-cyan-neon to-transparent animate-pulse" />

          <div className="pt-12 pb-4">
            {/* Logo with glitch effect */}
            <div className="relative inline-block group">
              <h1 className="text-3xl font-bold tracking-tight text-white transition-all duration-300 group-hover:text-cyan-neon group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
                {AppConfig.name}
              </h1>
              {/* Glitch layers on hover */}
              <h1 className="absolute inset-0 text-3xl font-bold tracking-tight text-red-500/0 transition-all duration-100 group-hover:text-red-500/20 group-hover:translate-x-[2px] group-hover:translate-y-[-1px]">
                {AppConfig.name}
              </h1>
              <h1 className="absolute inset-0 text-3xl font-bold tracking-tight text-cyan-neon/0 transition-all duration-100 group-hover:text-cyan-neon/20 group-hover:translate-x-[-2px] group-hover:translate-y-[1px]">
                {AppConfig.name}
              </h1>
            </div>
            <h2 className="mt-1 font-mono text-sm text-slate-500">{t('description')}</h2>
          </div>

          {/* Navigation - Cyber HUD Style */}
          <div className="flex items-center justify-between py-3">
            <nav aria-label={t('main_navigation_label')} className="flex-1">
              <ul className="flex flex-wrap gap-1">
                {props.leftNav}
              </ul>
            </nav>

            <nav className="flex items-center gap-2">
              <ul className="flex flex-wrap gap-1">
                {props.rightNav}
              </ul>
            </nav>
          </div>
        </header>

        <main className="py-6">{props.children}</main>

        {/* Cyber Footer */}
        <footer className="relative border-t border-cyan-neon/10 py-6 text-center">
          <div className="absolute -top-px left-0 h-px w-24 bg-gradient-to-r from-transparent to-purple-neon/30" />
          <p className="font-mono text-xs text-slate-600">
            {t('footer_text', {
              year: new Date().getFullYear(),
              name: AppConfig.name,
            })}
          </p>
        </footer>
      </div>
    </div>
  );
};
