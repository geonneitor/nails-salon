'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useBookingFlow } from '@/hooks/useBookingFlow';
import { Clock, CalendarDays } from 'lucide-react';

export default function TimeStep({
  data,
  onSelect,
  onBack,
}: {
  data: any;
  onSelect: (date: Date, slot: any) => void;
  onBack: () => void;
}) {
  const { loadingSettings, getDailySlots } = useBookingFlow();
  const [selectedDate, setSelectedDate] = useState<Date>(data.date ?? new Date());
  const [selectedSlot, setSelectedSlot] = useState<any>(data.timeSlot ?? null);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadSlots() {
      setLoadingSlots(true);
      try {
        const slots = await getDailySlots(selectedDate);
        if (active) {
          setTimeSlots(slots);
        }
      } catch (err) {
        console.error("Error loading slots:", err);
      } finally {
        if (active) setLoadingSlots(false);
      }
    }
    loadSlots();
    return () => { active = false; };
  }, [selectedDate, getDailySlots]);

  const dateOptions = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  const handleContinue = () => {
    if (!selectedSlot) return;
    onSelect(selectedDate, selectedSlot);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-primario-zen/8 px-4 py-1.5 rounded-full mb-4">
          <CalendarDays className="w-3.5 h-3.5 text-primario-zen/60" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-primario-zen/60">
            Elige tu momento
          </span>
        </div>
        <h2 className="font-serif text-3xl text-primario-zen mb-2">¿Cuándo nos vemos?</h2>
        <p className="text-primario-zen/50 font-sans text-sm">
          Selecciona el día y la hora que mejor te acomode.
        </p>
      </div>

      {/* Date picker */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-widest font-bold text-primario-zen/40 mb-4 px-1">
          Próximas 2 semanas
        </p>
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide snap-x -mx-1 px-1">
          {dateOptions.map((date, i) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = i === 0;
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 w-[68px] h-[80px] rounded-2xl flex flex-col items-center justify-center snap-center border transition-all duration-300 ${
                  isSelected
                    ? 'bg-primario-zen text-fondo-zen border-primario-zen shadow-md'
                    : 'bg-surface-container-lowest border-outline-variant/40 text-primario-zen hover:border-primario-zen/40 hover:bg-surface-container'
                }`}
              >
                <span className={`text-[10px] uppercase font-semibold mb-0.5 ${isSelected ? 'opacity-70' : 'text-primario-zen/50'}`}>
                  {isToday ? 'Hoy' : format(date, 'eee', { locale: es })}
                </span>
                <span className="font-serif text-xl font-light leading-none">
                  {format(date, 'd')}
                </span>
                <span className={`text-[9px] mt-1 ${isSelected ? 'opacity-60' : 'text-primario-zen/40'}`}>
                  {format(date, 'MMM', { locale: es })}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Time slots — FIXED: siempre muestra slots gracias al fallback del hook */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4 px-1">
          <Clock className="w-3.5 h-3.5 text-primario-zen/40" />
          <p className="text-[10px] uppercase tracking-widest font-bold text-primario-zen/40">
            Horarios disponibles
          </p>
        </div>

        {loadingSettings || loadingSlots ? (
          /* Skeleton mientras carga */
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-10 rounded-xl bg-surface-container animate-pulse" />
            ))}
          </div>
        ) : timeSlots.length === 0 ? (
          /* Empty state de seguridad (no debería ocurrir con el fallback) */
          <div className="text-center py-10 text-primario-zen/40 text-sm border border-dashed border-outline-variant/40 rounded-2xl">
            No hay horarios configurados. Contáctanos directamente.
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {timeSlots.map((slot: any) => {
              const isSelected = selectedSlot?.label === slot.label;
              return (
                <motion.button
                  key={slot.label}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border ${
                    isSelected
                      ? 'bg-primario-zen text-fondo-zen border-primario-zen shadow-sm'
                      : 'bg-surface-container-lowest border-outline-variant/40 text-primario-zen/70 hover:border-primario-zen/50 hover:text-primario-zen'
                  }`}
                >
                  {slot.label}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <button
          onClick={onBack}
          className="text-primario-zen/40 hover:text-primario-zen text-[10px] uppercase tracking-widest font-bold transition-colors"
        >
          ← Volver
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedSlot}
          className={`w-full sm:w-auto px-10 py-3.5 rounded-full font-sans text-xs font-semibold uppercase tracking-widest transition-all ${
            selectedSlot
              ? 'bg-primario-zen text-fondo-zen shadow-sm hover:opacity-90'
              : 'bg-surface-container text-primario-zen/30 cursor-not-allowed'
          }`}
        >
          {selectedSlot
            ? `Continuar · ${selectedSlot.label}`
            : 'Selecciona un horario'}
        </button>
      </div>
    </div>
  );
}
