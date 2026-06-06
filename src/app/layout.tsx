import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'Salón de Uñas - Gestión de Citas',
  description: 'Sistema premium de gestión de citas para salón de uñas.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <AppProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AppProvider>
      </body>
    </html>
  );
}


