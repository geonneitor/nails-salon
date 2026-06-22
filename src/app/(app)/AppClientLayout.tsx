'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

import { LotitoAgentProvider } from '@/context/LotitoAgentContext';
import { LotitoChatWidget } from '@/components/layout/LotitoChatWidget';
import { NotificationOptIn } from '@/components/notifications/NotificationOptIn';

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
      <NotificationOptIn />
    </LotitoAgentProvider>
  );
}
