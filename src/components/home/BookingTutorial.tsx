'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { MousePointer2, CalendarDays, CheckCircle2, ChevronDown } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    title: 'Selecciona tu servicio',
    short: 'Selecciona',
    icon: MousePointer2,
    color: 'from-[#f5f0e8] to-[#ede5d4]',
    glow: 'rgba(212,175,55,0.2)',
    detail:
      'Navega nuestro catálogo y elige el servicio que mejor refleja tu estilo del momento. Clásico, artístico, extensiones… tenemos opciones para cada personalidad.',
  },
  {
    number: '02',
    title: 'Elige tu momento',
    short: 'Elige',
    icon: CalendarDays,
    color: 'from-[#e8f0e2] to-[#d6e8d0]',
    glow: 'rgba(178,188,163,0.25)',
    detail:
      'Consulta nuestro calendario de disponibilidad y encuentra la fecha y hora que se adapte perfectamente a tu ritmo de vida. Reservar solo toma 2 minutos.',
  },
  {
    number: '03',
    title: 'Confirma y listo',
    short: 'Confirma',
    icon: CheckCircle2,
    color: 'from-[#f8f3e0] to-[#f0e8cc]',
    glow: 'rgba(212,175,55,0.25)',
    detail:
      'Ingresa tus datos y realiza el anticipo del 50% para asegurar tu momento Zen. Recibirás una confirmación al instante. Solo queda venir y disfrutar.',
  },
];

export default function BookingTutorial() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="w-full py-24 px-6 max-w-none">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-16"
      >
        <p className="text-accent-gold font-sans text-[11px] uppercase tracking-[0.3em] mb-3 font-semibold">
          Reserva en minutos
        </p>
        <h2 className="font-serif text-4xl md:text-5xl text-primario-zen leading-tight">
          Tu camino a la transformación
        </h2>
        <p className="mt-4 font-sans text-primario-zen/55 text-base max-w-md mx-auto">
          Sin complicaciones. Sin largas esperas. Solo tú, tu estilo y nuestras manos.
        </p>
      </motion.div>

      {/* Steps — horizontal desktop, vertical mobile */}
      <div className="relative max-w-4xl mx-auto">
        {/* Connecting line (desktop) */}
        <div className="hidden md:block absolute top-16 left-[16.5%] right-[16.5%] h-px bg-secundario-zen/50">
          <motion.div
            className="h-full bg-accent-gold/40"
            initial={{ scaleX: 0, originX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.3 }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isOpen = active === idx;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: idx * 0.14 }}
              >
                <button
                  onClick={() => setActive(isOpen ? null : idx)}
                  className={`w-full text-left relative rounded-3xl bg-gradient-to-br ${step.color} border transition-all duration-500 ${
                    isOpen
                      ? 'border-accent-gold/40 shadow-lg shadow-black/8'
                      : 'border-secundario-zen/50 hover:border-accent-gold/20 hover:shadow-md'
                  } overflow-hidden`}
                  style={{ boxShadow: isOpen ? `0 0 32px ${step.glow}` : undefined }}
                >
                  {/* Watermark number */}
                  <span
                    className="absolute top-2 right-4 font-serif text-8xl font-bold text-primario-zen/6 leading-none select-none pointer-events-none"
                    aria-hidden
                  >
                    {step.number}
                  </span>

                  <div className="relative z-10 p-7">
                    {/* Icon circle */}
                    <div className="w-14 h-14 rounded-full bg-white/60 border border-white/80 flex items-center justify-center mb-5 shadow-sm">
                      <Icon className="w-6 h-6 text-primario-zen" strokeWidth={1.8} />
                    </div>

                    <p className="font-sans text-[10px] uppercase tracking-widest text-primario-zen/40 mb-1">
                      Paso {step.number}
                    </p>
                    <h3 className="font-serif text-xl text-primario-zen mb-0">{step.title}</h3>

                    {/* Expand indicator */}
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute bottom-5 right-5 text-primario-zen/30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </div>

                  {/* Expandable detail */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="detail"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-7 pb-7 font-sans text-sm text-primario-zen/65 leading-relaxed">
                          {step.detail}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
