'use client';

import { motion } from 'framer-motion';
import { MousePointer2, CalendarDays, CheckCircle2 } from 'lucide-react';
import ZenCard from './ZenCard';

export default function BookingTutorial() {
  const steps = [
    {
      step: '01',
      title: 'Selecciona',
      description: 'Elige el servicio que mejor se adapte a tus necesidades y deseos.',
      icon: <MousePointer2 className="w-6 h-6 text-primario-zen" />,
    },
    {
      step: '02',
      title: 'Elige',
      description: 'Busca en nuestro calendario la fecha y hora que mejor te convengan.',
      icon: <CalendarDays className="w-6 h-6 text-primario-zen" />,
    },
    {
      step: '03',
      title: 'Confirma',
      description: 'Ingresa tus datos y realiza el anticipo para asegurar tu momento de paz.',
      icon: <CheckCircle2 className="w-6 h-6 text-primario-zen" />,
    },
  ];

  return (
    <section className="mb-12 w-full max-w-none px-6">
      <div className="text-center mb-8">
        <h2 className="text-primario-zen font-serif text-2xl uppercase tracking-widest">
          Cómo Reservar Tu Experiencia
        </h2>
        <div className="mt-4 p-3 bg-accent-gold/10 border border-accent-gold/20 rounded-full inline-block">
          <p className="text-[10px] text-accent-gold uppercase tracking-tighter font-bold italic">
            💡 Sugerencia: Usa verbos de acción directos. Haz que el proceso parezca sencillo y sin estrés. (Aprox. 20-40 palabras)
          </p>
        </div>
      </div>
      <div className="relative flex flex-col md:flex-row justify-between gap-8">
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-secundario-zen/30 -translate-y-1/2 z-0" />
        {steps.map((item, idx) => (
          <ZenCard key={idx} className="relative z-10 p-6 flex flex-col items-center text-center max-w-xs group hover:shadow-lg hover:shadow-accent-gold/5 transition-all">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-primario-zen flex items-center justify-center mb-4 shadow-sm group-hover:border-accent-gold transition-colors">
              {item.icon}
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-primario-zen/40 mb-1">
              Paso {item.step}
            </span>
            <h3 className="text-primario-zen font-serif text-xl mb-2 group-hover:text-accent-gold transition-colors">{item.title}</h3>
            <p className="text-primario-zen/60 text-sm font-sans leading-relaxed">
              {item.description}
            </p>
          </ZenCard>
        ))}
      </div>
    </section>
  );
}
