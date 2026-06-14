import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zen Nail Salon - Reservar Cita',
  description: 'Portal de reserva de citas y rituales de calma.',
  manifest: '/manifest-reserva.json',
};

export default function ReservaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
