'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { rangeHeight, timeToYOffset } from '@/lib/calendarGrid';
import type { AppointmentWithRelations, AppointmentStatus } from '@/types/supabase';

// Paleta Zen cerrada para los 3 estados (reutilizada por Day/Week).
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
    bg: 'bg-secundario-zen',
    border: 'border-primario-zen/40',
    text: 'text-primario-zen',
    pill: 'bg-primario-zen/15 text-primario-zen',
    label: 'Pendiente',
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
  /** Columna 0-index dentro de la grilla (para WeekView). En DayView es siempre 0. */
  columnIndex: number;
  /** Total de columnas (1 en DayView, 7 en WeekView). */
  columnCount: number;
  onClick?: () => void;
}

/**
 * Bloque de cita posicionado absolutamente dentro de una columna del grid.
 * Se posiciona por `top` y `height` calculados a partir de `start_time`/`end_time`.
 * El ancho se reparte entre las columnas (soporte a citas paralelas en WeekView).
 */
export function AppointmentBlock({
  appointment,
  hourHeight,
  columnIndex,
  columnCount,
  onClick,
}: AppointmentBlockProps) {
  const start = new Date(appointment.start_time);
  const end = new Date(appointment.end_time);
  const top = timeToYOffset(start, hourHeight);
  const height = rangeHeight(start, end, hourHeight);

  const style = STATUS_STYLES[appointment.status];
  const serviceName =
    appointment.service?.name ??
    (appointment.ticket_details?.activeServices?.length
      ? appointment.ticket_details.activeServices.join(' + ')
      : 'Servicio');

  // Reparto horizontal: si hay varias citas en paralelo en la misma columna,
  // cada una ocupa un ancho proporcional.
  const widthPct = 100 / columnCount;
  const leftPct = columnIndex * widthPct;
  const inset = 2; // px de aire entre bloques paralelos

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      style={{
        top,
        height,
        left: `calc(${leftPct}% + ${inset}px)`,
        width: `calc(${widthPct}% - ${inset * 2}px)`,
      }}
      className={`absolute rounded-xl border ${style.bg} ${style.border} ${style.text} px-2 py-1.5 text-left overflow-hidden shadow-sm hover:brightness-105 transition-all z-10`}
    >
      <div className="flex flex-col gap-0.5 h-full">
        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-90 leading-tight">
          {format(start, 'h:mm a')} · {style.label}
        </span>
        <span className="text-xs font-serif font-medium leading-tight truncate">
          {serviceName}
        </span>
        <span className="text-[10px] opacity-80 leading-tight truncate">
          {appointment.customer.name}
        </span>
        {appointment.employee && (
          <span className={`mt-auto text-[9px] ${style.pill} rounded-full px-1.5 py-0.5 self-start uppercase tracking-wider`}>
            {appointment.employee.name}
          </span>
        )}
      </div>
    </motion.button>
  );
}
