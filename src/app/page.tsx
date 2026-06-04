'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-fondo-zen flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Atmospheric Background Effect */}
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-sage/20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-gold/10 blur-[120px] animate-pulse" />

      {/* Content Wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-20 flex flex-col items-center"
      >
        {/* Logo Section: No box, pure atmospheric integration */}
        <div className="flex flex-col items-center mb-16 group cursor-pointer">
          <div className="relative w-64 md:w-80 transition-transform duration-700 group-hover:scale-105">
            {/* Soft glow behind logo that intensifies on hover */}
            <div className="absolute inset-0 bg-accent-gold/20 blur-3xl rounded-full transition-opacity duration-500 group-hover:opacity-100 opacity-40" />

            <div className="relative z-30 w-full h-auto drop-shadow-2xl">
              <svg width="300" height="150" viewBox="0 0 300 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                <circle cx="150" cy="75" r="60" fill="url(#zen-gradient)" fillOpacity="0.2" />
                <circle cx="150" cy="75" r="45" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="10 5" opacity="0.6" />
                <circle cx="150" cy="75" r="42" stroke="#D4AF37" strokeWidth="0.5" />
                <text x="150" y="82" textAnchor="middle" fontFamily="Georgia, serif" fontSize="32" fontWeight="300" fill="#4A533E" letterSpacing="0.2em">ZEN</text>
                <circle cx="150" cy="95" r="2" fill="#D4AF37" />
                <defs>
                  <linearGradient id="zen-gradient" x1="150" y1="15" x2="150" y2="135" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#D4AF37" />
                    <stop offset="1" stopColor="#D4AF37" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Zen Dots: Now as elegant separators with a subtle glow */}
          <div className="flex gap-3 mt-6 relative z-30">
            {Array.from({ length: 7 }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="w-1.5 h-1.5 rounded-full bg-primario-zen shadow-[0_0_5px_var(--accent-gold)]"
              />
            ))}
          </div>
        </div>

        {/* Entry Button: "Zen Pebble" with glow and tactile feel */}
        <Link href="/calendar">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="zen-glow-hover zen-glow-touch bg-primario-zen text-fondo-zen px-12 py-4 rounded-full uppercase tracking-[0.2em] text-xs font-semibold shadow-xl relative overflow-hidden group"
          >
            <span className="relative z-10">Ingresar</span>
            {/* Shine effect across the button */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pearl-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </motion.button>
        </Link>
      </motion.div>
    </main>
  );
}
