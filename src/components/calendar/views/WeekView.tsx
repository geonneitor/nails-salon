'use client';

import { format, addDays, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
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
import type { AppointmentWithRelations } from '@/types/supabase';

interface WeekViewProps {
  /** Cualquier fecha dentro de la semana a mostrar. */
  date: Date;
  appointments: AppointmentWithRelations[];
  hourHeight: number;
  currentTime: Date;
  onAppointmentClick: (a: AppointmentWithRelations) => void;
  onSlotClick?: (date: Date, hour: number, minute: number) => void;
}

const WEEK_DAY_LABELS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

/**
 * Vista Semana: 7 columnas (L-D) compartiendo el mismo eje vertical horario.
 * - Cada columna es un sub-grid de horas (6:00–22:00).
 * - Citas paralelas en el mismo día se acomodan lado a lado.
 * - TimeIndicatorLine aparece en la columna de "hoy" si está en la semana visible.
 */
export function WeekView({
  date,
  appointments,
  hourHeight,
  currentTime,
  onAppointmentClick,
  onSlotClick,
}: WeekViewProps) {
  const hourSlots = useMemo(() => buildHourSlots('es'), []);

  const weekStart = useMemo(() => startOfWeek(date, { weekStartsOn: 1 }), [date]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const totalHeight = GRID_HOURS * hourHeight;

  // Pre-agrupar citas por día para no recalcular en cada columna.
  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, ReturnType<typeof layoutAppointments>>();
    for (const day of weekDays) {
      const key = day.toDateString();
      const dayAppts = appointments.filter((a) => isSameLocalDay(new Date(a.start_time), day));
      map.set(key, layoutAppointments(dayAppts));
    }
    return map;
  }, [appointments, weekDays]);

  const todayColumnIndex = weekDays.findIndex((d) => isSameDay(d, new Date()));
  const isCurrentWeek = todayColumnIndex !== -1;

  return (
    <div className="flex flex-col gap-3">
      {/* Encabezado: rango de la semana */}
      <div className="flex items-baseline justify-between px-1">
        <h3 className="font-serif text-primario-zen text-xl capitalize">
          {format(weekStart, "d 'de' MMM", { locale: es })} —{' '}
          {format(addDays(weekStart, 6), "d 'de' MMM yyyy", { locale: es })}
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-primario-zen/40 font-semibold">
          {appointments.length === 0
            ? 'Sin citas'
            : `${appointments.length} ${appointments.length === 1 ? 'cita' : 'citas'}`}
        </span>
      </div>

      {/* Grid de la semana: columna de horas + 7 columnas de días */}
      <div className="relative flex bg-fondo-zen rounded-2xl border border-secundario-zen/50 shadow-sm overflow-hidden">
        {/* Etiquetas de hora */}
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

        {/* 7 columnas de días */}
        <div className="flex-1 grid grid-cols-7 relative" style={{ height: totalHeight }}>
          {weekDays.map((day, dayIdx) => {
            const layout = appointmentsByDay.get(day.toDateString()) ?? [];
            const isToday = dayIdx === todayColumnIndex;
            return (
              <div
                key={day.toISOString()}
                className={`relative border-r last:border-r-0 ${
                  isToday ? 'bg-secundario-zen/15' : ''
                } border-secundario-zen/30`}
              >
                {/* Encabezado de día */}
                <div className="sticky top-0 z-10 bg-fondo-zen/95 backdrop-blur-sm border-b border-secundario-zen/40 px-1 py-1.5 text-center">
                  <div className="text-[9px] uppercase tracking-widest text-primario-zen/40 font-semibold">
                    {WEEK_DAY_LABELS[dayIdx]}
                  </div>
                  <div
                    className={`text-xs font-semibold ${
                      isToday ? 'text-primario-zen' : 'text-primario-zen/70'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                </div>

                {/* Filas horizontales (slots clickeables) */}
                {hourSlots.map((slot) => (
                  <button
                    key={slot.hour}
                    type="button"
                    onClick={() => onSlotClick?.(startOfLocalDay(day), slot.hour, 0)}
                    aria-label={`Agendar cita el ${format(day, 'd MMM')} a las ${slot.label}`}
                    className="absolute left-0 right-0 border-b border-secundario-zen/25 hover:bg-secundario-zen/20 transition-colors"
                    style={{
                      top: (slot.hour - GRID_START_HOUR) * hourHeight,
                      height: hourHeight,
                    }}
                  />
                ))}

                {/* Citas */}
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

                {/* Línea de hora actual (solo columna de hoy) */}
                {isToday && isCurrentWeek && (
                  <TimeIndicatorLine now={currentTime} hourHeight={hourHeight} visible />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
