// ============================================================
// src/lib/calendarGrid.ts
// Helpers puros de geometría del calendario. Sin React, sin Supabase.
// Compartidos por DayView / WeekView / MonthView / TimeIndicatorLine.
// ============================================================

/** Hora de inicio del grid (inclusive). */
export const GRID_START_HOUR = 6;
/** Hora de fin del grid (exclusive, pero se renderiza la última fila). */
export const GRID_END_HOUR = 22;
/** Total de horas renderizadas (16 filas: 6 → 22). */
export const GRID_HOURS = GRID_END_HOUR - GRID_START_HOUR;

export interface HourSlot {
  hour: number; // 0-23
  label: string; // '6:00 AM', '1:00 PM', etc. en locale del navegador
}

/** Construye las horas del grid con etiquetas localizadas. */
export function buildHourSlots(locale = 'es'): HourSlot[] {
  const formatter = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' });
  return Array.from({ length: GRID_HOURS }, (_, i) => {
    const hour = GRID_START_HOUR + i;
    // Usamos un Date arbitrario solo para formatear la hora en el locale del usuario.
    const sample = new Date(2024, 0, 1, hour, 0, 0);
    return { hour, label: formatter.format(sample) };
  });
}

/** Offset vertical en píxeles para una hora + minutos dados. */
export function timeToYOffset(
  date: Date,
  hourHeight: number,
  startHour: number = GRID_START_HOUR
): number {
  const hours = date.getHours() + date.getMinutes() / 60;
  return Math.max(0, (hours - startHour) * hourHeight);
}

/** Altura en píxeles de un rango de tiempo, dado el alto por hora. */
export function rangeHeight(
  start: Date,
  end: Date,
  hourHeight: number,
  startHour: number = GRID_START_HOUR
): number {
  const startOffset = timeToYOffset(start, hourHeight, startHour);
  const endOffset = timeToYOffset(end, hourHeight, startHour);
  return Math.max(24, endOffset - startOffset); // mínimo 24px para legibilidad
}

/** ¿Una fecha cae en el día local dado? (mismo día, mes y año) */
export function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Devuelve el inicio del día local (00:00:00.000). */
export function startOfLocalDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Devuelve el inicio de la semana (lunes) en día local. */
export function startOfLocalWeek(d: Date): Date {
  const copy = startOfLocalDay(d);
  const day = copy.getDay(); // 0 = domingo
  const diff = (day + 6) % 7; // lunes = 0
  copy.setDate(copy.getDate() - diff);
  return copy;
}

/** Devuelve el inicio del mes (día 1, 00:00 local). */
export function startOfLocalMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
