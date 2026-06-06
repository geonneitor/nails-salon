'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useBookingFlow } from '@/hooks/useBookingFlow';

export default function TimeStep({ data, onSelect, onBack }: {
  data: any,
  onSelect: (date: Date, slot: any) => void,
  onBack: () => void
}) {
  const { timeSlots, loadingSettings } = useBookingFlow();
  const [selectedDate, setSelectedDate] = useState(data.date);

  // Generate the next 14 days for a sophisticated horizontal picker
  const dateOptions = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  if (loadingSettings) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-primario-zen/50 animate-pulse">
        <div className="w-8 h-8 rounded-full border-2 border-primario-zen border-t-transparent animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest font-semibold">Sincronizando Horarios...</p>
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
          El Momento Perfecto
        </h2>
        <p className="text-primario-zen/60 font-sans text-sm max-w-md mx-auto">
          Encuentra el espacio donde el tiempo se detiene para tu bienestar.
        </p>
      </motion.div>

      {/* Date Selection - Organic Horizontal Scroll */}
      <div className="w-full max-w-3xl mb-12">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-primario-zen/40">
            Selecciona el día
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {dateOptions.map((date, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDate(date)}
              className={`flex-shrink-0 w-20 h-24 rounded-3xl transition-all duration-500 flex flex-col items-center justify-center snap-center border ${
                isSameDay(date, selectedDate)
                  ? 'bg-primario-zen text-fondo-zen border-primario-zen shadow-lg scale-105'
                  : 'bg-white/20 text-primario-zen border-white/40 hover:bg-white/30'
              }`}
            >
              <span className="text-xs uppercase font-medium opacity-60">
                {format(date, 'eee', { locale: es })}
              </span>
              <span className="text-xl font-serif font-light">
                {format(date, 'dd')}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Time Selection - Elegant Grid */}
      <div className="w-full max-w-2xl mb-12">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-primario-zen/40">
            Horas disponibles
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {timeSlots.map((slot) => (
            <motion.button
              key={slot.label}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(selectedDate, slot)}
              className={`py-3 rounded-2xl text-xs font-medium transition-all duration-300 border ${
                data.timeSlot.label === slot.label
                  ? 'bg-primario-zen text-fondo-zen border-primario-zen'
                  : 'bg-white/10 text-primario-zen/70 border-white/40 hover:border-primario-zen/40'
              }`}
            >
              {slot.label}
            </motion.button>
          ))}
        </div>
      </div>

      <motion.button
        onClick={onBack}
        className="text-primario-zen/40 hover:text-primario-zen text-[10px] uppercase tracking-widest font-bold transition-colors"
      >
        ← Regresar a servicios
      </motion.button>
    </div>
  );
}
