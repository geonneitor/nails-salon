'use client';

import Link from 'next/link';
import PublicNavbar from '@/components/home/PublicNavbar';
import Hero from '@/components/home/Hero';
import ServicesShowcase from '@/components/home/ServicesShowcase';
import PaymentDetails from '@/components/home/PaymentDetails';
import TimeRules from '@/components/home/TimeRules';

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      {/* ── Navbar ── */}
      <PublicNavbar />

      {/* ── Hero con diseño Boutique Minimalista ── */}
      <Hero />

      {/* ── Estilos y categorías de servicio (Showcase con fotos) ── */}
      <ServicesShowcase />



      {/* ── Política de pagos y anticipo ── */}
      <PaymentDetails />

      {/* ── Reglas de tiempo y puntualidad ── */}
      <TimeRules />

      {/* ── CTA band ── */}
      <div className="py-32 px-6 text-center bg-surface-container-low border-t border-surface-container-highest relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-full opacity-10 bg-[url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3')] bg-cover bg-center mix-blend-multiply" />
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-primary/50 mb-6 block">
            Comienza tu viaje
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-primary mb-10 leading-tight">
            Tu momento de calma absoluta<br />te está esperando.
          </h2>
          <Link
            href="/reserva"
            className="inline-flex items-center justify-center px-12 py-5 rounded-full font-sans text-xs uppercase tracking-[0.15em] font-semibold bg-primary text-white hover:bg-primary-container hover:scale-105 transition-all shadow-xl"
          >
            Agendar Ahora
          </Link>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="py-16 px-6 md:px-12 bg-white border-t border-surface-container">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <img src="/zen-logo.svg" alt="Zen Nail Salon" className="h-14 w-auto object-contain opacity-80" />
          <p className="font-sans text-[11px] uppercase tracking-widest text-primary/40 text-center">
            © {new Date().getFullYear()} Zen Nail Salon.<br />Rituales de Calma.
          </p>
          <div className="flex gap-8">
            {['Contacto', 'Horarios', 'Privacidad'].map((link) => (
              <a
                key={link}
                href="#"
                className="font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-primary/40 hover:text-primary transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
