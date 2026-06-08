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
      <div className="py-20 px-6 text-center bg-primary text-on-primary">
        <h2 className="font-serif text-3xl md:text-4xl mb-8">
          Tu próxima cita, a un toque de distancia
        </h2>
        <Link
          href="/reserva"
          className="inline-flex items-center justify-center px-10 py-4 rounded-full font-sans text-sm uppercase tracking-widest font-semibold bg-background text-primary hover:bg-white transition-all shadow-md"
        >
          Agendar Ahora
        </Link>
      </div>

      {/* ── Footer ── */}
      <footer className="py-12 px-6 bg-surface-container-lowest border-t border-surface-container">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <img src="/zen-logo.svg" alt="Zen Nail Salon" className="h-12 w-auto object-contain opacity-60 grayscale" />
          <p className="font-sans text-xs text-primary/60 text-center">
            © {new Date().getFullYear()} Zen Nail Salon. Rituales de Calma.
          </p>
          <div className="flex gap-6">
            {['Contacto', 'Horarios', 'Privacidad', 'Términos'].map((link) => (
              <a
                key={link}
                href="#"
                className="font-sans text-[11px] font-semibold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
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
