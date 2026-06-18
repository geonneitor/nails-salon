import type { Metadata } from 'next';
import { Libre_Caslon_Text, Manrope } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { ConfirmDialogProvider } from '@/components/ui/ConfirmDialog';
import { ZenAssistantProvider } from '@/context/ZenAssistantContext';
import { ZenAssistantOverlay } from '@/components/tutorial/ZenAssistantOverlay';

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
    <html lang="es" className={`${libreCaslon.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <AppProvider>
          <ToastProvider>
            <ConfirmDialogProvider>
              <ZenAssistantProvider>
                {children}
                <ZenAssistantOverlay />
              </ZenAssistantProvider>
            </ConfirmDialogProvider>
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
