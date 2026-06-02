'use client';

import { motion } from 'framer-motion';
import { timeToYOffset, GRID_START_HOUR } from '@/lib/calendarGrid';

interface TimeIndicatorLineProps {
  /** Fecha actual (proporcionada por useCalendarView, se refresca cada 60s). */
  now: Date;
  /** Altura en px por hora (proviene del zoom). */
  hourHeight: number;
  /** Si está visible: false si la hora actual cae fuera del rango del grid. */
  visible: boolean;
}

/**
 * Línea horizontal minimalista que marca la hora actual dentro del grid.
 * Solo aparece si la hora actual está dentro del rango visible (6:00–22:00).
 * Posicionada con `top` calculado en píxeles, no en porcentajes, para
 * alinearse exactamente con las filas de hora.
 */
export function TimeIndicatorLine({ now, hourHeight, visible }: TimeIndicatorLineProps) {
  if (!visible) return null;

  const hour = now.getHours() + now.getMinutes() / 60;
  if (hour < GRID_START_HOUR || hour > GRID_START_HOUR + 16) return null;

  const top = timeToYOffset(now, hourHeight);

  return (
    <motion.div
      aria-hidden="true"
      initial={false}
      animate={{ top }}
      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      className="pointer-events-none absolute left-0 right-0 z-20"
      style={{ top }}
    >
      {/* Punto a la izquierda */}
      <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-primario-zen" />
      {/* Línea horizontal */}
      <div className="h-px w-full bg-primario-zen/60" />
    </motion.div>
  );
}
