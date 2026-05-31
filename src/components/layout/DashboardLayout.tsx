'use client';

import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useApp } from '@/context/AppContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { Loader2 } from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-fondo-zen items-center justify-center">
        <Loader2 className="w-8 h-8 text-primario-zen/50 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen bg-fondo-zen items-center justify-center p-6">
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-fondo-zen relative">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
