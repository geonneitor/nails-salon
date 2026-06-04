'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { rangeHeight, timeToYOffset } from '@/lib/calendarGrid';
import type { AppointmentWithRelations, AppointmentStatus } from '@/types/supabase';

// Paleta Zen extendida para los 4 estados
const STATUS_STYLES: Record<
  AppointmentStatus,
  { bg: string; border: string; text: string; pill: string; label: string }
> = {
  confirmed_advance: {
    bg: 'bg-primario-zen',
    border: 'border-primario-zen',
    text: 'text-fondo-zen',
    pill: 'bg-fondo-zen/20 text-fondo-zen',
    label: 'Confirmado',
  },
  pending_advance: {
    bg: 'bg-emerald-50/60',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    pill: 'bg-emerald-100 text-emerald-800',
    label: 'No Confirmado',
  },
  completed: {
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    text: 'text-slate-500',
    pill: 'bg-slate-200 text-slate-600',
    label: 'Finalizado',
  },
  free: {
    bg: 'bg-transparent',
    border: 'border-dashed border-primario-zen/60',
    text: 'text-primario-zen',
    pill: 'bg-primario-zen/10 text-primario-zen',
    label: 'Gratis',
  },
};

interface AppointmentBlockProps {
  appointment: AppointmentWithRelations;
  hourHeight: number;
  columnIndex: number;
  columnCount: number;
  currentTime?: Date; // Añadido para detectar estado "En Proceso"
  onClick?: () => void;
}

export function AppointmentBlock({
  appointment,
  hourHeight,
  columnIndex,
  columnCount,
  currentTime,
  onClick,
}: AppointmentBlockProps) {
  const start = new Date(appointment.start_time);
  const end = new Date(appointment.end_time);
  const top = timeToYOffset(start, hourHeight);
  const height = rangeHeight(start, end, hourHeight);

  // Lógica de "En Proceso": la hora actual está entre el inicio y el fin de la cita
  const isInProgress = currentTime
    ? (currentTime >= start && currentTime <= end)
    : false;

  const style = STATUS_STYLES[appointment.status];

  // Si está en proceso, sobreescribimos los estilos para que "brille"
  const currentStyle = isInProgress
    ? {
        bg: 'bg-yellow-400',
        border: 'border-yellow-600',
        text: 'text-yellow-950',
        pill: 'bg-yellow-600 text-white',
        label: 'EN PROCESO ✨',
      }
    : style;

  const serviceName =
    appointment.service?.name ??
    (appointment.ticket_details?.activeServices?.length
      ? appointment.ticket_details.activeServices.join(' + ')
      : 'Servicio');

  const widthPct = 100 / columnCount;
  const leftPct = columnIndex * widthPct;
  const inset = 2;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{
        opacity: 1,
        scale: isInProgress ? [1, 1.02, 1] : 1
      }}
      transition={{
        duration: 0.15,
        scale: {
          repeat: isInProgress ? Infinity : 0,
          repeatType: 'reverse',
          duration: 1.5,
          ease: 'easeInOut'
        }
      }}
      style={{
        top,
        height,
        left: `calc(${leftPct}% + ${inset}px)`,
        width: `calc(${widthPct}% - ${inset * 2}px)`,
      }}
      className={`absolute rounded-xl border ${currentStyle.bg} ${currentStyle.border} ${currentStyle.text} px-2 py-1.5 text-left overflow-hidden shadow-sm hover:brightness-105 transition-all z-10 ${
        isInProgress ? 'shadow-[0_0_15px_rgba(250,204,21,0.6)] ring-2 ring-yellow-300' : ''
      }`}
    >
      <div className="flex flex-col gap-0.5 h-full">
        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-90 leading-tight">
          {format(start, 'h:mm a')} · {currentStyle.label}
        </span>
        <span className="text-xs font-serif font-medium leading-tight truncate">
          {serviceName}
        </span>
        <span className="text-[10px] opacity-80 leading-tight truncate">
          {appointment.customer.name}
        </span>
        {appointment.employee && (
          <span className={`mt-auto text-[9px] ${currentStyle.pill} rounded-full px-1.5 py-0.5 self-start uppercase tracking-wider`}>
            {appointment.employee.name}
          </span>
        )}
      </div>
    </motion.button>
  );
}
