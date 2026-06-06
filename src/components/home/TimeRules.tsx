'use client';

import { motion } from 'framer-motion';
import { Clock, AlertCircle, CalendarX } from 'lucide-react';
import ZenCard from './ZenCard';

export default function TimeRules() {
  const rules = [
    {
      title: 'Puntualidad',
      description: 'Para mantener el ambiente Zen y la calidad de cada servicio, agradecemos tu puntualidad. Esto nos permite dedicarte el tiempo que mereces sin prisas.',
      icon: <Clock className="w-5 h-5 text-primario-zen" />,
    },
    {
      title: 'Periodo de Gracia',
      description: 'Entendemos los imprevistos. Contamos con un periodo de gracia de 15 minutos. Pasado este tiempo, la cita podría ser reprogramada para no afectar a la siguiente clienta.',
      icon: <AlertCircle className="w-5 h-5 text-primario-zen" />,
    },
    {
      title: 'Cancelaciones',
      description: 'Si necesitas cancelar o reprogramar, te pedimos hacerlo con al menos 24 horas de anticipación para liberar el espacio a otra persona.',
      icon: <CalendarX className="w-5 h-5 text-primario-zen" />,
    },
  ];

  return (
    <section className="mb-12 w-full max-w-none px-6">
      <div className="text-center mb-8">
        <h2 className="text-primario-zen font-serif text-2xl uppercase tracking-widest">
          Políticas de Tiempo y Citas
        </h2>
        <div className="mt-4 p-3 bg-accent-gold/10 border border-accent-gold/20 rounded-full inline-block">
          <p className="text-[10px] text-accent-gold uppercase tracking-tighter font-bold italic">
            💡 Sugerencia: Sé firme pero amable. Explica por qué la puntualidad es vital para la experiencia Zen. (Aprox. 30-50 palabras)
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rules.map((rule, idx) => (
          <ZenCard key={idx} className="group p-6 flex flex-col items-center text-center hover:shadow-lg hover:shadow-accent-gold/5 transition-all">
            <div className="p-3 bg-primario-zen/10 rounded-full mb-4 group-hover:bg-accent-gold/20 transition-colors">
              {rule.icon}
            </div>
            <h3 className="text-primario-zen font-serif text-lg mb-2 group-hover:text-accent-gold transition-colors">{rule.title}</h3>
            <p className="text-primario-zen/60 text-sm font-sans leading-relaxed">
              {rule.description}
            </p>
          </ZenCard>
        ))}
      </div>
    </section>
  );
}
