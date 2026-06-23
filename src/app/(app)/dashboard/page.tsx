'use client';

// ============================================================
// DashboardPage — Morning Brief
//
// Tres zonas:
//   1) Header con greeting editorial y CTA "Ver agenda".
//   2) Strip de KPIs (Citas hoy · Cobrado hoy · Pendiente · No-shows semana).
//   3) Timeline vertical de las citas de hoy (TodayTimeline).
//   4) Alerts strip abajo (AlertList) — recordatorios, cumpleaños, etc.
// ============================================================

import { useMemo, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Wallet, AlertCircle, TrendingDown, Sparkles, Cake } from 'lucide-react';
import { format, addDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

import { useProject } from '@/context/AppContext';
import { useAppointments } from '@/hooks/useAppointments';
import { useToast } from '@/components/ui/ToastProvider';
import { useCustomers } from '@/hooks/useCustomers';
import { startOfLocalDay } from '@/lib/calendarGrid';
import { bellEvents } from '@/lib/notifications/bellEvents';

import { KpiCard } from '@/components/dashboard/KpiCard';
import { TodayTimeline } from '@/components/dashboard/TodayTimeline';
import { AlertList, type AlertItem } from '@/components/dashboard/AlertList';

import type { AppointmentWithRelations } from '@/types/supabase';

export default function DashboardPage() {
  const { activeProject } = useProject();
  const projectId = activeProject?.id ?? null;
  const toast = useToast();
  const router = useRouter();
  const { customers } = useCustomers();

  // Estado para filtro del Timeline desde los KPIs
  const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'pending' | 'no_show'>('all');

  // dateRange con refresco a medianoche: evita el bug de "hoy congelado"
  // si la pestaña queda abierta entre días.
  const [today, setToday] = useState<Date>(() => startOfLocalDay(new Date()));
  const dateRange = useMemo(() => {
    const from = today;
    const to = addDays(from, 7);
    return { from: from.toISOString(), to: to.toISOString() };
  }, [today]);

  useEffect(() => {
    // Calcular ms hasta la próxima medianoche y refrescar el rango.
    function msUntilMidnight() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      return midnight.getTime() - now.getTime();
    }
    let timeout: ReturnType<typeof setTimeout>;
    function scheduleRefresh() {
      timeout = setTimeout(() => {
        setToday(startOfLocalDay(new Date()));
        scheduleRefresh();
      }, msUntilMidnight());
    }
    scheduleRefresh();
    return () => clearTimeout(timeout);
  }, []);

  const { appointments, isLoading, updateAppointment, refetch } = useAppointments({
    projectId,
    dateRange,
  });

  // ── Cálculos memoizados para KPIs ───────────────────────────────
  const todayAppts = useMemo(
    () => appointments.filter((a) => isWithinInterval(new Date(a.start_time), {
      start: startOfDay(today),
      end: endOfDay(today),
    })),
    [appointments, today]
  );

  const collectedToday = useMemo(
    () => todayAppts
      .filter((a) => a.status === 'completed' || a.status === 'confirmed_advance')
      .reduce((sum, a) => sum + (a.total_price ?? 0), 0),
    [todayAppts]
  );
  const pendingToday = useMemo(
    () => todayAppts
      .filter((a) => a.status === 'pending_advance')
      .reduce((sum, a) => sum + (a.total_price ?? 0), 0),
    [todayAppts]
  );
  const noShowsThisWeek = useMemo(
    () => appointments.filter((a) => a.status === 'no_show').length,
    [appointments]
  );
  const unconfirmedCount = useMemo(
    () => todayAppts.filter((a) => a.status === 'pending_advance').length,
    [todayAppts]
  );

  // Citas filtradas para la línea de tiempo
  const displayedAppts = useMemo(() => {
    if (activeFilter === 'all') return todayAppts;
    if (activeFilter === 'completed') return todayAppts.filter(a => a.status === 'completed' || a.status === 'confirmed_advance');
    if (activeFilter === 'pending') return todayAppts.filter(a => a.status === 'pending_advance');
    if (activeFilter === 'no_show') return todayAppts.filter(a => a.status === 'no_show');
    return todayAppts;
  }, [todayAppts, activeFilter]);

  // ── Alertas (recordatorios pendientes, cumpleaños, no-shows) ─────
  const [remindersPending, setRemindersPending] = useState(0);
  const prevRemindersRef = useRef(0);
  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/reminders?status=pending`);
        if (!res.ok) return;
        const json = await res.json();
        const next = json.reminders?.length ?? 0;
        if (!cancelled) {
          setRemindersPending((prev) => {
            // Solo emitir si SUBE el contador (nuevo recordatorio entra).
            if (next > prev && prev > 0) {
              bellEvents.emit({
                type: 'reminder_sent',
                payload: {
                  title: 'Recordatorio listo',
                  body: `${next} recordatorio(s) listo(s) para enviar.`,
                  url: '/settings',
                },
              });
            }
            return next;
          });
        }
      } catch {
        /* silencioso: el badge no debe romper el dashboard */
      }
    })();
    return () => { cancelled = true; };
  }, [projectId, appointments]);

  const birthdaySoon = useMemo(() => {
    if (!customers || customers.length === 0) return 0;
    const now = new Date();
    const weekAhead = addDays(now, 7);
    return customers.filter((c) => {
      if (!c.birthday) return false;
      // birthday es DATE — combinar con año actual
      const [, mm, dd] = c.birthday.split('-').map(Number);
      const thisYear = new Date(now.getFullYear(), mm - 1, dd);
      return isWithinInterval(thisYear, { start: now, end: weekAhead });
    }).length;
  }, [customers]);

  const alerts: AlertItem[] = useMemo(() => {
    const out: AlertItem[] = [];
    if (unconfirmedCount > 0) {
      out.push({
        id: 'unconfirmed',
        kind: 'unconfirmed',
        title: `${unconfirmedCount} cita${unconfirmedCount > 1 ? 's' : ''} sin confirmar`,
        description: 'Pendientes de recibir el anticipo.',
        href: '/calendar',
      });
    }
    if (remindersPending > 0) {
      out.push({
        id: 'reminders',
        kind: 'reminder',
        title: `${remindersPending} recordatorio${remindersPending > 1 ? 's' : ''} programado${remindersPending > 1 ? 's' : ''}`,
        description: 'Se enviarán automáticamente en su ventana horaria.',
        href: '/settings',
      });
    }
    if (birthdaySoon > 0) {
      out.push({
        id: 'birthday',
        kind: 'birthday',
        title: `${birthdaySoon} cumpleaño${birthdaySoon > 1 ? 's' : ''} esta semana`,
        description: 'Un detalle hace la diferencia.',
        href: '/customers',
      });
    }
    if (noShowsThisWeek > 0) {
      out.push({
        id: 'noshow',
        kind: 'failed',
        title: `${noShowsThisWeek} no-show esta semana`,
        description: 'Considera enviar un recordatorio más temprano.',
        href: '/calendar',
      });
    }
    return out;
  }, [unconfirmedCount, remindersPending, birthdaySoon, noShowsThisWeek]);

  // ── Handlers de la timeline ──────────────────────────────────────
  const handleMarkPaid = async (id: string) => {
    const ok = await updateAppointment(id, { status: 'completed' });
    if (ok) {
      toast.success('Marcada como cobrada', 'La cita se cerró correctamente.');
      refetch();
    } else {
      toast.error('No se pudo actualizar');
    }
  };
  const handleConfirm = async (id: string) => {
    const ok = await updateAppointment(id, { status: 'confirmed_advance' });
    if (ok) {
      toast.success('Cita confirmada');
      refetch();
    }
  };
  const handleSelect = (_appt: AppointmentWithRelations) => {
    // Navegar sin recargar la página completa.
    router.push('/calendar');
  };

  return (
    <div className="p-6 md:p-8 max-w-none mx-auto w-full space-y-8">
      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-2"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-semibold font-sans mb-2 flex items-center gap-2">
            <Sparkles className="w-3 h-3" strokeWidth={2} />
            {greeting()}, {activeProject?.name ?? 'Zen'}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-primario-zen tracking-tight leading-none">
            Tu día, en un vistazo.
          </h1>
          <p className="text-on-surface-variant/70 text-sm font-medium uppercase tracking-[0.18em] font-sans mt-3">
            {format(today, "EEEE, d 'de' MMMM", { locale: es })}
          </p>
        </div>

        <Link
          href="/calendar"
          className="self-start md:self-auto inline-flex items-center gap-2 bg-primario-zen text-fondo-zen px-5 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-primario-zen/90 transition-all shadow-soft-shadow"
        >
          <Calendar className="w-4 h-4" strokeWidth={2} />
          Ver Agenda
        </Link>
      </motion.header>

      {/* ORNAMENTO EDITORIAL: línea + rombo */}
      <div className="flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-primary/30 to-gold-primary/30" />
        <svg width="10" height="10" viewBox="0 0 10 10" className="text-gold-primary">
          <path d="M5 0 L10 5 L5 10 L0 5 Z" fill="currentColor" opacity="0.55" />
        </svg>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-gold-primary/30 to-gold-primary/30" />
      </div>

      {/* STRIP DE KPIs */}
      <section
        aria-label="Resumen del día"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
      >
        <KpiCard
          label="Citas hoy"
          value={todayAppts.length}
          icon={Calendar}
          caption="Citas programadas"
          hint="HOY"
          tone="primary"
          onClick={() => setActiveFilter(activeFilter === 'all' ? 'all' : 'all')}
          isActive={activeFilter === 'all'}
        />
        <KpiCard
          label="Cobrado hoy"
          value={collectedToday}
          icon={Wallet}
          caption="Ingresos del día"
          suffix="MXN"
          hint="COBRADO"
          tone="gold"
          onClick={() => setActiveFilter(activeFilter === 'completed' ? 'all' : 'completed')}
          isActive={activeFilter === 'completed'}
        />
        <KpiCard
          label="Pendiente de cobrar"
          value={pendingToday}
          icon={AlertCircle}
          caption="Anticipos por recibir"
          suffix="MXN"
          hint="PENDIENTE"
          tone="lavender"
          onClick={() => setActiveFilter(activeFilter === 'pending' ? 'all' : 'pending')}
          isActive={activeFilter === 'pending'}
        />
        <KpiCard
          label="No-shows hoy"
          value={todayAppts.filter(a => a.status === 'no_show').length}
          icon={TrendingDown}
          caption="Inasistencias del día"
          hint="HOY"
          tone="botanical"
          onClick={() => setActiveFilter(activeFilter === 'no_show' ? 'all' : 'no_show')}
          isActive={activeFilter === 'no_show'}
        />
      </section>

      {/* TIMELINE + ALERTS */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="card-depth rounded-3xl p-6">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-serif text-2xl text-primario-zen">La jornada de hoy</h2>
            <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 font-sans">
              {displayedAppts.length === 0
                ? 'Sin citas'
                : `${displayedAppts.length} ${displayedAppts.length === 1 ? 'cita' : 'citas'}`}
            </span>
          </div>
          <TodayTimeline
            appointments={displayedAppts}
            isLoading={isLoading}
            onMarkPaid={handleMarkPaid}
            onConfirm={handleConfirm}
            onSelect={handleSelect}
          />
        </div>

        <aside className="card-depth rounded-3xl p-6">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-serif text-2xl text-primario-zen">Para tu atención</h2>
            <Cake className="w-4 h-4 text-gold-dark" strokeWidth={1.75} />
          </div>
          <AlertList
            alerts={alerts}
            emptyMessage="Todo en orden 🌿 Disfruta tu jornada."
          />
        </aside>
      </section>
    </div>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}
