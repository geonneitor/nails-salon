'use client';

import { format, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMemo } from 'react';
import { AppointmentBlock } from '../AppointmentBlock';
import { TimeIndicatorLine } from '../TimeIndicatorLine';
import {
  buildHourSlots,
  GRID_HOURS,
  GRID_START_HOUR,
  isSameLocalDay,
  startOfLocalDay,
} from '@/lib/calendarGrid';
import { layoutAppointments } from '@/lib/appointmentLayout';
import type { AppointmentWithRelations, TimeBlockWithEmployee } from '@/types/supabase';

interface DayViewProps {
  date: Date;
  appointments: AppointmentWithRelations[];
  timeBlocks?: TimeBlockWithEmployee[];
  hourHeight: number;
  currentTime: Date;
  onAppointmentClick: (a: AppointmentWithRelations) => void;
  /** Click en un slot vacío → nueva cita con hora pre-llenada. */
  onSlotClick?: (date: Date, hour: number, minute: number) => void;
}

/**
 * Vista Día: columna única con grid horario (6:00–22:00).
 * - Citas posicionadas absolutamente por start_time/end_time.
 * - TimeIndicatorLine moviéndose con la hora actual.
 * - Click en slot vacío abre NewAppointmentModal con hora pre-llenada.
 */
export function DayView({
  date,
  appointments,
  hourHeight,
  currentTime,
  onAppointmentClick,
  onSlotClick,
}: DayViewProps) {
  const hourSlots = useMemo(() => buildHourSlots('es'), []);

  const dayAppointments = useMemo(
    () => appointments.filter((a) => isSameLocalDay(new Date(a.start_time), date)),
    [appointments, date]
  );

  const layout = useMemo(() => layoutAppointments(dayAppointments), [dayAppointments]);

  const isToday = isSameDay(date, new Date());
  const showTimeLine = isToday;

  const totalHeight = GRID_HOURS * hourHeight;

  return (
    <div className="flex flex-col gap-3">
      {/* Encabezado del día */}
      <div className="flex items-baseline justify-between px-1">
        <h3 className="font-serif text-primario-zen text-xl capitalize">
          {format(date, "EEEE d 'de' MMMM", { locale: es })}
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-primario-zen/40 font-semibold">
          {dayAppointments.length === 0
            ? 'Sin citas'
            : `${dayAppointments.length} ${dayAppointments.length === 1 ? 'cita' : 'citas'}`}
        </span>
      </div>

      {/* Grid: etiquetas de hora + columna del día */}
      <div className="relative flex bg-fondo-zen rounded-2xl border border-secundario-zen/50 shadow-sm overflow-hidden">
        {/* Columna de horas (sticky labels) */}
        <div
          className="flex-shrink-0 w-14 border-r border-secundario-zen/50"
          style={{ height: totalHeight }}
        >
          {hourSlots.map((slot) => (
            <div
              key={slot.hour}
              style={{ height: hourHeight }}
              className="flex items-start justify-end pr-2 pt-1 text-[10px] uppercase tracking-wider text-primario-zen/40 font-semibold"
            >
              {slot.label}
            </div>
          ))}
        </div>

        {/* Columna principal con slots clickeables */}
        <div
          className="relative flex-1"
          style={{ height: totalHeight }}
        >
          {/* Filas horizontales + slots clickeables */}
          {hourSlots.map((slot) => (
            <button
              key={slot.hour}
              type="button"
              onClick={() => onSlotClick?.(startOfLocalDay(date), slot.hour, 0)}
              aria-label={`Agendar cita a las ${slot.label}`}
              className="absolute left-0 right-0 border-b border-secundario-zen/30 hover:bg-secundario-zen/20 transition-colors"
              style={{ top: (slot.hour - GRID_START_HOUR) * hourHeight, height: hourHeight }}
            />
          ))}

          {/* Citas posicionadas */}
          {layout.map(({ appointment, columnIndex, columnCount }) => (
            <AppointmentBlock
              key={appointment.id}
              appointment={appointment}
              hourHeight={hourHeight}
              columnIndex={columnIndex}
              columnCount={columnCount}
              onClick={() => onAppointmentClick(appointment)}
            />
          ))}

          {/* Línea de hora actual */}
          <TimeIndicatorLine now={currentTime} hourHeight={hourHeight} visible={showTimeLine} />
        </div>
      </div>
    </div>
  );
}
