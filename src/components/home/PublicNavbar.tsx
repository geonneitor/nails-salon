'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PublicNavbar() {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-0 left-0 w-full z-50 py-6 px-6 md:px-12 flex justify-between items-center"
    >
      <div className="flex items-center">
        <Link href="/">
          <img src="/zen-logo.png" alt="Zen Nail Salon" className="h-8 w-auto object-contain" />
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-8 font-sans text-[11px] uppercase tracking-widest font-semibold text-primary/80">
        <a href="#servicios" className="hover:text-primary transition-colors">Servicios</a>
        <a href="#disponibilidad" className="hover:text-primary transition-colors">Disponibilidad</a>
      </div>

      <div>
        <Link 
          href="/reserva"
          className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-sans text-xs uppercase tracking-widest font-semibold hover:opacity-90 transition-all shadow-sm"
        >
          Reservar
        </Link>
      </div>
    </motion.nav>
  );
}
