'use client';

// ============================================================
// src/components/calendar/CalendarView.tsx
// Vista principal del calendario con conmutador Día/Semana/Mes.
// Conectada a Supabase via useAppointments + useTimeBlocks.
// ============================================================

import { useMemo, useState, useEffect } from 'react';
import { addDays, addMonths, addWeeks, format, isSameDay, startOfWeek, subDays, subMonths, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Loader2, Filter, Users, Circle, Clock } from 'lucide-react';
import { AppointmentDetailModal } from './AppointmentDetailModal';
import { NewAppointmentModal } from './NewAppointmentModal';
import { ViewSwitcher } from './ViewSwitcher';
import { ZoomControls } from './ZoomControls';
import { DayView } from './views/DayView';
import { WeekView } from './views/WeekView';
import { MonthView } from './views/MonthView';
import { useAppointments } from '@/hooks/useAppointments';
import { useTimeBlocks } from '@/hooks/useTimeBlocks';
import { useEmployees } from '@/hooks/useEmployees';
import { useCalendarView } from '@/hooks/useCalendarView';
import { useApp } from '@/context/AppContext';
import { useProject } from '@/context/AppContext';
import { GRID_END_HOUR, GRID_HOURS, GRID_START_HOUR, startOfLocalDay } from '@/lib/calendarGrid';
import type { AppointmentWithRelations, AppointmentStatus } from '@/types/supabase';

const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID ?? '';

export function CalendarView() {
  //  ¡Esto es lo correcto! Cada cosa de su respectivo Hook
  const { activeProject } = useProject();
  const { preferences } = useApp(); // <- Aquí es donde realmente vive 'preferences'
  const projectId = activeProject?.id ?? null;

  const [anchorDate, setAnchorDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<Date>(new Date());

  const { view, setView, zoom, setZoom, hourHeight, currentTime } = useCalendarView();
  const { employees, isLoading: loadingE } = useEmployees(); // <- Added employees
  const [hiddenStatuses, setHiddenStatuses] = useState<AppointmentStatus[]>([]);

  // Sincronizar vista inicial con preferencias del usuario
  useEffect(() => {
    if (preferences?.default_view) {
      setView(preferences.default_view);
    }
  }, [preferences?.default_view, setView]);

  // Redirigir a vista 'day' si se encuentra en 'week' en pantallas móviles
  useEffect(() => {
    const checkMobileView = () => {
      if (window.innerWidth < 768 && view === 'week') {
        setView('day');
      }
    };
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, [view, setView]);

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

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      // 1. Filtro de colores (status)
      if (hiddenStatuses.includes(appt.status)) return false;
      return true;
    });
  }, [appointments, hiddenStatuses]);

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
              <ViewSwitcher value={view} onChange={(v) => {
                console.log('Changing view to:', v);
                setView(v);
              }} />
              {view !== 'month' && <ZoomControls value={zoom} onChange={(z) => {
                console.log('Changing zoom to:', z);
                setZoom(z);
              }} />}
              <button
                onClick={() => {
                  console.log('Opening new appointment modal');
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

        {/* Filter Bar */}
        <div className="bg-fondo-zen rounded-3xl p-3 shadow-sm border border-secundario-zen/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secundario-zen/30 border border-secundario-zen/60 text-primario-zen/50 transition-all">
              <Filter className="w-3 h-3" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Filtros</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {['pending_advance', 'confirmed', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setHiddenStatuses(prev =>
                    prev.includes(status as AppointmentStatus)
                      ? prev.filter(s => s !== status)
                      : [...prev, status as AppointmentStatus]
                  );
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  hiddenStatuses.includes(status as AppointmentStatus)
                    ? 'opacity-20 scale-75'
                    : 'opacity-100 scale-100'
                } ${
                  status === 'pending_advance' ? 'bg-yellow-400' :
                  status === 'confirmed' ? 'bg-green-400' :
                  status === 'completed' ? 'bg-purple-400' : 'bg-red-400'
                }`}
                title={status}
              />
            ))}
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
            style={{ willChange: 'transform, opacity' }}
          >
            {view === 'day' && (
              <DayView
                date={anchorDate}
                appointments={filteredAppointments}
                employees={employees} // <- Passed employees
                hourHeight={hourHeight}
                currentTime={currentTime}
                onAppointmentClick={setSelectedAppointment}
                onSlotClick={handleSlotClick}
              />
            )}
            {view === 'week' && (
              <WeekView
                date={anchorDate}
                appointments={filteredAppointments}
                hourHeight={hourHeight}
                currentTime={currentTime}
                onAppointmentClick={setSelectedAppointment}
                onSlotClick={handleSlotClick}
              />
            )}
            {view === 'month' && (
              <MonthView
                date={anchorDate}
                appointments={filteredAppointments}
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
