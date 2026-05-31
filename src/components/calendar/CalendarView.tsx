'use client';

// ============================================================
// src/components/calendar/CalendarView.tsx
// Vista principal del calendario semanal.
// Conectada a Supabase via useAppointments + modal de detalle.
// ============================================================

import { useState, useMemo } from 'react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RefreshCw, Loader2, Plus } from 'lucide-react';
import { AppointmentCard } from './AppointmentCard';
import { AppointmentDetailModal } from './AppointmentDetailModal';
import { NewAppointmentModal } from './NewAppointmentModal';
import { useAppointments } from '@/hooks/useAppointments';
import type { AppointmentWithRelations, AppointmentStatus } from '@/types/supabase';

/**
 * ID del proyecto activo. En una versión final esto vendrá del
 * contexto de sesión (AppContext / auth), pero por ahora se
 * lee de la variable de entorno para evitar hardcoding.
 */
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID ?? null;

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Semana actual: lunes → domingo
  const weekStart = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 1 }),
    [currentDate]
  );
  const weekEnd = useMemo(
    () => endOfWeek(currentDate, { weekStartsOn: 1 }),
    [currentDate]
  );
  const weekDays = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Hook real de Supabase
  const { appointments, isLoading, error, updateAppointment, createAppointment, refetch } = useAppointments({
    projectId: PROJECT_ID,
    dateRange: {
      from: weekStart.toISOString(),
      to: weekEnd.toISOString(),
    },
  });

  const handlePrevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));

  // Citas del día seleccionado
  const dailyAppointments = appointments.filter((a) =>
    isSameDay(new Date(a.start_time), selectedDate)
  );

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    await updateAppointment(id, { status });
    setSelectedAppointment(null);
    refetch();
  };

  return (
    <>
      <div className="w-full flex flex-col gap-6">

        {/* Contenedor del Calendario Semanal */}
        <div className="bg-[#FDFBEE] rounded-3xl p-6 shadow-sm border border-secundario-zen/50">

          {/* Controles del Mes */}
          <div className="flex justify-between items-center mb-6 text-primario-zen">
            <button
              id="prev-week-btn"
              onClick={handlePrevWeek}
              aria-label="Semana anterior"
              className="p-2 hover:bg-secundario-zen/50 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <span className="font-serif text-lg tracking-wide capitalize">
                {format(currentDate, 'MMMM yyyy', { locale: es })}
              </span>
              <button
                id="refetch-calendar-btn"
                onClick={refetch}
                aria-label="Actualizar calendario"
                className="p-1.5 hover:bg-secundario-zen/50 rounded-full transition-colors text-primario-zen/50 hover:text-primario-zen"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              id="next-week-btn"
              onClick={handleNextWeek}
              aria-label="Semana siguiente"
              className="p-2 hover:bg-secundario-zen/50 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Nombres de los Días */}
          <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] font-bold text-primario-zen/50 uppercase tracking-widest">
            {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Cuadrícula de Números */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {weekDays.map((date) => {
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());
              const hasCitas = appointments.some((a) =>
                isSameDay(new Date(a.start_time), date)
              );

              return (
                <button
                  key={date.toISOString()}
                  id={`day-btn-${format(date, 'yyyy-MM-dd')}`}
                  onClick={() => setSelectedDate(date)}
                  className="relative flex flex-col items-center justify-center h-10 w-full rounded-full text-sm transition-colors z-10"
                >
                  <span
                    className={`z-10 ${
                      isSelected
                        ? 'text-fondo-zen font-semibold'
                        : isToday
                        ? 'text-primario-zen font-bold'
                        : 'text-primario-zen hover:text-primario-zen/70'
                    }`}
                  >
                    {format(date, 'd')}
                  </span>

                  {/* Punto indicador de citas */}
                  {hasCitas && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primario-zen/60" />
                  )}

                  {isSelected && (
                    <motion.div
                      layoutId="selectedDay"
                      className="absolute inset-0 bg-primario-zen rounded-full -z-0"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de Citas del Día */}
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-primario-zen font-serif text-xl tracking-wide">
              {isSameDay(selectedDate, new Date())
                ? 'Citas de hoy'
                : `Citas del ${format(selectedDate, "d 'de' MMMM", { locale: es })}`}
            </h3>
            <div className="flex items-center gap-3">
              {isLoading && (
                <Loader2 className="w-4 h-4 animate-spin text-primario-zen/50" />
              )}
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 transition-all shadow-sm"
                aria-label="Nueva cita"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Error state */}
          {error && !PROJECT_ID && (
            <div className="text-center py-8 bg-amber-50 rounded-2xl border border-amber-200">
              <p className="text-amber-700 text-xs font-semibold uppercase tracking-widest mb-1">
                Sin proyecto configurado
              </p>
              <p className="text-amber-600/70 text-sm">
                Agrega <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_PROJECT_ID</code> a tu <code>.env.local</code>
              </p>
            </div>
          )}

          {error && PROJECT_ID && (
            <div className="text-center py-8 bg-red-50 rounded-2xl border border-red-200">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {!isLoading && dailyAppointments.length > 0 ? (
                dailyAppointments.map((appt) => (
                  <motion.div
                    key={appt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AppointmentCard
                      appointment={appt}
                      onClick={() => setSelectedAppointment(appt)}
                    />
                  </motion.div>
                ))
              ) : !isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-10 bg-secundario-zen/20 rounded-2xl border border-dashed border-secundario-zen/60"
                >
                  <p className="text-primario-zen/60 text-sm italic">
                    Sin citas para este día.
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modal de Detalle */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onStatusChange={handleStatusChange}
      />

      {/* Modal Nueva Cita */}
      <NewAppointmentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        defaultDate={selectedDate}
        onSubmit={async (payload) => {
          const res = await createAppointment(payload as any);
          if (res) refetch();
          return res;
        }}
      />
    </>
  );
}
