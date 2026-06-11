'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 w-full h-full"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1600948836101-f9ff15e720f7?auto=format&fit=crop&q=80&w=2000")',
          }}
        />
        {/* Dark Botanical Gradient Overlay for premium aesthetics and readability */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(26, 31, 20, 0.85) 0%, rgba(26, 31, 20, 0.75) 60%, var(--background) 100%)'
          }}
        />
      </motion.div>

      {/* Glassmorphism Content Box */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex flex-col items-center px-6 md:px-12 py-16 text-center max-w-4xl mt-20"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-16 rounded-[2.5rem] shadow-2xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-6 flex justify-center"
          >
            <span className="px-4 py-1.5 rounded-full border border-white/20 text-white/80 text-[10px] uppercase tracking-[0.2em] font-medium backdrop-blur-sm">
              Estudio de Autor
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl text-white tracking-tight mb-6 drop-shadow-lg"
          >
            Rituales de Calma
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
            className="font-sans text-sm md:text-lg text-white/80 max-w-xl leading-relaxed mx-auto mb-10 font-light"
          >
            Experimenta el verdadero cuidado personal en un entorno diseñado exclusivamente para tu bienestar y armonía.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/reserva"
              className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 rounded-full font-sans text-xs uppercase tracking-[0.15em] font-semibold bg-white text-primary hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Reservar Cita
            </Link>
            <a
              href="#servicios"
              className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 rounded-full font-sans text-xs uppercase tracking-[0.15em] font-semibold text-white border border-white/30 hover:bg-white/10 transition-colors"
            >
              Ver Menú
            </a>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
