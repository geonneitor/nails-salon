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
      className="pointer-events-none absolute left-0 right-0 z-30"
      style={{ top }}
    >
      {/* Punto a la izquierda: Más grande y con sombra para resaltar */}
      <div className="absolute -left-1 -top-1 w-3 h-3 rounded-full bg-primario-zen shadow-[0_0_8px_rgba(var(--color-primario-zen),0.8)]" />
      {/* Línea horizontal: Más gruesa y con color más intenso */}
      <div className="h-0.5 w-full bg-primario-zen opacity-80 shadow-sm" />
    </motion.div>
  );
}
