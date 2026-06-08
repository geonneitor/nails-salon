'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const SERVICES = [
  {
    title: 'Manicura Ritual',
    description: 'Cuidado completo de manos con hidratación profunda y esmaltado natural.',
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    className: 'md:col-span-2 md:row-span-2',
  },
  {
    title: 'Pedicura Zen',
    description: 'Revitalización de pies con exfoliación de sales minerales y piedras calientes.',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    className: 'md:col-span-1 md:row-span-1',
  },
  {
    title: 'Arte & Diseño',
    description: 'Expresión artística a mano alzada para un toque único.',
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    className: 'md:col-span-1 md:row-span-1',
  },
  {
    title: 'Extensiones Acrílicas',
    description: 'Alargamiento perfecto con técnicas de vanguardia.',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    className: 'md:col-span-2 md:row-span-1',
  },
];

export default function ServicesShowcase() {
  return (
    <section id="servicios" className="py-24 px-4 md:px-8 w-full bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs uppercase tracking-[0.2em] font-semibold text-primary/50 mb-4 block"
            >
              Nuestra Colección
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-4xl md:text-5xl text-primary tracking-wide leading-tight"
            >
              El arte del detalle,<br />elevado a la perfección.
            </motion.h2>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/reserva"
              className="group flex items-center gap-2 text-sm uppercase tracking-widest font-semibold text-primary hover:text-accent-gold-dark transition-colors"
            >
              Ver Menú Completo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[300px] gap-4 md:gap-6">
          {SERVICES.map((srv, idx) => (
            <motion.div
              key={srv.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: idx * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative rounded-[2rem] overflow-hidden bg-surface-container ${srv.className}`}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                style={{ backgroundImage: `url(${srv.image})` }}
              />
              
              {/* Elegant Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
              
              {/* Content */}
              <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="font-serif text-2xl md:text-3xl text-white mb-2 drop-shadow-md">
                  {srv.title}
                </h3>
                <p className="font-sans text-sm text-white/80 leading-relaxed max-w-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  {srv.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
