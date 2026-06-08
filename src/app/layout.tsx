import type { Metadata } from 'next';
import { Libre_Caslon_Text, Manrope } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { ConfirmDialogProvider } from '@/components/ui/ConfirmDialog';

const libreCaslon = Libre_Caslon_Text({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-caslon',
});

const manrope = Manrope({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'Zen Nail Salon - Rituales de Calma',
  description: 'Sistema premium de gestión de citas para salón de uñas.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${libreCaslon.variable} ${manrope.variable}`}>
      <body className="font-sans antialiased">
        <AppProvider>
          <ToastProvider>
            <ConfirmDialogProvider>
              {children}
            </ConfirmDialogProvider>
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
