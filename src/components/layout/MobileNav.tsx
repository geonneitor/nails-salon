'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Users, Scissors, Settings, Home } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Calendario', href: '/calendar', icon: Calendar },
  { label: 'Clientas', href: '/customers', icon: Users },
  { label: 'Servicios', href: '/services', icon: Scissors },
  { label: 'Ajustes', href: '/settings', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <nav className="bg-fondo-zen/70 backdrop-blur-lg border-t border-secundario-zen/30 px-6 py-3 flex justify-between items-center pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                isActive
                ? 'text-primario-zen scale-105'
                : 'text-primario-zen/40 hover:text-primario-zen'
              }`}
            >
              <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-primario-zen text-fondo-zen shadow-lg shadow-primario-zen/20' : 'bg-transparent'}`}>
                <Icon strokeWidth={isActive ? 2.5 : 2} className="w-6 h-6" />
              </div>
              <span className={`text-[10px] uppercase tracking-widest transition-all duration-300 ${isActive ? 'font-bold translate-y-[-1px]' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
