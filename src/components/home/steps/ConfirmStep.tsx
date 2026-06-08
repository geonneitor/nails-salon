'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function ConfirmStep({ data, onConfirm, onBack, isSubmitting, error }: {
  data: any,
  onConfirm: () => void,
  onBack: () => void,
  isSubmitting: boolean,
  error?: string | null
}) {
  const { ticketDetails } = data;
  const serviceNames = ticketDetails?.activeServices?.join(' + ') || 'Servicio Dinámico';

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-primario-zen font-serif text-3xl uppercase tracking-widest mb-3">
          Sincronía Final
        </h2>
        <p className="text-primario-zen/60 font-sans text-sm max-w-md mx-auto">
          Revisa que todo esté en armonía antes de confirmar tu cita.
        </p>
      </motion.div>

      <div className="w-full max-w-md bg-white/20 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-xl">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between py-3 border-b border-white/20">
            <span className="text-[10px] uppercase tracking-widest font-bold text-primario-zen/40">Ritual</span>
            <div className="text-right">
              <p className="font-medium text-primario-zen text-sm">{serviceNames}</p>
              <p className="text-xs text-primario-zen/60">
                ~{ticketDetails?.totalDuration || 0} Minutos • ${ticketDetails?.totalPrice || 0} MXN
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-white/20">
            <span className="text-[10px] uppercase tracking-widest font-bold text-primario-zen/40">Fecha y Hora</span>
            <span className="text-primario-zen font-serif text-lg">
              {format(data.date, 'dd MMM yyyy')} - {data.timeSlot.label}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-[10px] uppercase tracking-widest font-bold text-primario-zen/40">Santuario</span>
            <span className="text-primario-zen font-serif text-lg">{data.name}</span>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-3 bg-red-400/20 border border-red-400/40 rounded-xl text-red-600 text-xs text-center font-semibold"
          >
            {error}
          </motion.div>
        )}

        <div className="flex flex-col gap-4 mt-10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full bg-primario-zen text-fondo-zen py-4 rounded-full uppercase tracking-widest text-xs font-bold shadow-xl disabled:opacity-50 transition-all"
          >
            {isSubmitting ? 'Sincronizando...' : 'Confirmar Reserva'}
          </motion.button>

          <button
            onClick={onBack}
            className="text-primario-zen/40 hover:text-primario-zen text-[10px] uppercase tracking-widest font-bold transition-colors text-center"
          >
            ← Ajustar Detalles
          </button>
        </div>
      </div>
    </div>
  );
}
