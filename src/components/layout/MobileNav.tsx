'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Users, Scissors, Settings, Home } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Calendario', href: '/calendar', icon: Calendar },
  { label: 'Clientas', href: '/customers', icon: Users },
  { label: 'Servicios', href: '/services', icon: Scissors },
  { label: 'Ajustes', href: '/settings', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <nav className="bg-[#FDFBEE]/80 backdrop-blur-md border-t border-secundario-zen/50 px-6 py-3 flex justify-between items-center pb-safe">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                isActive
                ? 'text-primario-zen scale-110'
                : 'text-primario-zen/40 hover:text-primario-zen'
              }`}
            >
              <div className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-primario-zen text-fondo-zen shadow-md' : ''}`}>
                <Icon strokeWidth={isActive ? 2.5 : 2} className="w-6 h-6" />
              </div>
              <span className={`text-[10px] uppercase tracking-widest ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
