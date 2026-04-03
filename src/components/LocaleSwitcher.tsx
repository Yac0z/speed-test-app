'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { usePathname, useRouter } from '@/libs/I18nNavigation';
import { routing } from '@/libs/I18nRouting';

export const LocaleSwitcher = () => {
  const t = useTranslations('LocaleSwitcher');
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const otherLocales = routing.locales.filter((l) => l !== locale);

  const handleSwitch = (newLocale: string) => {
    setIsOpen(false);
    const { search } = window.location;
    router.push(`${pathname}${search}`, { locale: newLocale, scroll: false });
  };

  return (
    <div
      className="relative"
      onMouseEnter={() =>{  setIsOpen(true); }}
      onMouseLeave={() =>{  setIsOpen(false); }}
    >
      {/* Trigger button */}
      <button
        type="button"
        className="group/locale relative block px-4 py-2 font-mono text-sm tracking-wider text-cyan-neon uppercase transition-all duration-300"
        aria-label={t('change_language')}
        aria-expanded={isOpen}
      >
        <span className="relative z-10">{locale.toUpperCase()}</span>

        {/* Hover background */}
        <span className="absolute inset-0 -z-10 scale-x-0 bg-cyan-neon/5 transition-transform duration-300 group-hover/locale:scale-x-100" />

        {/* Hover top line */}
        <span className="absolute top-0 left-0 h-px w-0 bg-gradient-to-r from-cyan-neon to-transparent transition-all duration-300 group-hover/locale:w-full" />

        {/* Hover bottom line */}
        <span className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-transparent to-cyan-neon transition-all delay-75 duration-300 group-hover/locale:w-full" />

        {/* Glitch layers */}
        <span className="absolute inset-0 z-10 flex items-center px-4 text-red-500 opacity-0 transition-all duration-75 group-hover/locale:translate-x-[1px] group-hover/locale:opacity-30">
          {locale.toUpperCase()}
        </span>
        <span className="absolute inset-0 z-10 flex items-center px-4 text-cyan-neon opacity-0 transition-all duration-75 group-hover/locale:translate-x-[-1px] group-hover/locale:opacity-30">
          {locale.toUpperCase()}
        </span>
      </button>

      {/* Dropdown */}
      <div
        className={`absolute top-full right-0 z-50 mt-1 overflow-hidden border border-cyan-neon/30 bg-slate-900/95 backdrop-blur-sm transition-all duration-200 ${
          isOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      >
        {/* Top accent line */}
        <span className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-cyan-neon to-transparent" />

        {otherLocales.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() =>{  handleSwitch(l); }}
            className="group/option relative block w-full px-4 py-2 font-mono text-sm tracking-wider text-slate-400 uppercase transition-all duration-300 hover:text-cyan-neon/80"
          >
            <span className="relative z-10">{l.toUpperCase()}</span>

            {/* Hover background */}
            <span className="absolute inset-0 -z-10 scale-x-0 bg-cyan-neon/5 transition-transform duration-300 group-hover/option:scale-x-100" />

            {/* Hover top line */}
            <span className="absolute top-0 left-0 h-px w-0 bg-gradient-to-r from-cyan-neon to-transparent transition-all duration-300 group-hover/option:w-full" />

            {/* Hover bottom line */}
            <span className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-transparent to-cyan-neon transition-all delay-75 duration-300 group-hover/option:w-full" />

            {/* Glitch layers */}
            <span className="absolute inset-0 z-10 flex items-center px-4 text-red-500 opacity-0 transition-all duration-75 group-hover/option:translate-x-[1px] group-hover/option:opacity-30">
              {l.toUpperCase()}
            </span>
            <span className="absolute inset-0 z-10 flex items-center px-4 text-cyan-neon opacity-0 transition-all duration-75 group-hover/option:translate-x-[-1px] group-hover/option:opacity-30">
              {l.toUpperCase()}
            </span>
          </button>
        ))}

        {/* Bottom accent line */}
        <span className="absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-cyan-neon to-transparent" />
      </div>
    </div>
  );
};
