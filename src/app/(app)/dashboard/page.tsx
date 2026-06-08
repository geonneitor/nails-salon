'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users,
  MessageSquare,
  ChevronRight,
  Clock,
  BellRing,
  FileText,
  Coffee,
} from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import { useProject } from '@/context/AppContext';
import { useToast } from '@/components/ui/ToastProvider';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { startOfLocalDay } from '@/lib/calendarGrid';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AppointmentWithRelations } from '@/types/supabase';

export default function DashboardPage() {
  const { activeProject } = useProject();
  const toast = useToast();
  const projectId = activeProject?.id ?? null;

  const dateRange = useMemo(() => {
    const today = startOfLocalDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return { from: today.toISOString(), to: tomorrow.toISOString() };
  }, []);

  const { appointments, isLoading, error } = useAppointments({ projectId, dateRange });

  const todayAppointments = useMemo(() => appointments || [], [appointments]);
  const totalToday = todayAppointments.length;

  // FIXED: cálculo real de recordatorios pendientes (citas con anticipo aún no confirmado)
  const pendingReminders = useMemo(
    () => todayAppointments.filter(a => a.status === 'pending_advance').length,
    [todayAppointments]
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-primario-zen/60">
        <p className="text-sm">Ocurrió un error al cargar el panel. Intenta recargar la página.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-none mx-auto w-full space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-primario-zen tracking-tight">
            Panel de Control
          </h1>
          <p className="text-primario-zen/50 text-sm font-medium uppercase tracking-widest">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
          </p>
        </div>
        <Link
          href="/calendar"
          className="flex items-center gap-2 bg-primario-zen text-fondo-zen px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-sm"
        >
          <Calendar className="w-4 h-4" />
          Ver Agenda Completa
        </Link>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Citas hoy */}
        <div className="bg-fondo-zen border border-secundario-zen/50 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-primario-zen/10 rounded-2xl text-primario-zen">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-primario-zen/40">Hoy</span>
          </div>
          <div>
            {isLoading ? (
              <div className="h-10 w-16 bg-secundario-zen/30 rounded-xl animate-pulse" />
            ) : (
              <div className="text-4xl font-serif text-primario-zen">{totalToday}</div>
            )}
            <div className="text-primario-zen/60 text-sm font-medium">Citas programadas</div>
          </div>
        </div>

        {/* Estado de jornada */}
        <div className="bg-fondo-zen border border-secundario-zen/50 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-primario-zen/10 rounded-2xl text-primario-zen">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-primario-zen/40">Estado</span>
          </div>
          <div>
            <div className="text-4xl font-serif text-primario-zen">
              {isLoading ? '...' : totalToday > 0 ? 'Activa' : 'Vacía'}
            </div>
            <div className="text-primario-zen/60 text-sm font-medium">Jornada de trabajo</div>
          </div>
        </div>

        {/* FIXED: recordatorios pendientes calculados realmente */}
        <div className="bg-fondo-zen border border-secundario-zen/50 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-primario-zen/10 rounded-2xl text-primario-zen">
              <BellRing className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-primario-zen/40">Avisos</span>
          </div>
          <div>
            <div className="text-4xl font-serif text-primario-zen">
              {isLoading ? '...' : pendingReminders}
            </div>
            <div className="text-primario-zen/60 text-sm font-medium">Recordatorios pendientes</div>
          </div>
        </div>
      </div>

      {/* Today's list */}
      <div className="bg-fondo-zen border border-secundario-zen/50 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-secundario-zen/50 flex items-center justify-between">
          <h2 className="font-serif text-xl text-primario-zen">Clientas de Hoy</h2>
          <div className="flex items-center gap-2 text-primario-zen/40 text-xs uppercase tracking-widest font-bold">
            <Users className="w-4 h-4" />
            {isLoading ? '...' : `${totalToday} personas`}
          </div>
        </div>

        {isLoading ? (
          // FIXED: skeleton en vez de texto italic
          <div className="p-6 grid grid-cols-1 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : todayAppointments.length === 0 ? (
          // FIXED: empty state ilustrado en vez de texto italic vacío
          <div className="px-6 py-4">
            <EmptyState
              icon={Coffee}
              title="Hoy es un día libre"
              description="No hay citas agendadas para hoy. Un buen momento para preparar todo para mañana."
              action={{ label: 'Ver Agenda', onClick: () => {} }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secundario-zen/20 text-primario-zen/60 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-3">Hora</th>
                  <th className="px-6 py-3">Clienta</th>
                  <th className="px-6 py-3">Servicio / Diseño</th>
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secundario-zen/50">
                {[...todayAppointments]
                  .sort((a, b) => (a.start_time > b.start_time ? 1 : -1))
                  .map((appt) => (
                  <tr key={appt.id} className="hover:bg-secundario-zen/20 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-primario-zen">
                      {appt.start_time ? format(new Date(appt.start_time), 'HH:mm', { locale: es }) : '--:--'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-primario-zen">
                          {appt.customer?.name || 'Clienta anónima'}
                        </span>
                        <span className="text-[10px] text-primario-zen/40 uppercase tracking-tighter">
                          {appt.customer?.phone || 'Sin teléfono'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-primario-zen/80 font-medium">
                          {appt.ticket_details?.activeServices?.join(' + ') || 'Servicio General'}
                        </span>
                        {appt.customer?.service_notes && (
                          <div className="flex items-center gap-1 text-[10px] text-primario-zen/50 italic">
                            <FileText className="w-3 h-3" />
                            {appt.customer.service_notes.length > 40
                              ? appt.customer.service_notes.substring(0, 40) + '...'
                              : appt.customer.service_notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toast.info('Notas del Servicio', appt.customer?.service_notes || 'Sin notas registradas.')}
                          className="p-2 rounded-full bg-secundario-zen/30 text-primario-zen/60 hover:bg-primario-zen hover:text-fondo-zen transition-all"
                          title="Ver notas"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (!appt.customer?.phone) {
                              toast.warning('Sin teléfono', 'Esta clienta no tiene número registrado.');
                              return;
                            }
                            const phone = appt.customer.phone.replace(/\D/g, '');
                            const msg = `Hola ${appt.customer?.name || 'Clienta'}, te recordamos tu cita hoy a las ${format(new Date(appt.start_time!), 'HH:mm', { locale: es })}. ¡Te esperamos!`;
                            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          className="p-2 rounded-full bg-secundario-zen/30 text-primario-zen/60 hover:bg-green-600 hover:text-white transition-all"
                          title="Enviar recordatorio WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <Link
                          href="/calendar"
                          className="p-2 rounded-full bg-secundario-zen/30 text-primario-zen/60 hover:bg-primario-zen hover:text-fondo-zen transition-all"
                          title="Ver en calendario"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
