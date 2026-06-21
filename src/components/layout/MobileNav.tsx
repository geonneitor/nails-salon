'use client';

// ============================================================
// MobileNav — Barra de navegación inferior para móvil.
//
// Diseño pensado para uso real en el salón:
//   • 5 ítems con micro-labels para contexto inmediato.
//   • Indicador activo animado con Framer Motion (layoutId spring).
//   • Safe-area bottom para iPhones con notch/Dynamic Island.
//   • Touch targets mínimos de 44×44px (WCAG 2.5.5).
//   • Servicios se accede desde Ajustes (flujo infrecuente).
// ============================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Wallet, Users, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Inicio',     href: '/dashboard', icon: LayoutDashboard },
  { label: 'Agenda',     href: '/calendar',  icon: Calendar },
  { label: 'Caja',       href: '/caja',      icon: Wallet },
  { label: 'Clientas',   href: '/customers', icon: Users },
  { label: 'Ajustes',    href: '/settings',  icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <nav
        className="bg-fondo-zen/85 backdrop-blur-xl border-t border-secundario-zen/30 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
      >
        <div className="flex justify-around items-center px-2 pt-2 pb-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[44px] px-2 py-1 rounded-2xl transition-colors duration-200"
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Pill de fondo animado para el ítem activo */}
                {isActive && (
                  <motion.span
                    layoutId="mobile-nav-active"
                    className="absolute inset-0 bg-primario-zen/10 rounded-2xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Ícono */}
                <Icon
                  strokeWidth={isActive ? 2.5 : 1.75}
                  className={`relative w-5 h-5 transition-all duration-200 ${
                    isActive
                      ? 'text-primario-zen scale-110'
                      : 'text-primario-zen/45 hover:text-primario-zen/70'
                  }`}
                />

                {/* Micro-label para contexto inmediato */}
                <span
                  className={`relative text-[9px] font-semibold uppercase tracking-[0.12em] leading-none transition-all duration-200 ${
                    isActive
                      ? 'text-primario-zen'
                      : 'text-primario-zen/40'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
