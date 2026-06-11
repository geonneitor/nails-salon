'use client';

import Link from 'next/link';
import { ChevronLeft, BookOpen } from 'lucide-react';
import ZenBookingJourney from '@/components/home/ZenBookingJourney';

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-fondo-zen flex flex-col">
      {/* ── Barra de navegación sticky ── */}
      <header className="w-full border-b border-secundario-zen/30 bg-fondo-zen/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" aria-label="Ir al inicio">
            <img
              src="/zen-logo.svg"
              alt="Zen Nail Salon"
              className="h-8 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
            />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-primario-zen/50 hover:text-primario-zen font-sans text-xs font-semibold uppercase tracking-widest transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Volver
          </Link>
        </div>
      </header>

      {/* ── Contenido principal ── */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-5 py-12 md:py-16">
        {/* Hero de la página */}
        <div className="text-center mb-14 flex flex-col items-center">
          <span className="inline-block text-[10px] uppercase tracking-[0.25em] font-semibold text-primario-zen/40 mb-4">
            Reserva en línea
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-primario-zen leading-tight mb-4">
            Agenda tu ritual
          </h1>
          <p className="font-sans text-sm text-primario-zen/50 max-w-sm mx-auto leading-relaxed">
            Completa los pasos a continuación. Tu cita queda confirmada al abonar el anticipo del 50%.
          </p>
          
          <div className="mt-4">
            <Link
              href="/manual-usuario"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primario-zen/5 hover:bg-primario-zen/10 border border-primario-zen/10 rounded-full text-[10px] text-primario-zen font-sans font-semibold uppercase tracking-wider transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Guía de Reserva & Ayuda
            </Link>
          </div>
        </div>

        {/* El formulario de reserva paso a paso */}
        <ZenBookingJourney />
      </main>

      {/* ── Footer mínimo ── */}
      <footer className="border-t border-secundario-zen/30 py-6 text-center">
        <p className="font-sans text-[10px] uppercase tracking-widest text-primario-zen/30">
          © {new Date().getFullYear()} Zen Nail Salon · Rituales de Calma
        </p>
      </footer>
    </div>
  );
}
