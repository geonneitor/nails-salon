'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Users, Scissors, Settings, LogOut, ChevronDown, Wallet } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Calendario', href: '/calendar', icon: Calendar },
  { label: 'Caja', href: '/caja', icon: Wallet },
  { label: 'Clientas', href: '/customers', icon: Users },
  { label: 'Servicios', href: '/services', icon: Scissors },
  { label: 'Ajustes', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { activeProject, projects, setActiveProject, preferences } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const isCollapsed = preferences?.sidebar_collapsed ?? false;

  return (
    <aside className={`h-screen bg-fondo-zen border-r border-secundario-zen/50 hidden md:flex flex-col justify-between py-8 px-6 sticky top-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>

      <div className="flex flex-col gap-8">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-6 group relative px-2">
          <div className={`relative transition-all duration-500 ${isCollapsed ? 'w-10' : 'w-36'} group-hover:scale-110 transition-transform`}>
            <img
              src="/zen-logo.svg"
              alt="Zen Logo"
              className="h-10 w-auto object-contain"
              style={{ height: 'auto' }}
            />
          </div>
          {!isCollapsed && (
            <div className="flex gap-1.5 mt-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <span key={i} className="w-1 h-1 rounded-full bg-primario-zen/60 shadow-[0_0_3px_var(--accent-gold)]" />
              ))}
            </div>
          )}
        </div>

        {/* Active Project Display */}
        {activeProject && (
          <div className={`flex items-center justify-between px-4 py-3 rounded-2xl bg-secundario-zen/30 text-primario-zen text-xs font-medium border border-secundario-zen/60 shadow-sm ${isCollapsed ? 'justify-center px-0' : ''}`}>
            {!isCollapsed && (
              <span className="truncate text-center w-full">
                {activeProject.name}
              </span>
            )}
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex flex-col gap-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-primario-zen text-fondo-zen shadow-lg'
                    : 'text-primario-zen/60 hover:bg-secundario-zen/30 hover:text-primario-zen'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon strokeWidth={isActive ? 2.5 : 2} className="w-5 h-5" />
                {!isCollapsed && (
                  <span className={`text-sm tracking-wide ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer — Cerrar Sesión: hover usa paleta del sistema, no rojo externo */}
      <div className="mt-8 pt-6 border-t border-secundario-zen/50">
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = '/';
          }}
          className={`flex items-center gap-4 px-4 py-3 w-full text-primario-zen/50 hover:text-primario-zen hover:bg-secundario-zen/40 rounded-2xl transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : ''}`}
        >
          <LogOut strokeWidth={2} className="w-5 h-5" />
          {!isCollapsed && (
            <span className="text-sm tracking-wide font-medium">Cerrar Sesión</span>
          )}
        </button>
      </div>
    </aside>
  );
}
