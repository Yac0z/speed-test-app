'use client';

import { Link } from '@/libs/I18nNavigation';
import { usePathname } from 'next/navigation';

type CyberNavLinkProps = {
  href: string;
  children: React.ReactNode;
};

export function CyberNavLink(props: CyberNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === props.href || (props.href !== '/' && pathname.startsWith(props.href));

  return (
    <li className="group/nav relative">
      <Link
        href={props.href}
        className={`relative block px-4 py-2 font-mono text-sm tracking-wider uppercase transition-all duration-300 ${
          isActive
            ? 'text-cyan-neon'
            : 'text-slate-400 hover:text-cyan-neon/80'
        }`}
      >
        {/* Active indicator */}
        {isActive && (
          <span className="absolute -left-0 top-1/2 h-3 w-0.5 -translate-y-1/2 bg-cyan-neon shadow-[0_0_6px_#00f0ff]" />
        )}

        {/* Hover background */}
        <span className="absolute inset-0 -z-10 scale-x-0 bg-cyan-neon/5 transition-transform duration-300 group-hover/nav:scale-x-100" />

        {/* Hover top line */}
        <span className="absolute left-0 top-0 h-px w-0 bg-gradient-to-r from-cyan-neon to-transparent transition-all duration-300 group-hover/nav:w-full" />

        {/* Hover bottom line */}
        <span className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-transparent to-cyan-neon transition-all duration-300 delay-75 group-hover/nav:w-full" />

        {/* Text with glitch on hover */}
        <span className="relative z-10">{props.children}</span>

        {/* Glitch layers */}
        <span className="absolute inset-0 z-10 flex items-center px-4 text-red-500 opacity-0 transition-all duration-75 group-hover/nav:opacity-30 group-hover/nav:translate-x-[1px]">
          {props.children}
        </span>
        <span className="absolute inset-0 z-10 flex items-center px-4 text-cyan-neon opacity-0 transition-all duration-75 group-hover/nav:opacity-30 group-hover/nav:translate-x-[-1px]">
          {props.children}
        </span>
      </Link>
    </li>
  );
}
