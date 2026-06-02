'use client';

// ============================================================
// src/components/calendar/CalendarView.tsx
// Vista principal del calendario con conmutador Día/Semana/Mes.
// Conectada a Supabase via useAppointments + useTimeBlocks.
// ============================================================

import { useMemo, useState } from 'react';
import { addDays, addMonths, addWeeks, format, isSameDay, startOfWeek, subDays, subMonths, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Loader2 } from 'lucide-react';
import { AppointmentDetailModal } from './AppointmentDetailModal';
import { NewAppointmentModal } from './NewAppointmentModal';
import { ViewSwitcher } from './ViewSwitcher';
import { ZoomControls } from './ZoomControls';
import { DayView } from './views/DayView';
import { WeekView } from './views/WeekView';
import { MonthView } from './views/MonthView';
import { useAppointments } from '@/hooks/useAppointments';
import { useTimeBlocks } from '@/hooks/useTimeBlocks';
import { useCalendarView } from '@/hooks/useCalendarView';
import { useProject } from '@/context/AppContext';
import { GRID_END_HOUR, GRID_HOURS, GRID_START_HOUR, startOfLocalDay } from '@/lib/calendarGrid';
import type { AppointmentWithRelations, AppointmentStatus } from '@/types/supabase';

const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID ?? '';

export function CalendarView() {
  const { activeProject } = useProject();
  const projectId = activeProject?.id ?? null;

  const [anchorDate, setAnchorDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<Date>(new Date());

  const { view, setView, zoom, setZoom, hourHeight, currentTime } = useCalendarView();

  // Rango visible ampliado para intersectar citas que cruzan límites.
  const dateRange = useMemo(() => {
    const pad = (d: Date) => new Date(d.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const padEnd = (d: Date) => new Date(d.getTime() + 24 * 60 * 60 * 1000).toISOString();
    if (view === 'day') {
      return { from: pad(startOfLocalDay(anchorDate)), to: padEnd(startOfLocalDay(anchorDate)) };
    }
    if (view === 'week') {
      const ws = startOfWeek(anchorDate, { weekStartsOn: 1 });
      const we = addDays(ws, 6);
      return { from: pad(ws), to: padEnd(we) };
    }
    // month: rango del mes completo + padding
    const ms = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
    const me = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
    return { from: pad(ms), to: padEnd(me) };
  }, [anchorDate, view]);

  const { appointments, isLoading, error, createAppointment, updateAppointment, refetch } =
    useAppointments({ projectId, dateRange });
  const { timeBlocks } = useTimeBlocks({ projectId, dateRange });

  // Navegación
  const handlePrev = () => {
    if (view === 'day') setAnchorDate((d) => subDays(d, 1));
    else if (view === 'week') setAnchorDate((d) => subWeeks(d, 1));
    else setAnchorDate((d) => subMonths(d, 1));
  };
  const handleNext = () => {
    if (view === 'day') setAnchorDate((d) => addDays(d, 1));
    else if (view === 'week') setAnchorDate((d) => addWeeks(d, 1));
    else setAnchorDate((d) => addMonths(d, 1));
  };
  const handleToday = () => {
    const now = new Date();
    setAnchorDate(now);
    setSelectedDate(now);
  };

  const monthLabel = format(anchorDate, 'MMMM yyyy', { locale: es });

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    await updateAppointment(id, { status });
    setSelectedAppointment(null);
    refetch();
  };

  const handleSlotClick = (date: Date, hour: number, minute: number) => {
    const d = new Date(date);
    d.setHours(hour, minute, 0, 0);
    setPrefilledDate(d);
    setIsNewModalOpen(true);
  };

  return (
    <>
      <div className="w-full flex flex-col gap-5">
        {/* Header: navegación + view switcher + zoom + nuevo */}
        <div className="bg-fondo-zen rounded-3xl p-4 sm:p-6 shadow-sm border border-secundario-zen/50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 text-primario-zen">
              <button
                onClick={handlePrev}
                aria-label="Anterior"
                className="p-2 hover:bg-secundario-zen/50 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1.5 font-serif text-sm capitalize tracking-wide text-primario-zen/80 hover:text-primario-zen hover:bg-secundario-zen/50 rounded-full transition-colors"
              >
                {monthLabel}
              </button>
              <button
                onClick={handleNext}
                aria-label="Siguiente"
                className="p-2 hover:bg-secundario-zen/50 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={refetch}
                aria-label="Actualizar"
                className="p-1.5 hover:bg-secundario-zen/50 rounded-full transition-colors text-primario-zen/50 hover:text-primario-zen"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <ViewSwitcher value={view} onChange={setView} />
              {view !== 'month' && <ZoomControls value={zoom} onChange={setZoom} />}
              <button
                onClick={() => {
                  setPrefilledDate(selectedDate);
                  setIsNewModalOpen(true);
                }}
                aria-label="Nueva cita"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Error / estados vacíos globales */}
        {error && !activeProject && (
          <div className="text-center py-8 bg-amber-50 rounded-2xl border border-amber-200">
            <p className="text-amber-700 text-xs font-semibold uppercase tracking-widest mb-1">
              Sin proyecto configurado
            </p>
            <p className="text-amber-600/70 text-sm">
              Por favor selecciona un proyecto activo en la configuración.
            </p>
          </div>
        )}
        {error && activeProject && (
          <div className="text-center py-8 bg-red-50 rounded-2xl border border-red-200">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Vista activa */}
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'day' && (
              <DayView
                date={anchorDate}
                appointments={appointments}
                hourHeight={hourHeight}
                currentTime={currentTime}
                onAppointmentClick={setSelectedAppointment}
                onSlotClick={handleSlotClick}
              />
            )}
            {view === 'week' && (
              <WeekView
                date={anchorDate}
                appointments={appointments}
                hourHeight={hourHeight}
                currentTime={currentTime}
                onAppointmentClick={setSelectedAppointment}
                onSlotClick={handleSlotClick}
              />
            )}
            {view === 'month' && (
              <MonthView
                date={anchorDate}
                appointments={appointments}
                onDayClick={(d) => {
                  setSelectedDate(d);
                  setAnchorDate(d);
                  setView('day');
                }}
                selectedDate={selectedDate}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Indicador de carga discreto */}
        {isLoading && (
          <div className="fixed bottom-4 right-4 bg-fondo-zen border border-secundario-zen/60 rounded-full px-3 py-1.5 shadow-sm flex items-center gap-2 z-30">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primario-zen/60" />
            <span className="text-[10px] uppercase tracking-widest text-primario-zen/60 font-semibold">
              Sincronizando
            </span>
          </div>
        )}
      </div>

      {/* Modales */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onStatusChange={handleStatusChange}
      />
      <NewAppointmentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        defaultDate={prefilledDate}
        onSubmit={async (payload) => {
          const res = await createAppointment({ ...payload, project_id: PROJECT_ID || payload.project_id } as any);
          if (res) refetch();
          return res;
        }}
      />
    </>
  );
}

// Re-exportamos GRID_HOURS para quien quiera extender el rango.
export { GRID_START_HOUR, GRID_END_HOUR, GRID_HOURS };
