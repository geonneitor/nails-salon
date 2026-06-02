'use client';

import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMemo } from 'react';
import { isSameLocalDay } from '@/lib/calendarGrid';
import type { AppointmentWithRelations } from '@/types/supabase';

interface MonthViewProps {
  date: Date;
  appointments: AppointmentWithRelations[];
  onDayClick: (day: Date) => void;
  selectedDate: Date;
}

const WEEK_DAY_LABELS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

/**
 * Vista Mes: grid 7×6 con celdas por día.
 * - Cada celda muestra el número del día + hasta 3 dots minimalistas por cita.
 * - Si hay más de 3 citas, se muestra un "+" sutil.
 * - NUNCA se muestra un número contador (regla explícita del cliente).
 * - Días fuera del mes se atenúan.
 */
export function MonthView({ date, appointments, onDayClick, selectedDate }: MonthViewProps) {
  const monthStart = useMemo(() => startOfMonth(date), [date]);
  const monthEnd = useMemo(() => endOfMonth(date), [date]);
  const gridStart = useMemo(() => startOfWeek(monthStart, { weekStartsOn: 1 }), [monthStart]);
  const gridEnd = useMemo(() => endOfWeek(monthEnd, { weekStartsOn: 1 }), [monthEnd]);

  // Construir las 6 filas × 7 columnas (42 celdas máximo).
  const days = useMemo(() => {
    const out: Date[] = [];
    let cursor = gridStart;
    while (cursor <= gridEnd) {
      out.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return out;
  }, [gridStart, gridEnd]);

  // Pre-agrupar citas por día local (string key).
  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of appointments) {
      const key = isSameLocalDay(new Date(a.start_time), new Date(0))
        ? ''
        : new Date(a.start_time).toDateString();
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [appointments]);

  return (
    <div className="flex flex-col gap-3">
      {/* Encabezado del mes */}
      <div className="flex items-baseline justify-between px-1">
        <h3 className="font-serif text-primario-zen text-xl capitalize">
          {format(date, 'MMMM yyyy', { locale: es })}
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-primario-zen/40 font-semibold">
          {appointments.length === 0
            ? 'Sin citas'
            : `${appointments.length} en el mes`}
        </span>
      </div>

      {/* Labels de días de la semana */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-primario-zen/40 uppercase tracking-widest">
        {WEEK_DAY_LABELS.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>

      {/* Grid de celdas */}
      <div className="grid grid-cols-7 gap-1 bg-fondo-zen rounded-2xl border border-secundario-zen/50 shadow-sm p-2">
        {days.map((day) => {
          const inMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);
          const count = appointmentsByDay.get(day.toDateString()) ?? 0;
          const showDots = count > 0;
          const dotsToShow = Math.min(count, 3);
          const hasOverflow = count > 3;

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onDayClick(day)}
              aria-label={`${format(day, 'd MMMM')}${count > 0 ? `, ${count} citas` : ''}`}
              className={`relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all ${
                isSelected
                  ? 'bg-primario-zen text-fondo-zen'
                  : isToday
                    ? 'bg-secundario-zen/40 text-primario-zen'
                    : inMonth
                      ? 'text-primario-zen/80 hover:bg-secundario-zen/20'
                      : 'text-primario-zen/25'
              }`}
            >
              <span
                className={`text-xs font-semibold ${
                  isToday && !isSelected ? 'font-bold' : ''
                }`}
              >
                {format(day, 'd')}
              </span>

              {/* Dots minimalistas: hasta 3, en una sola línea */}
              {showDots && (
                <div className="absolute bottom-1.5 flex items-center gap-0.5">
                  {Array.from({ length: dotsToShow }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-1 h-1 rounded-full ${
                        isSelected
                          ? 'bg-fondo-zen'
                          : isToday
                            ? 'bg-primario-zen'
                            : 'bg-primario-zen/50'
                      }`}
                    />
                  ))}
                  {hasOverflow && (
                    <span
                      className={`text-[8px] font-semibold ${
                        isSelected ? 'text-fondo-zen' : 'text-primario-zen/50'
                      }`}
                    >
                      +
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
