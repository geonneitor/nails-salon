'use client';

import { motion } from 'framer-motion';
import ZenCard from './ZenCard';

export default function BrandInfo() {
  return (
    <section className="mb-12 w-full max-w-none px-6">
      <div className="text-center mb-8">
        <h2 className="text-primario-zen font-serif text-2xl uppercase tracking-widest">
          Nuestros Diseños y Estilos
        </h2>
        <div className="mt-4 p-3 bg-accent-gold/10 border border-accent-gold/20 rounded-full inline-block">
          <p className="text-[10px] text-accent-gold uppercase tracking-tighter font-bold italic">
            💡 Sugerencia: Describe aquí la esencia de tu arte. Tono: Inspirador y sofisticado. (Aprox. 40-60 palabras)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          {
            title: 'Clásicos y Naturales',
            desc: 'Desde la elegancia de un tono nude hasta el clásico rojo sofisticado. Ideal para quienes buscan una apariencia limpia, profesional y atemporal.',
          },
          {
            title: 'Arte y Tendencia',
            desc: 'Exploramos la creatividad con efectos 3D, cristales, diseños abstractos y tendencias actuales. Cada uña es un lienzo donde plasmamos tu personalidad.',
          },
          {
            title: 'Sistemas de Extensión',
            desc: 'Especialistas en Gel y Acrílico. Ajustamos la forma y el largo según tu anatomía para lograr un acabado natural y resistente.',
          },
          {
            title: 'Tu Visión, Nuestro Arte',
            desc: 'Puedes traer tus propias referencias o dejarnos asesorarte. Toda la magia comienza con una conversación sobre lo que deseas proyectar.',
          },
        ].map((item, idx) => (
          <ZenCard key={idx} className="group p-6 hover:shadow-lg hover:shadow-accent-gold/5 transition-all">
            <h3 className="text-primario-zen font-serif text-xl mb-4 group-hover:text-accent-gold transition-colors">
              {item.title}
            </h3>
            <p className="text-primario-zen/70 font-sans text-sm leading-relaxed">
              {item.desc}
            </p>
          </ZenCard>
        ))}
      </div>
    </section>
  );
}
