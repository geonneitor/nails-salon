'use client';

import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useApp } from '@/context/AppContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, preferences } = useApp();

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
      {children}
    </main>
    <MobileNav />
  </div>
);
}
