import type { Metadata } from 'next';
import AppClientLayout from './AppClientLayout';

export const metadata: Metadata = {
  title: 'Zen Nail Salon - Agenda',
  description: 'Sistema de gestión interna, calendario y agenda del salón Zen.',
  manifest: '/manifest-app.json',
};

export default function AppServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppClientLayout>{children}</AppClientLayout>;
}
