'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <main className="min-h-screen w-full bg-fondo-zen flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-8 max-w-md"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-error/10 blur-2xl scale-150" />
          <div className="relative w-20 h-20 rounded-3xl bg-white border border-error/20 flex items-center justify-center shadow-xl">
            <AlertCircle className="w-10 h-10 text-error" strokeWidth={1.5} />
          </div>
        </div>

        <div>
          <h2 className="font-serif text-3xl text-primario-zen mb-3">
            Algo salió mal
          </h2>
          <p className="font-sans text-primario-zen/60 text-sm leading-relaxed">
            Hubo un contratiempo inesperado en nuestro sistema. No te preocupes,
            estamos trabajando para restaurar la calma.
          </p>
        </div>

        {/* Contenedor de Botones - Etiqueta div cerrada correctamente */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-primario-zen text-fondo-zen font-sans text-sm font-semibold uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-sm"
          >
            <RefreshCcw className="w-4 h-4" />
            Reintentar
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-white/40 backdrop-blur-sm border border-secundario-zen/50 text-primario-zen/70 font-sans text-sm font-semibold uppercase tracking-widest hover:text-primario-zen transition-all"
          >
            <Home className="w-4 h-4" />
            Ir al Inicio
          </Link>
        </div>
      </motion.div>
    </main>
  );
}