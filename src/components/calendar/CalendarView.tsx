'use client';

// ============================================================
// src/components/calendar/CalendarView.tsx
// Vista principal del calendario con conmutador Día/Semana/Mes.
// Conectada a Supabase via useAppointments + useTimeBlocks.
// Soporta propiedades opcionales de lectura y filtrado por cliente.
// ============================================================

import { useMemo, useState, useEffect, useCallback } from 'react';
import { addDays, format, startOfWeek, subDays, addWeeks, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Loader2, Filter, Sparkles } from 'lucide-react';
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
import { useCalendarShortcuts } from '@/hooks/useCalendarShortcuts';
import { useToast } from '@/components/ui/ToastProvider';
import { useApp } from '@/context/AppContext';
import { GRID_END_HOUR, GRID_HOURS, GRID_START_HOUR, startOfLocalDay } from '@/lib/calendarGrid';
import type { AppointmentWithRelations, AppointmentStatus } from '@/types/supabase';

// Definimos la interfaz para soportar la vista de agenda del cliente externos
interface CalendarViewProps {
  readOnly?: boolean;
  customerFilterId?: string;
}

export function CalendarView({ readOnly = false, customerFilterId }: CalendarViewProps) {
  const { activeProject, role, user } = useApp();
  const projectId = activeProject?.id ?? null;
  const toast = useToast();

  // Estado de fecha de referencia central
  const [anchorDate, setAnchorDate] = useState<Date>(() => startOfLocalDay(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfLocalDay(new Date()));
  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Hooks de UI compartidos
  const { view, setView, zoom, setZoom, hourHeight } = useCalendarView();

  // Modales
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<Date>(() => startOfLocalDay(new Date()));
  const [prefilledEmployeeId, setPrefilledEmployeeId] = useState<string | undefined>(undefined);

  // Filtros de Empleados
  const { employees } = useEmployees();
  // Si es empleada, forzamos su ID
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(role === 'employee' && user ? user.id : 'all');
  const effectiveEmployeeId = role === 'employee' && user ? user.id : selectedEmployeeId;

  // Consultas de datos concurrentes vinculadas al proyecto pasando el string | null esperado
  const { appointments, isLoading, refetch, createAppointment, updateAppointment } = useAppointments({ projectId });
  const { timeBlocks } = useTimeBlocks({ projectId });

  // Filtrado reactivo combinado: por Especialista y opcionalmente por Cliente (Agenda externa)
  const filteredAppointments = useMemo(() => {
    let result = appointments;

    if (effectiveEmployeeId !== 'all') {
      result = result.filter((a) => a.employee_id === effectiveEmployeeId);
    }

    if (customerFilterId) {
      result = result.filter((a) => a.customer_id === customerFilterId);
    }

    return result;
  }, [appointments, effectiveEmployeeId, customerFilterId]);

  // Sincronizar anchorDate si cambia la fecha seleccionada en vista diaria
  useEffect(() => {
    if (view === 'day') {
      setAnchorDate(selectedDate);
    }
  }, [selectedDate, view]);

  // Navegación temporal adaptativa
  const handlePrev = () => {
    if (view === 'day') setAnchorDate((d) => subDays(d, 1));
    if (view === 'week') {
      const s = startOfWeek(anchorDate, { weekStartsOn: 1 });
      setAnchorDate(() => subDays(s, 7));
    }
    if (view === 'month') {
      const s = startOfWeek(subDays(anchorDate, anchorDate.getDate() - 1), { weekStartsOn: 1 });
      setAnchorDate(() => subDays(s, 30));
    }
  };

  const handleNext = () => {
    if (view === 'day') setAnchorDate((d) => addDays(d, 1));
    if (view === 'week') {
      const s = startOfWeek(anchorDate, { weekStartsOn: 1 });
      setAnchorDate(() => addDays(s, 7));
    }
    if (view === 'month') {
      const s = startOfWeek(subDays(anchorDate, anchorDate.getDate() - 1), { weekStartsOn: 1 });
      setAnchorDate(() => addDays(s, 30));
    }
  };

  const handleToday = () => {
    const today = startOfLocalDay(new Date());
    setAnchorDate(today);
    setSelectedDate(today);
  };

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    if (readOnly) return; // Blindaje extra en modo lectura
    const success = await updateAppointment(id, { status: newStatus });
    if (success) {
      setSelectedAppointment((prev) => (prev && prev.id === id ? { ...prev, status: newStatus } : prev));
      refetch();
      // Toast feedback premium
      const labels: Record<AppointmentStatus, string> = {
        pending_advance: 'Pendiente',
        confirmed_advance: 'Confirmada',
        completed: 'Cobrada',
        free: 'Gratis',
        cancelled: 'Cancelada',
        no_show: 'No se presentó',
      };
      toast.success('Cita actualizada', `Ahora: ${labels[newStatus] ?? newStatus}`);
    } else {
      toast.error('No se pudo actualizar', 'Intenta de nuevo en un momento.');
    }
  };

  const handleOpenNewModal = (date?: Date, empId?: string) => {
    if (readOnly) return; // Desactivado en modo lectura
    setPrefilledDate(date ?? startOfLocalDay(new Date()));
    setPrefilledEmployeeId(empId);
    setIsNewModalOpen(true);
  };

  // Helper: ejecuta un atajo de teclado y devuelve el resultado
  const runShortcut = useCallback(
    (shortcut: Parameters<typeof useCalendarShortcuts>[0]['onShortcut'] extends (s: infer S) => void ? S : never) => {
      switch (shortcut.type) {
        case 'new':
          handleOpenNewModal();
          return;
        case 'prev-day':
          handlePrev();
          return;
        case 'next-day':
          handleNext();
          return;
        case 'prev-week':
          setAnchorDate((d) => subWeeks(d, 1));
          return;
        case 'next-week':
          setAnchorDate((d) => addWeeks(d, 1));
          return;
        case 'today':
          handleToday();
          return;
        case 'set-status': {
          if (!selectedAppointmentId) {
            toast.info('Selecciona una cita', 'Haz clic en una cita del calendario y vuelve a intentar.');
            return;
          }
          handleStatusChange(selectedAppointmentId, shortcut.status);
          return;
        }
        case 'escape': {
          if (isNewModalOpen) setIsNewModalOpen(false);
          else if (selectedAppointment) setSelectedAppointment(null);
          return;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedAppointmentId, isNewModalOpen, selectedAppointment]
  );

  useCalendarShortcuts({ onShortcut: runShortcut, enabled: !readOnly });

  // Título dinámico de la cabecera del calendario
  const headerTitle = useMemo(() => {
    if (view === 'day') {
      return format(anchorDate, "EEEE, d 'de' MMMM", { locale: es });
    }
    if (view === 'week') {
      const s = startOfWeek(anchorDate, { weekStartsOn: 1 });
      const e = addDays(s, 6);
      if (s.getMonth() === e.getMonth()) {
        return format(s, "MMMM 'de' yyyy", { locale: es });
      }
      return `${format(s, 'MMM', { locale: es })} - ${format(e, 'MMM yyyy', { locale: es })}`;
    }
    return format(anchorDate, "MMMM 'de' yyyy", { locale: es });
  }, [view, anchorDate]);

  if (!isMounted) {
    return (
      <div className="flex h-full items-center justify-center bg-fondo-zen">
        <Loader2 className="w-8 h-8 animate-spin text-primario-zen/40" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-fondo-zen">
      {/* Barra de Controles Premium */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-secundario-zen/40 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-light tracking-wide text-primario-zen capitalize select-none min-w-[200px]">
            {headerTitle}
          </h1>
          <div className="flex bg-secundario-zen/20 border border-secundario-zen/40 rounded-full p-0.5">
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-fondo-zen rounded-full text-primario-zen/70 hover:text-primario-zen transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-1 text-[10px] uppercase tracking-widest font-semibold text-primario-zen/70 hover:text-primario-zen transition-all rounded-full hover:bg-fondo-zen"
            >
              Hoy
            </button>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-fondo-zen rounded-full text-primario-zen/70 hover:text-primario-zen transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 border border-secundario-zen/40 rounded-full text-primario-zen/50 hover:text-primario-zen hover:bg-secundario-zen/10 transition-all disabled:opacity-40"
            title="Sincronizar base de datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Selector de Filtro de Empleados */}
          <div className="flex items-center gap-2 bg-secundario-zen/10 border border-secundario-zen/40 rounded-full px-3.5 py-1.5">
            <Filter className="w-3 h-3 text-primario-zen/40" />
            <select
              value={effectiveEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              disabled={role === 'employee'}
              className="bg-transparent text-xs text-primario-zen/70 focus:outline-none pr-2 font-medium cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {role !== 'employee' && <option value="all">Todos los Especialistas</option>}
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <ZoomControls value={zoom} onChange={setZoom} />
          <ViewSwitcher value={view} onChange={setView} />

          {/* Atajos premium: tipografía editorial, como un pie de revista. */}
          {!readOnly && (
            <div
              className="hidden xl:flex items-baseline gap-2 text-[10px] text-primario-zen/50 font-serif italic select-none"
              title="Atajos: N nueva · ← → día · ↑ ↓ semana · T hoy · 1 confirmar · 2 cobrada · 3 no-show · 4 cancelar · Esc cerrar"
            >
              <Sparkles className="w-3 h-3 text-gold-primary" strokeWidth={1.5} />
              <span>
                <KeyCap>N</KeyCap> nueva
                <span className="mx-1.5 text-gold-primary/60">·</span>
                <KeyCap>1</KeyCap>–<KeyCap>4</KeyCap> estado
                <span className="mx-1.5 text-gold-primary/60">·</span>
                <KeyCap>Esc</KeyCap> cerrar
              </span>
            </div>
          )}

          {/* Renderizado condicional del botón de Nueva Cita basado en readOnly */}
          {!readOnly && (
            <button
              onClick={() => handleOpenNewModal()}
              className="bg-primario-zen text-fondo-zen text-[10px] font-semibold uppercase tracking-widest px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Nueva Cita
            </button>
          )}
        </div>
      </div>

      {/* Ornamento editorial: línea dorada + rombo. Separa la barra de la grilla
          y aporta ese "magazine spread" que diferencia a Zen de un admin genérico. */}
      <div className="flex items-center gap-3 mb-3" aria-hidden>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-primary/30 to-gold-primary/30" />
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          className="text-gold-primary"
        >
          <path
            d="M5 0 L10 5 L5 10 L0 5 Z"
            fill="currentColor"
            opacity="0.55"
          />
        </svg>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-gold-primary/30 to-gold-primary/30" />
      </div>

      {/* Contenedor de la Grilla de Vistas Animada */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${view}-${anchorDate.toISOString()}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="flex-1 min-h-0 bg-fondo-zen rounded-2xl border border-secundario-zen/30 shadow-sm overflow-hidden"
        >
          {view === 'day' && (
            <DayView
              date={anchorDate}
              appointments={filteredAppointments}
              hourHeight={hourHeight}
              onAppointmentClick={(a) => {
                setSelectedAppointment(a);
                setSelectedAppointmentId(a.id);
              }}
              onSlotClick={(date, hour, minute, empId) => {
                const clickedDate = new Date(date);
                clickedDate.setHours(hour, minute, 0, 0);
                handleOpenNewModal(clickedDate, empId);
              }}
              selectedAppointmentId={selectedAppointmentId}
              employees={employees}
              currentTime={currentTime}
            />
          )}

          {view === 'week' && (
            <WeekView
              date={anchorDate}
              appointments={filteredAppointments}
              hourHeight={hourHeight}
              onAppointmentClick={(a) => {
                setSelectedAppointment(a);
                setSelectedAppointmentId(a.id);
              }}
              onSlotClick={(date, hour, minute) => {
                const clickedDate = new Date(date);
                clickedDate.setHours(hour, minute, 0, 0);
                // No tenemos empleada específica en la vista semanal de momento, si la hay se pasa
                handleOpenNewModal(clickedDate);
              }}
              selectedAppointmentId={selectedAppointmentId}
              currentTime={currentTime}
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

      {/* Modales de Interacción */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onStatusChange={handleStatusChange}
      />

      {/* Solo renderizamos e inicializamos el formulario de alta si no es de lectura */}
      {!readOnly && (
        <NewAppointmentModal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          defaultDate={prefilledDate}
          defaultEmployeeId={prefilledEmployeeId}
          onSubmit={async (payload) => {
            const finalProjectId = projectId ?? payload.project_id;
            if (!finalProjectId) {
              toast.error('Error', 'No hay proyecto activo para la cita.');
              return null;
            }
            const res = await createAppointment({ ...payload, project_id: finalProjectId } as any);
            if (res) refetch();
            return res;
          }}
        />
      )}
    </div>
  );
}

export { GRID_START_HOUR, GRID_END_HOUR, GRID_HOURS };

/**
 * Cáp de teclado con tipografía editorial: caja fina, fondo cream, tracking generoso.
 * Pensado para integrarse con la voz de "revista" del calendario, no para parecer un IDE.
 */
function KeyCap({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 rounded-[0.25rem] border border-primario-zen/20 bg-fondo-zen/80 text-primario-zen/80 font-sans text-[9px] font-semibold leading-none -translate-y-px">
      {children}
    </span>
  );
}