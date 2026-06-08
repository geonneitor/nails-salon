'use client';

import { motion } from 'framer-motion';

const SERVICES = [
  {
    title: 'Manicura Ritual',
    description: 'Cuidado completo de manos con hidratación profunda y esmaltado natural.',
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Pedicura Zen',
    description: 'Revitalización de pies con exfoliación de sales minerales y piedras calientes.',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
];

export default function ServicesShowcase() {
  return (
    <section id="servicios" className="py-24 px-4 sm:px-6 w-full bg-background">
      <div className="text-center mb-16">
        <h2 className="font-serif text-3xl md:text-5xl text-primary tracking-wide mb-4">
          Nuestros Servicios
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {SERVICES.map((srv, idx) => (
          <motion.div
            key={srv.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: idx * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col group cursor-pointer"
          >
            <div className="relative w-full aspect-[4/3] md:aspect-video rounded-xl overflow-hidden mb-6 bg-surface-container">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${srv.image})` }}
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
            </div>
            
            <div className="flex justify-between items-baseline mb-3">
              <h3 className="font-serif text-xl md:text-2xl text-primary">{srv.title}</h3>
            </div>
            <p className="font-sans text-sm text-primary/60 leading-relaxed max-w-[90%]">
              {srv.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
