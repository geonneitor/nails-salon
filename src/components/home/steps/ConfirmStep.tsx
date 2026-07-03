'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Sparkle, 
  Sparkles, 
  Calendar, 
  User, 
  Clock, 
  CreditCard,
  AlertCircle
} from 'lucide-react';

export default function ConfirmStep({ data, onConfirm, onBack, isSubmitting, error }: {
  data: any,
  onConfirm: () => void,
  onBack: () => void,
  isSubmitting: boolean,
  error?: string | null
}) {
  const { ticketDetails } = data;
  const serviceNames = ticketDetails?.activeServices?.join(' + ') || 'Servicio Dinámico';

  // Formatear la fecha de forma más legible
  const formattedDate = data.date 
    ? format(data.date, "EEEE, dd 'de' MMMM yyyy", { locale: es })
    : '';

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 bg-primario-zen/8 px-4 py-1.5 rounded-full mb-3">
          <Sparkle className="w-3.5 h-3.5 text-primario-zen/60" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-primario-zen/60">
            Paso 4 · Sincronía
          </span>
        </div>
        <h2 className="text-primario-zen font-serif text-3xl mb-2">
          Resumen del Ritual
        </h2>
        <p className="text-primario-zen/50 font-sans text-sm max-w-sm mx-auto leading-relaxed">
          Revisa los detalles seleccionados para tu espacio de calma antes de reservar.
        </p>
      </div>

      {/* Ticket Card */}
      <div className="w-full bg-surface-container-lowest/70 border border-outline-variant/30 rounded-3xl p-6 sm:p-8 shadow-sm backdrop-blur-sm relative overflow-hidden">
        {/* Adorno estético superior del ticket */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-accent-gold-primary via-primario-zen to-accent-lavender" />

        <div className="flex flex-col gap-6">
          {/* Fila: Ritual / Servicios */}
          <div className="flex items-start gap-4 py-4 border-b border-outline-variant/30">
            <div className="w-10 h-10 rounded-xl bg-primario-zen/5 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-primario-zen" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <span className="text-[9px] uppercase tracking-widest font-bold text-primario-zen/40 block mb-1">
                Servicios seleccionados
              </span>
              <p className="font-semibold text-primario-zen text-sm leading-snug">
                {serviceNames}
              </p>
              <p className="text-xs text-primario-zen/50 mt-1 flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {ticketDetails?.totalDuration || 0} min
                </span>
                <span>•</span>
                <span className="font-serif font-semibold">
                  ${ticketDetails?.totalPrice || 0} MXN
                </span>
              </p>
            </div>
          </div>

          {/* Fila: Fecha y Hora */}
          <div className="flex items-start gap-4 py-4 border-b border-outline-variant/30">
            <div className="w-10 h-10 rounded-xl bg-primario-zen/5 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Calendar className="w-5 h-5 text-primario-zen" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <span className="text-[9px] uppercase tracking-widest font-bold text-primario-zen/40 block mb-1">
                Fecha y Hora de Cita
              </span>
              <p className="font-serif text-base text-primario-zen capitalize leading-snug">
                {formattedDate}
              </p>
              <p className="text-xs text-primario-zen/50 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Horario: {data.timeSlot.label}
              </p>
            </div>
          </div>

          {/* Fila: Cliente */}
          <div className="flex items-start gap-4 py-4">
            <div className="w-10 h-10 rounded-xl bg-primario-zen/5 flex items-center justify-center flex-shrink-0 mt-0.5">
              <User className="w-5 h-5 text-primario-zen" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <span className="text-[9px] uppercase tracking-widest font-bold text-primario-zen/40 block mb-1">
                A nombre de
              </span>
              <p className="font-serif text-base text-primario-zen leading-snug">
                {data.name}
              </p>
              <p className="text-xs text-primario-zen/50 mt-0.5">
                Contacto: {data.contact}
              </p>
            </div>
          </div>
        </div>

        {/* Nota informativa de Anticipo */}
        <div className="mt-6 p-4 bg-accent-gold-primary/[0.06] border border-accent-gold-primary/20 rounded-2xl flex gap-3 items-start">
          <CreditCard className="w-4 h-4 text-accent-gold-dark mt-0.5 flex-shrink-0" />
          <div className="text-left">
            <p className="text-[10px] font-bold text-accent-gold-dark uppercase tracking-wider">
              Políticas de confirmación
            </p>
            <p className="text-[11px] text-primario-zen/60 leading-relaxed mt-1">
              Para garantizar tu lugar, se requiere un **anticipo del 50%** de la base (${(ticketDetails?.totalPrice / 2) || 0} MXN). 
            </p>
            <div className="text-[10px] text-primario-zen/50 leading-relaxed mt-2.5 pt-2.5 border-t border-accent-gold-primary/10">
              <p className="font-semibold text-accent-gold-dark mb-1">Datos para Transferencia:</p>
              <p>• <strong>Banco:</strong> BBVA</p>
              <p>• <strong>A nombre de:</strong> Alexandra Garcia</p>
              <p>• <strong>Tarjeta:</strong> 4152 3144 5237 9798</p>
              <p className="mt-1">Enviar comprobante al WhatsApp: <strong>686 399 9319</strong></p>
            </div>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 1, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 bg-red-500/[0.06] border border-red-500/25 rounded-2xl flex gap-2.5 items-start text-red-700 text-left text-xs"
          >
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold uppercase tracking-wider text-[10px] text-red-800">
                Ocurrió un inconveniente
              </p>
              <p className="mt-0.5 text-red-700/80 leading-relaxed">
                {error}
              </p>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col gap-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full bg-primario-zen text-fondo-zen py-4 rounded-full uppercase tracking-widest text-xs font-bold shadow-md hover:bg-primario-zen/90 hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-fondo-zen border-t-transparent animate-spin" />
                <span>Sincronizando espacio...</span>
              </>
            ) : (
              <span>Confirmar Reserva</span>
            )}
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
