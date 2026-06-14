'use client';

// ============================================================
// /caja — Cash close (cierre de caja) del día
//
// Vista para el admin/empleado al final del día:
//   * Header editorial con la fecha y la separación dorada.
//   * Strip de 3 KPIs: Cobrado · Pendiente · Esperado.
//   * Lista de citas de hoy en 3 columnas (Cobrado / Adelanto / Pendiente)
//     con click para ciclar el payment_status.
//   * Botón "Cerrar caja" que crea un row en `daily_closings` y comparte
//     un resumen por WhatsApp (D3 = opción: texto wa.me).
// ============================================================

import { useMemo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  CheckCircle2,
  Clock,
  Hourglass,
  TrendingUp,
  MessageCircle,
  FileLock2,
  Sparkles,
  CircleDashed,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

import { useProject } from '@/context/AppContext';
import { useAppointments } from '@/hooks/useAppointments';
import { useToast } from '@/components/ui/ToastProvider';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { supabase } from '@/lib/supabaseClient';

import type {
  AppointmentWithRelations,
  PaymentStatus,
} from '@/types/supabase';

const PAYMENT_LABELS: Record<PaymentStatus, { label: string; short: string }> = {
  paid: { label: 'Cobrado', short: 'COBRADO' },
  advance: { label: 'Adelanto', short: 'ADELANTO' },
  unpaid: { label: 'Pendiente', short: 'PENDIENTE' },
};

const PAYMENT_ORDER: PaymentStatus[] = ['paid', 'advance', 'unpaid'];

function nextPaymentStatus(s: PaymentStatus): PaymentStatus {
  const i = PAYMENT_ORDER.indexOf(s);
  return PAYMENT_ORDER[(i + 1) % PAYMENT_ORDER.length];
}

const formatMXN = (n: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(n || 0);

export default function CajaPage() {
  const { activeProject } = useProject();
  const projectId = activeProject?.id ?? null;
  const toast = useToast();
  const { settings: businessSettings } = useBusinessSettings();

  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  // Trae citas que intersectan el día seleccionado (3 días de buffer
  // para citas que cruzan medianoche).
  const dateRange = useMemo(() => {
    const from = startOfDay(selectedDate);
    const to = endOfDay(selectedDate);
    return { from: from.toISOString(), to: to.toISOString() };
  }, [selectedDate]);

  const { appointments, isLoading, updateAppointment, refetch } = useAppointments({
    projectId,
    dateRange,
  });

  // Sólo citas que INICIAN dentro del día seleccionado.
  const todayAppts = useMemo(
    () =>
      appointments.filter((a) =>
        isWithinInterval(parseISO(a.start_time), {
          start: startOfDay(selectedDate),
          end: endOfDay(selectedDate),
        })
      ),
    [appointments, selectedDate]
  );

  // Citas excluidas (canceladas / no-show) — el admin las ve aparte.
  const excluded = useMemo(
    () =>
      appointments.filter(
        (a) => a.status === 'cancelled' || a.status === 'no_show'
      ),
    [appointments]
  );

  // ── Cálculos memoizados ─────────────────────────────────────
  const collected = useMemo(
    () =>
      todayAppts
        .filter((a) => a.payment_status === 'paid' && a.status !== 'cancelled')
        .reduce((sum, a) => sum + (a.total_price ?? 0), 0),
    [todayAppts]
  );
  const advance = useMemo(
    () =>
      todayAppts
        .filter((a) => a.payment_status === 'advance' && a.status !== 'cancelled')
        .reduce((sum, a) => sum + (a.total_price ?? 0), 0),
    [todayAppts]
  );
  const pending = useMemo(
    () =>
      todayAppts
        .filter((a) => a.payment_status === 'unpaid' && a.status !== 'cancelled')
        .reduce((sum, a) => sum + (a.total_price ?? 0), 0),
    [todayAppts]
  );
  const expected = useMemo(
    () => todayAppts
      .filter((a) => a.status !== 'cancelled' && a.status !== 'no_show')
      .reduce((sum, a) => sum + (a.total_price ?? 0), 0),
    [todayAppts]
  );

  // ── Handlers ─────────────────────────────────────────────────
  const cyclePayment = useCallback(
    async (a: AppointmentWithRelations) => {
      const next = nextPaymentStatus(a.payment_status);
      const ok = await updateAppointment(a.id, { payment_status: next });
      if (ok) {
        toast.success(
          `Marcada como ${PAYMENT_LABELS[next].label.toLowerCase()}`,
          a.customer?.name ?? 'la cita'
        );
        refetch();
      } else {
        toast.error('No se pudo actualizar el estado de pago');
      }
    },
    [updateAppointment, toast, refetch]
  );

  // ── Cerrar caja ──────────────────────────────────────────────
  const [closing, setClosing] = useState(false);
  const [closedToday, setClosedToday] = useState<boolean>(false);
  const [closedSnapshot, setClosedSnapshot] = useState<{
    total_collected: number;
    total_pending: number;
    total_expected: number;
    appointment_count: number;
  } | null>(null);

  // ¿Ya hay un cierre para este día?
  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const { data } = await supabase
        .from('daily_closings')
        .select('id, total_collected, total_pending, total_expected, appointment_count')
        .eq('project_id', projectId)
        .eq('closing_date', dateStr)
        .maybeSingle();
      if (!cancelled) {
        if (data) {
          setClosedToday(true);
          setClosedSnapshot({
            total_collected: Number(data.total_collected),
            total_pending: Number(data.total_pending),
            total_expected: Number(data.total_expected),
            appointment_count: data.appointment_count,
          });
        } else {
          setClosedToday(false);
          setClosedSnapshot(null);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [projectId, selectedDate, closing, refetch]);

  const closeCaja = useCallback(async () => {
    if (!projectId) return;
    if (closedToday) {
      toast.info('La caja de este día ya está cerrada.');
      return;
    }
    setClosing(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const ids = todayAppts
      .filter((a) => a.status !== 'cancelled' && a.status !== 'no_show')
      .map((a) => a.id);

    const { error } = await supabase
      .from('daily_closings')
      .insert({
        project_id: projectId,
        closing_date: dateStr,
        total_collected: collected,
        total_pending: pending,
        total_expected: expected,
        appointment_count: ids.length,
        appointment_ids: ids,
      });

    if (error) {
      toast.error('No se pudo cerrar la caja', error.message);
    } else {
      toast.success('Caja cerrada', `Resumen guardado para el ${format(selectedDate, "d 'de' MMMM", { locale: es })}.`);
      setClosedToday(true);
      setClosedSnapshot({
        total_collected: collected,
        total_pending: pending,
        total_expected: expected,
        appointment_count: ids.length,
      });
    }
    setClosing(false);
  }, [projectId, selectedDate, todayAppts, collected, pending, expected, closedToday, toast]);

  // ── Compartir por WhatsApp (D3) ──────────────────────────────
  const buildSummaryMessage = useCallback(() => {
    const lines: string[] = [];
    const dateLabel = format(selectedDate, "EEEE d 'de' MMMM", { locale: es });
    lines.push(`🌿 *Cierre de caja — ${businessSettings?.salon_name ?? activeProject?.name ?? 'Zen'}*`);
    lines.push(dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1));
    lines.push('');
    lines.push(`✅ Cobrado: *${formatMXN(closedSnapshot?.total_collected ?? collected)}*`);
    lines.push(`💰 Adelantos: *${formatMXN(advance)}*`);
    lines.push(`⏳ Pendiente: *${formatMXN(closedSnapshot?.total_pending ?? pending)}*`);
    lines.push(`📊 Total esperado: *${formatMXN(closedSnapshot?.total_expected ?? expected)}*`);
    lines.push('');
    lines.push(`${closedSnapshot?.appointment_count ?? todayAppts.length} citas en el día.`);
    return lines.join('\n');
  }, [selectedDate, businessSettings, activeProject, collected, advance, pending, expected, todayAppts, closedSnapshot]);

  const shareWhatsApp = useCallback(() => {
    const phone = businessSettings?.salon_phone?.replace(/\D/g, '');
    const target = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(buildSummaryMessage())}` : `https://wa.me/?text=${encodeURIComponent(buildSummaryMessage())}`;
    window.open(target, '_blank', 'noopener,noreferrer');
  }, [businessSettings, buildSummaryMessage]);

  // ── Helpers de fecha ─────────────────────────────────────────
  const goPrevDay = () => setSelectedDate((d) => subDays(d, 1));
  const goToday = () => setSelectedDate(new Date());
  const goNextDay = () => setSelectedDate((d) => subDays(d, -1));
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

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
            Cierre diario
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-primario-zen tracking-tight leading-none">
            Tu caja, en orden.
          </h1>
          <p className="text-on-surface-variant/70 text-sm font-medium uppercase tracking-[0.18em] font-sans mt-3">
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={goPrevDay}
            className="w-9 h-9 rounded-full bg-secundario-zen/30 text-primario-zen/70 hover:bg-secundario-zen/60 hover:text-primario-zen transition-all flex items-center justify-center"
            aria-label="Día anterior"
          >
            ‹
          </button>
          <button
            onClick={goToday}
            className={`px-4 h-9 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] transition-all border ${
              isToday
                ? 'bg-primario-zen text-fondo-zen border-primario-zen'
                : 'bg-fondo-zen text-primario-zen/70 border-outline-variant/40 hover:border-primario-zen/40'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={goNextDay}
            className="w-9 h-9 rounded-full bg-secundario-zen/30 text-primario-zen/70 hover:bg-secundario-zen/60 hover:text-primario-zen transition-all flex items-center justify-center"
            aria-label="Día siguiente"
          >
            ›
          </button>
        </div>
      </motion.header>

      {/* ORNAMENTO */}
      <div className="flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-primary/30 to-gold-primary/30" />
        <svg width="10" height="10" viewBox="0 0 10 10" className="text-gold-primary">
          <path d="M5 0 L10 5 L5 10 L0 5 Z" fill="currentColor" opacity="0.55" />
        </svg>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-gold-primary/30 to-gold-primary/30" />
      </div>

      {/* KPIs */}
      <section
        aria-label="Resumen del día"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5"
      >
        <CajaKpi
          label="Cobrado"
          value={collected}
          icon={CheckCircle2}
          tone="botanical"
          hint="PAGOS COMPLETOS"
        />
        <CajaKpi
          label="Adelantos"
          value={advance}
          icon={Hourglass}
          tone="gold"
          hint="ANTICIPOS"
        />
        <CajaKpi
          label="Pendiente"
          value={pending}
          icon={Clock}
          tone="lavender"
          hint="POR COBRAR"
        />
      </section>

      {/* CIERRE BAR */}
      <section
        aria-label="Cerrar caja"
        className="card-depth rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="flex items-start gap-4">
          <span className="shrink-0 w-12 h-12 rounded-2xl bg-gold-primary/10 border border-gold-primary/30 flex items-center justify-center text-gold-dark">
            <FileLock2 className="w-5 h-5" strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="font-serif text-2xl text-primario-zen">
              {closedToday ? 'Caja cerrada' : 'Cerrar caja del día'}
            </h2>
            <p className="text-xs text-on-surface-variant/70 font-sans mt-1 max-w-md">
              {closedToday
                ? `Guardamos el cierre para el ${format(selectedDate, "d 'de' MMMM", { locale: es })}. Total registrado: ${formatMXN(closedSnapshot?.total_collected ?? 0)}.`
                : 'Al cerrar, se congela el total cobrado y se guarda un snapshot del día. Podrás revisarlo más tarde.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={shareWhatsApp}
            className="inline-flex items-center gap-2 bg-secundario-zen/30 text-primario-zen px-4 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-secundario-zen/60 transition-all"
          >
            <MessageCircle className="w-4 h-4" strokeWidth={2} />
            Compartir resumen
          </button>
          <button
            onClick={closeCaja}
            disabled={closing || closedToday || todayAppts.length === 0}
            className="inline-flex items-center gap-2 bg-primario-zen text-fondo-zen px-5 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-primario-zen/90 transition-all shadow-soft-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
            {closedToday ? 'Cerrada' : closing ? 'Cerrando…' : 'Cerrar caja'}
          </button>
        </div>
      </section>

      {/* LISTA DE CITAS */}
      <section className="card-depth rounded-3xl p-6">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-serif text-2xl text-primario-zen">Citas del día</h2>
          <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 font-sans">
            Click en una tarjeta para cambiar su estado de pago
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-secundario-zen/20 animate-pulse" />
            ))}
          </div>
        ) : todayAppts.length === 0 ? (
          <CajaEmpty
            date={selectedDate}
            onToday={goToday}
          />
        ) : (
          <ul className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {todayAppts
                .slice()
                .sort((a, b) => (a.start_time > b.start_time ? 1 : -1))
                .map((a, idx) => (
                  <CajaRow
                    key={a.id}
                    appt={a}
                    idx={idx}
                    onCycle={() => cyclePayment(a)}
                  />
                ))}
            </AnimatePresence>
          </ul>
        )}

        {excluded.length > 0 && (
          <details className="mt-6 group">
            <summary className="cursor-pointer text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 font-sans flex items-center gap-2">
              <CircleDashed className="w-3 h-3" />
              {excluded.length} cancelada{excluded.length > 1 ? 's' : ''} / no-show
            </summary>
            <ul className="mt-3 flex flex-col gap-2 opacity-60">
              {excluded.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between text-xs text-on-surface-variant/80 px-3 py-2 rounded-2xl border border-dashed border-outline-variant/30"
                >
                  <span>
                    {format(parseISO(a.start_time), 'HH:mm')} · {a.customer?.name ?? 'Clienta'}
                  </span>
                  <span className="uppercase tracking-widest text-[10px]">
                    {a.status === 'cancelled' ? 'Cancelada' : 'No-show'}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      {/* Expected total editorial line */}
      <section className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 px-2">
        <p className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/60 font-sans flex items-center gap-2">
          <TrendingUp className="w-3 h-3" />
          Total esperado del día
        </p>
        <p className="font-serif text-3xl text-primario-zen tabular-nums">
          {formatMXN(expected)}
        </p>
      </section>
    </div>
  );
}

// ============================================================
// Subcomponentes
// ============================================================

function CajaKpi({
  label,
  value,
  icon: Icon,
  tone = 'botanical',
  hint,
}: {
  label: string;
  value: number;
  icon: typeof Wallet;
  tone?: 'botanical' | 'gold' | 'lavender';
  hint?: string;
}) {
  const toneRing: Record<string, string> = {
    botanical: 'border-botanical-1/30',
    gold: 'border-gold-primary/40',
    lavender: 'border-lavender-primary/30',
  };
  const toneIcon: Record<string, string> = {
    botanical: 'text-botanical-1 bg-botanical-1/5',
    gold: 'text-gold-dark bg-gold-primary/10',
    lavender: 'text-lavender-dark bg-lavender-primary/10',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`card-depth rounded-3xl p-6 border-t-2 ${toneRing[tone]} relative overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/70 font-sans">
            {label}
          </p>
          <p className="font-serif text-3xl md:text-4xl text-primario-zen tabular-nums mt-2">
            {formatMXN(value)}
          </p>
          {hint && (
            <p className="text-[10px] uppercase tracking-[0.18em] text-gold-dark font-semibold font-sans mt-2">
              {hint}
            </p>
          )}
        </div>
        <span className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${toneIcon[tone]}`}>
          <Icon className="w-5 h-5" strokeWidth={1.75} />
        </span>
      </div>
    </motion.div>
  );
}

function CajaRow({
  appt,
  idx,
  onCycle,
}: {
  appt: AppointmentWithRelations;
  idx: number;
  onCycle: () => void;
}) {
  const start = parseISO(appt.start_time);
  const pill = appt.payment_status;
  const pillCfg: Record<PaymentStatus, { cls: string; label: string }> = {
    paid: {
      cls: 'bg-botanical-1/15 text-botanical-1 border-botanical-1/40',
      label: 'Cobrado',
    },
    advance: {
      cls: 'bg-gold-primary/15 text-gold-dark border-gold-primary/50',
      label: 'Adelanto',
    },
    unpaid: {
      cls: 'bg-secundario-zen/40 text-on-surface-variant/80 border-outline-variant/40',
      label: 'Pendiente',
    },
  };
  const cfg = pillCfg[pill];

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: 0.03 * idx, duration: 0.25 }}
    >
      <button
        type="button"
        onClick={onCycle}
        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl border border-outline-variant/30 bg-fondo-zen hover:border-primario-zen/40 hover:shadow-soft-shadow transition-all text-left"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primario-zen/70 font-sans tabular-nums shrink-0 w-12">
          {format(start, 'HH:mm')}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-base text-primario-zen truncate">
            {appt.customer?.name ?? 'Clienta'}
          </p>
          <p className="text-[11px] text-on-surface-variant/70 font-sans italic truncate">
            {appt.employee?.name ?? 'Sin asignar'} · {formatMXN(appt.total_price ?? 0)}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-[0.18em] font-sans shrink-0 ${cfg.cls}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {cfg.label}
        </span>
      </button>
    </motion.li>
  );
}

function CajaEmpty({ date, onToday }: { date: Date; onToday: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-6 rounded-2xl border border-dashed border-primario-zen/30 bg-primario-zen/5">
      <span className="w-12 h-12 rounded-full bg-primario-zen/10 flex items-center justify-center mb-3">
        <Wallet className="w-5 h-5 text-primario-zen" strokeWidth={1.75} />
      </span>
      <p className="font-serif text-xl text-primario-zen">No hay citas este día</p>
      <p className="text-xs text-on-surface-variant/70 font-sans mt-1.5 max-w-xs">
        {format(date, "EEEE d 'de' MMMM", { locale: es })}. Un buen momento para preparar la semana.
      </p>
      <Link
        href="/calendar"
        className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-primario-zen/70 hover:text-primario-zen font-sans"
      >
        <CalendarIcon className="w-3 h-3" />
        Ir al calendario
      </Link>
    </div>
  );
}
