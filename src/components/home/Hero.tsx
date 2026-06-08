'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-background"
    >
      {/* No blobs or distracting backgrounds */}


      {/* ── Hero content ── */}
      <motion.div
        style={{ y: contentY, opacity }}
        className="relative z-10 flex flex-col items-center px-6 text-center gap-6 mt-16"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-5xl md:text-7xl text-primary tracking-tight"
        >
          Rituales de Calma
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
          className="font-sans text-sm md:text-base text-primary/70 max-w-md leading-relaxed mx-auto"
        >
          Experiencia de serenidad y cuidado personal en un entorno diseñado para tu bienestar.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4"
        >
          <a
            href="#servicios"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-sans text-xs uppercase tracking-widest font-semibold bg-primary text-on-primary hover:bg-primary/90 transition-all shadow-sm"
          >
            Explorar Servicios
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
