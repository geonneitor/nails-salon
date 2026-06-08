'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

import { Clock, Leaf, Calendar } from 'lucide-react';

const RULES = [
  {
    icon: <Clock className="w-8 h-8 text-primario-zen" />,
    title: 'Puntualidad',
    body: 'Para preservar la calidad de cada sesión y el ritmo de tu experiencia, agradecemos tu puntualidad. Este espacio está pensado para ti — llegar a tiempo significa aprovecharlo al máximo.',
    side: 'left' as const,
  },
  {
    icon: <Leaf className="w-8 h-8 text-primario-zen" />,
    title: '15 minutos de gracia',
    body: 'Entendemos los imprevistos. Contamos con un margen de 15 minutos. Pasado ese tiempo, la cita podría reprogramarse para no afectar a quien espera después.',
    side: 'right' as const,
  },
  {
    icon: <Calendar className="w-8 h-8 text-primario-zen" />,
    title: 'Cancelaciones',
    body: 'Si necesitas cancelar o reprogramar, te pedimos hacerlo con al menos 24 horas de anticipación. Esto nos permite ofrecerle ese espacio a otra clienta.',
    side: 'left' as const,
  },
];

function TimelineItem({
  rule,
  idx,
}: {
  rule: (typeof RULES)[0];
  idx: number;
}) {
  const isLeft = rule.side === 'left';

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: idx * 0.15 }}
      className={`relative flex items-start gap-8 md:gap-0 ${
        isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
      }`}
    >
      {/* Content side */}
      <div className={`flex-1 ${isLeft ? 'md:pr-16 md:text-right' : 'md:pl-16 md:text-left'} pl-8 md:pl-0`}>
        <div
          className={`inline-block p-6 rounded-3xl bg-fondo-zen border border-secundario-zen/40 shadow-sm hover:shadow-md hover:border-accent-gold/30 transition-all duration-500 max-w-sm ${
            isLeft ? 'md:ml-auto' : ''
          }`}
        >
          <div className={`text-3xl mb-3 ${isLeft ? 'md:text-right' : 'md:text-left'}`} aria-hidden>
            {rule.icon}
          </div>
          <h3 className="font-serif text-xl text-primario-zen mb-2">{rule.title}</h3>
          <p className="font-sans text-sm text-primario-zen/60 leading-relaxed">{rule.body}</p>
        </div>
      </div>

      {/* Center dot — only visible on md+ */}
      <div className="hidden md:flex flex-col items-center flex-shrink-0 relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: idx * 0.15 + 0.2 }}
          className="w-5 h-5 rounded-full border-2 border-accent-gold bg-fondo-zen shadow-gold-glow"
        />
      </div>

      {/* Mobile dot on left edge */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: idx * 0.15 + 0.2 }}
        className="md:hidden absolute left-0 top-7 w-4 h-4 rounded-full border-2 border-accent-gold bg-fondo-zen shadow-gold-glow-sm"
      />

      {/* Empty spacer for alternating layout */}
      <div className="hidden md:block flex-1" />
    </motion.div>
  );
}

export default function TimeRules() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 80%', 'end 20%'],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section className="w-full py-24 px-6 max-w-none">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-20"
      >
        <p className="text-accent-gold font-sans text-[11px] uppercase tracking-[0.3em] mb-3 font-semibold">
          Nuestro ritual
        </p>
        <h2 className="font-serif text-4xl md:text-5xl text-primario-zen leading-tight">
          El tiempo como respeto
        </h2>
        <p className="mt-4 font-sans text-primario-zen/55 text-base max-w-md mx-auto leading-relaxed">
          La puntualidad es un acto de cuidado mutuo. Estas son las bases que nos permiten brindarte la mejor experiencia.
        </p>
      </motion.div>

      {/* Timeline */}
      <div ref={timelineRef} className="relative max-w-3xl mx-auto">
        {/* Animated vertical line (desktop) */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-secundario-zen/50 -translate-x-1/2">
          <motion.div
            className="absolute top-0 left-0 w-full bg-accent-gold/60"
            style={{ height: lineHeight }}
          />
        </div>

        {/* Mobile left line */}
        <div className="md:hidden absolute left-2 top-0 bottom-0 w-px bg-secundario-zen/50">
          <motion.div
            className="absolute top-0 left-0 w-full bg-accent-gold/60"
            style={{ height: lineHeight }}
          />
        </div>

        <div className="flex flex-col gap-12">
          {RULES.map((rule, idx) => (
            <TimelineItem key={idx} rule={rule} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
