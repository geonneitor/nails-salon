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
          <img src="/zen-logo.svg" alt="Zen Nail Salon" className="h-12 w-auto object-contain brightness-0 invert drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" />
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-8 font-sans text-[11px] uppercase tracking-widest font-semibold text-white/80 drop-shadow-sm">
        <a href="#servicios" className="hover:text-white transition-colors">Servicios</a>
        <a href="#disponibilidad" className="hover:text-white transition-colors">Disponibilidad</a>
      </div>

      <div>
        <Link 
          href="/reserva"
          className="px-6 py-2.5 bg-white text-primary rounded-full font-sans text-xs uppercase tracking-widest font-semibold hover:bg-white/90 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        >
          Reservar
        </Link>
      </div>
    </motion.nav>
  );
}
