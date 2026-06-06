'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useServices } from '@/hooks/useServices';

export default function ServiceStep({ data, onSelect }: { data: any, onSelect: (id: string) => void }) {
  const { services, isLoading } = useServices();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-primario-zen/50 animate-pulse">
        <div className="w-8 h-8 rounded-full border-2 border-primario-zen border-t-transparent animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest font-semibold">Sincronizando Esencias...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-primario-zen font-serif text-3xl uppercase tracking-widest mb-3">
          Elige tu Ritual
        </h2>
        <p className="text-primario-zen/60 font-sans text-sm max-w-md mx-auto">
          Selecciona el tratamiento que resonará con tu energía hoy.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {services.map((service) => (
          <motion.div
            key={service.id}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(service.id)}
            className={`group relative p-6 rounded-3xl cursor-pointer transition-all duration-500 border ${
              data.serviceId === service.id
                ? 'bg-white/40 border-primario-zen shadow-xl shadow-primario-zen/10'
                : 'bg-white/20 border-white/40 hover:bg-white/30'
            } backdrop-blur-md overflow-hidden`}
          >
            {/* Ambient Glow on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-primario-zen font-serif text-xl uppercase tracking-tight group-hover:text-primario-zen transition-colors">
                  {service.name}
                </h3>
                <span className="text-xs font-semibold text-primario-zen/40 group-hover:text-accent-gold transition-colors">
                  ${service.price}
                </span>
              </div>

              <div className="mt-auto flex items-center gap-2 text-primario-zen/60 text-xs uppercase tracking-widest font-medium">
                <div className="w-1 h-1 rounded-full bg-primario-zen/40" />
                {service.duration_minutes} Minutos
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
