import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ProjectProvider } from '@/context/ProjectContext';

export const metadata: Metadata = {
  title: 'Salón de Uñas - Gestión de Citas',
  description: 'Sistema premium de gestión de citas para salón de uñas.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <AppProvider>
          <ProjectProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </ProjectProvider>
        </AppProvider>
      </body>
    </html>
  );
}


