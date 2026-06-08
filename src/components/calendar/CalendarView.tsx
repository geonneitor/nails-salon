'use client';

// ============================================================
// src/components/calendar/CalendarView.tsx
// Vista principal del calendario con conmutador Día/Semana/Mes.
// Conectada a Supabase via useAppointments + useTimeBlocks.
// Soporta propiedades opcionales de lectura y filtrado por cliente.
// ============================================================

import { useMemo, useState, useEffect } from 'react';
import { addDays, format, startOfWeek, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Loader2, Filter } from 'lucide-react';
import { AppointmentDetailModal } from './AppointmentDetailModal';
import { NewAppointmentModal } from './NewAppointmentModal';
import { ViewSwitcher } from './ViewSwitcher';
import { DayView } from './views/DayView';
import { WeekView } from './views/WeekView';
import { MonthView } from './views/MonthView';
import { useAppointments } from '@/hooks/useAppointments';
import { useTimeBlocks } from '@/hooks/useTimeBlocks';
import { useEmployees } from '@/hooks/useEmployees';
import { useCalendarView } from '@/hooks/useCalendarView';
import { useApp } from '@/context/AppContext';
import { GRID_END_HOUR, GRID_HOURS, GRID_START_HOUR, startOfLocalDay } from '@/lib/calendarGrid';
import type { AppointmentWithRelations, AppointmentStatus } from '@/types/supabase';

// Definimos la interfaz para soportar la vista de agenda del cliente externos
interface CalendarViewProps {
  readOnly?: boolean;
  customerFilterId?: string;
}

export function CalendarView({ readOnly = false, customerFilterId }: CalendarViewProps) {
  const { activeProject } = useApp();
  const projectId = activeProject?.id ?? null;

  // Estado de fecha de referencia central
  const [anchorDate, setAnchorDate] = useState<Date>(() => startOfLocalDay(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfLocalDay(new Date()));
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hooks de UI compartidos
  const { view, setView, hourHeight } = useCalendarView();

  // Modales
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<Date>(() => startOfLocalDay(new Date()));

  // Filtros de Empleados
  const { employees } = useEmployees();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');

  // Consultas de datos concurrentes vinculadas al proyecto pasando el string | null esperado
  const { appointments, isLoading, refetch, createAppointment, updateAppointment } = useAppointments({ projectId });
  const { timeBlocks } = useTimeBlocks({ projectId });

  // Filtrado reactivo combinado: por Especialista y opcionalmente por Cliente (Agenda externa)
  const filteredAppointments = useMemo(() => {
    let result = appointments;

    if (selectedEmployeeId !== 'all') {
      result = result.filter((a) => a.employee_id === selectedEmployeeId);
    }

    if (customerFilterId) {
      result = result.filter((a) => a.customer_id === customerFilterId);
    }

    return result;
  }, [appointments, selectedEmployeeId, customerFilterId]);

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
    }
  };

  const handleOpenNewModal = (date?: Date) => {
    if (readOnly) return; // Desactivado en modo lectura
    setPrefilledDate(date ?? startOfLocalDay(new Date()));
    setIsNewModalOpen(true);
  };

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
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="bg-transparent text-xs text-primario-zen/70 focus:outline-none pr-2 font-medium cursor-pointer"
            >
              <option value="all">Todos los Especialistas</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <ViewSwitcher value={view} onChange={setView} />

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
              onAppointmentClick={setSelectedAppointment}
              employees={employees}
              currentTime={new Date()}
            />
          )}

          {view === 'week' && (
            <WeekView
              date={anchorDate}
              appointments={filteredAppointments}
              hourHeight={hourHeight}
              onAppointmentClick={setSelectedAppointment}
              currentTime={new Date()}
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
          onSubmit={async (payload) => {
            const res = await createAppointment({ ...payload, project_id: projectId ?? payload.project_id ?? "" } as any);
            if (res) refetch();
            return res;
          }}
        />
      )}
    </div>
  );
}

export { GRID_START_HOUR, GRID_END_HOUR, GRID_HOURS };