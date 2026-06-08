'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen w-full bg-fondo-zen flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-accent-gold/20 blur-3xl scale-150" />
          <h1 className="relative font-serif text-9xl text-primario-zen opacity-20 select-none">
            404
          </h1>
        </div>

        <div className="relative z-10">
          <h2 className="font-serif text-3xl md:text-4xl text-primario-zen mb-4">
            Un camino perdido
          </h2>
          <p className="font-sans text-primario-zen/60 text-base max-w-sm mx-auto leading-relaxed mb-10">
            La página que buscas no existe o ha sido movida a otro espacio de calma.
            Te invitamos a regresar al sendero principal.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-primario-zen text-fondo-zen font-sans text-sm font-semibold uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-md"
          >
            <Home className="w-4 h-4" />
            Volver al Inicio
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-white/40 backdrop-blur-sm border border-secundario-zen/50 text-primario-zen/70 font-sans text-sm font-semibold uppercase tracking-widest hover:text-primario-zen transition-all"
          >
            <Search className="w-4 h-4" />
            Regresar
          </button>
        </div>
      </motion.div>
    </main>
  );
}
