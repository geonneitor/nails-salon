'use client';

import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useApp } from '@/context/AppContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { Loader2 } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, preferences, activeProject } = useApp();

  useEffect(() => {
    if (preferences?.theme) {
      document.documentElement.setAttribute('data-theme', preferences.theme);
    }
  }, [preferences?.theme]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-fondo-zen items-center justify-center">
        <Loader2 className="w-8 h-8 text-primario-zen/50 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-fondo-zen relative overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-y-auto pb-24 md:pb-0">
        {/* Cabecera Móvil (Top Bar) con logo y botón Salir */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-fondo-zen/90 backdrop-blur-md border-b border-secundario-zen/50 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <img src="/zen-logo.svg" alt="Zen Logo" className="h-6 w-auto object-contain" />
            {activeProject && (
              <span className="text-[10px] uppercase font-bold tracking-widest text-primario-zen/50 bg-secundario-zen/30 px-2 py-0.5 rounded-full">
                {activeProject.name.substring(0, 1)}
              </span>
            )}
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/';
            }}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-semibold text-primario-zen/60 hover:text-primario-zen hover:bg-secundario-zen/30 px-3 py-1.5 rounded-full transition-colors"
          >
            <span>Salir</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
