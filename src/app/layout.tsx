import type { Metadata } from 'next';
import { Libre_Caslon_Text, Manrope } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { ConfirmDialogProvider } from '@/components/ui/ConfirmDialog';
import { ZenAssistantProvider } from '@/context/ZenAssistantContext';
import { ZenAssistantOverlay } from '@/components/tutorial/ZenAssistantOverlay';
import { Analytics } from '@vercel/analytics/next';

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
        {/* Prevenir parpadeo de tema oscuro (FOUC) */}
        <Script id="theme-initializer" strategy="beforeInteractive">
          {`
            try {
              if (localStorage.getItem('theme') === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (_) {}
          `}
        </Script>
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

        {/* Registro del Service Worker para PWA */}
        <Script id="sw-registration" strategy="lazyOnload">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('ServiceWorker registration successful');
                }, function(err) {
                  console.log('ServiceWorker registration failed: ', err);
                });
              });
            }
          `}
        </Script>
        <Analytics />
      </body>
    </html>
  );
}
