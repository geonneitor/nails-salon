'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useApp } from '@/context/AppContext';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We can add specific auth checks here to ensure only authorized users enter the (app) zone

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
