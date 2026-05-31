'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Users, Scissors, Settings, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Calendario', href: '/calendar', icon: Calendar },
  { label: 'Clientas', href: '/customers', icon: Users },
  { label: 'Servicios', href: '/services', icon: Scissors },
  { label: 'Ajustes', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-[#FDFBEE] border-r border-secundario-zen/50 flex flex-col justify-between py-8 px-6 hidden md:flex sticky top-0">

      {/* Brand Logo */}
      <div className="flex flex-col items-center mb-12">
        <h1 className="text-primario-zen font-serif text-4xl tracking-[0.2em] ml-[0.2em]">
          ZEN
        </h1>
        <div className="flex gap-1.5 mt-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className="w-1 h-1 rounded-full bg-primario-zen/80"></span>
          ))}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'bg-primario-zen text-fondo-zen shadow-sm'
                  : 'text-primario-zen/60 hover:bg-secundario-zen/30 hover:text-primario-zen'
              }`}
            >
              <Icon strokeWidth={isActive ? 2.5 : 2} className="w-5 h-5" />
              <span className={`text-sm tracking-wide ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="mt-8 pt-6 border-t border-secundario-zen/50">
        <button className="flex items-center gap-4 px-4 py-3 w-full text-primario-zen/60 hover:text-red-700 hover:bg-red-50 rounded-2xl transition-all duration-300">
          <LogOut strokeWidth={2} className="w-5 h-5" />
          <span className="text-sm tracking-wide font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
