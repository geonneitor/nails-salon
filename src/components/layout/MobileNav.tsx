'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Users, Scissors, Settings, Home, Wallet } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Calendario', href: '/calendar', icon: Calendar },
  { label: 'Caja', href: '/caja', icon: Wallet },
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
              className="relative flex items-center justify-center p-3"
            >
              <Icon 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`w-6 h-6 transition-all duration-300 ${
                  isActive 
                    ? 'text-primario-zen scale-110' 
                    : 'text-primario-zen/40 hover:text-primario-zen'
                }`} 
              />
              {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-primario-zen" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
