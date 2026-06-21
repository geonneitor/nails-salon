'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

import { LotitoAgentProvider } from '@/context/LotitoAgentContext';
import { LotitoChatWidget } from '@/components/layout/LotitoChatWidget';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We can add specific auth checks here to ensure only authorized users enter the (app) zone

  return (
    <LotitoAgentProvider>
      <DashboardLayout>
        {children}
      </DashboardLayout>
      <LotitoChatWidget />
    </LotitoAgentProvider>
  );
}
