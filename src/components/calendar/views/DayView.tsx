'use client';

import { format, isSameDay } from 'date-fns';
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
import type { AppointmentWithRelations, Employee } from '@/types/supabase';
import { EmptyDay } from '../EmptyDay';

interface DayViewProps {
  date: Date;
  appointments: AppointmentWithRelations[];
  employees: Employee[];
  hourHeight: number;
  currentTime: Date;
  onAppointmentClick: (a: AppointmentWithRelations) => void;
  onSlotClick?: (date: Date, hour: number, minute: number, employeeId: string) => void;
  onReschedule?: (id: string, newStart: Date, newEnd: Date, newEmployeeId: string) => void;
  selectedAppointmentId?: string | null;
}

function getCollisions(appointments: AppointmentWithRelations[]) {
  const sorted = [...appointments].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  const columns: AppointmentWithRelations[][] = [];

  sorted.forEach((appt) => {
    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      const lastAppt = col[col.length - 1];
      if (new Date(lastAppt.end_time) <= new Date(appt.start_time)) {
        col.push(appt);
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([appt]);
    }
  });

  return columns;
}

export function DayView({
  date,
  appointments,
  employees,
  hourHeight,
  currentTime,
  onAppointmentClick,
  onSlotClick,
  onReschedule,
  selectedAppointmentId,
}: DayViewProps) {
  const hourSlots = useMemo(() => buildHourSlots('es'), []);

  const dayAppointments = useMemo(
    () => appointments.filter((a) => a.start_time && isSameLocalDay(new Date(a.start_time), date)),
    [appointments, date]
  );

  const isToday = isSameDay(date, new Date());
  const showTimeLine = isToday;
  const totalHeight = GRID_HOURS * hourHeight;

  const appointmentsByEmployee = useMemo(() => {
    const map: Record<string, AppointmentWithRelations[]> = {};
    employees.forEach(emp => {
      map[emp.id] = dayAppointments.filter(a => a.employee_id === emp.id);
    });
    return map;
  }, [employees, dayAppointments]);

  return (
    <div className="flex flex-col gap-3 overflow-hidden h-full">
      {/* Encabezado del día */}
      <div className="flex items-baseline justify-between px-1 shrink-0">
        <h3 className="font-serif text-primario-zen text-xl capitalize">
          {format(date, "EEEE d 'de' MMMM", { locale: es })}
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-primario-zen/40 font-semibold">
          {dayAppointments.length === 0
            ? 'Sin citas'
            : `${dayAppointments.length} ${dayAppointments.length === 1 ? 'cita' : 'citas'}`}
        </span>
      </div>

      {/* Grid: Etiquetas de hora + Columnas de Empleadas */}
      <div className="relative flex bg-fondo-zen rounded-2xl border border-secundario-zen/50 shadow-sm overflow-x-auto overflow-y-auto flex-1" data-tour="calendar-slots">
        {/* Columna de horas (Sticky) */}
        <div
          className="flex-shrink-0 w-14 border-r border-secundario-zen/50 bg-fondo-zen z-20 sticky left-0"
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

        {/* Contenedor de columnas de empleadas */}
        <div className="relative flex-1 flex">
          {employees.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-primario-zen/30 font-serif italic py-20">
              No hay empleadas configuradas
            </div>
          ) : (
            employees.map((emp) => (
              <div
                key={emp.id}
                data-employee-id={emp.id}
                className="flex-1 min-w-[160px] border-r last:border-r-0 border-secundario-zen/30 relative group day-col-dropzone"
                style={{ height: totalHeight }}
              >
                {/* Nombre de la empleada (Header) */}
                <div className="sticky top-0 z-30 bg-fondo-zen/90 backdrop-blur-sm border-b border-secundario-zen/40 px-2 py-2 text-center shadow-sm">
                  <span className="text-[11px] uppercase tracking-widest font-bold text-primario-zen/70">
                    {emp.name}
                  </span>
                </div>

                {/* Slots clickeables para agendar */}
                {hourSlots.map((slot) => (
                  <button
                    key={slot.hour}
                    type="button"
                    onClick={() => onSlotClick?.(startOfLocalDay(date), slot.hour, 0, emp.id)}
                    aria-label={`Agendar con ${emp.name} a las ${slot.label}`}
                    className="absolute left-0 right-0 border-b border-secundario-zen/20 hover:bg-secundario-zen/20 transition-colors"
                    style={{
                      top: (slot.hour - GRID_START_HOUR) * hourHeight,
                      height: hourHeight,
                      width: '100%'
                    }}
                  />
                ))}

                {/* Citas de esta empleada (con superposiciones) */}
                {(() => {
                  const empAppts = appointmentsByEmployee[emp.id] || [];
                  const columns = getCollisions(empAppts);
                  const columnCount = columns.length;
                  
                  return columns.flatMap((col, colIndex) => 
                    col.map((appt) => (
                      <AppointmentBlock
                        key={appt.id}
                        appointment={appt}
                        hourHeight={hourHeight}
                        currentTime={currentTime}
                        columnIndex={colIndex}
                        columnCount={columnCount}
                        isSelected={selectedAppointmentId === appt.id}
                        onClick={() => onAppointmentClick(appt)}
                        onReschedule={onReschedule}
                      />
                    ))
                  );
                })()}
              </div>
            ))
          )}

          {employees.length > 0 && dayAppointments.length === 0 && <EmptyDay />}

          {/* Línea de hora actual (Cruza todas las columnas) */}
          <TimeIndicatorLine now={currentTime} hourHeight={hourHeight} visible={showTimeLine} />
        </div>
      </div>
    </div>
  );
}
