'use client';

// ============================================================
// TodayTimeline.tsx — Timeline vertical de las citas de hoy.
// Cada entrada: hora + cliente + servicio + acciones inline.
// Diseño: columna editorial con hairline dorado entre items.
// ============================================================

import Link from 'next/link';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  MessageCircle,
  CheckCircle2,
  Phone,
  FileText,
  Coffee,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import type { AppointmentWithRelations, AppointmentStatus } from '@/types/supabase';

interface TodayTimelineProps {
  appointments: AppointmentWithRelations[];
  isLoading: boolean;
  onMarkPaid: (id: string) => void;
  onConfirm: (id: string) => void;
  onSelect: (appt: AppointmentWithRelations) => void;
}

const STATUS_PILL: Record<AppointmentStatus, { label: string; cls: string }> = {
  confirmed_advance: { label: 'Confirmada', cls: 'bg-primario-zen/10 text-primario-zen border-primario-zen/30' },
  pending_advance: { label: 'Por confirmar', cls: 'bg-gold-primary/10 text-gold-dark border-gold-primary/40' },
  completed: { label: 'Cobrada', cls: 'bg-secundario-zen/40 text-on-surface-variant/80 border-outline-variant/40' },
  free: { label: 'Sin anticipo', cls: 'bg-primario-zen/5 text-primario-zen/70 border-primario-zen/20' },
  cancelled: { label: 'Cancelada', cls: 'bg-error-container/40 text-on-surface-variant/60 border-outline-variant/40 line-through' },
  no_show: { label: 'No asistió', cls: 'bg-error-container/40 text-on-surface-variant/60 border-outline-variant/40' },
};

export function TodayTimeline({
  appointments,
  isLoading,
  onMarkPaid,
  onConfirm,
  onSelect,
}: TodayTimelineProps) {
  const toast = useToast();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-2xl bg-secundario-zen/20 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-12 px-6 rounded-2xl border border-dashed border-primario-zen/30 bg-primario-zen/5">
        <span className="w-12 h-12 rounded-full bg-primario-zen/10 flex items-center justify-center mb-3">
          <Coffee className="w-5 h-5 text-primario-zen" strokeWidth={1.75} />
        </span>
        <p className="font-serif text-xl text-primario-zen">Hoy es un día libre</p>
        <p className="text-xs text-on-surface-variant/70 font-sans mt-1.5 max-w-xs">
          No hay citas agendadas. Un buen momento para preparar todo para mañana.
        </p>
      </div>
    );
  }

  const sorted = [...appointments].sort((a, b) =>
    a.start_time > b.start_time ? 1 : -1
  );

  return (
    <ol className="relative">
      {/* Hairline vertical dorada — recorre toda la lista */}
      <div
        aria-hidden
        className="absolute left-[34px] top-3 bottom-3 w-px bg-gradient-to-b from-transparent via-gold-primary/40 to-transparent"
      />

      {sorted.map((appt, idx) => {
        const start = new Date(appt.start_time);
        const pill = STATUS_PILL[appt.status] ?? STATUS_PILL.pending_advance;
        const service = (appt.ticket_details?.activeServices as string[] | undefined)?.join(' + ')
          ?? 'Servicio';

        return (
          <motion.li
            key={appt.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.04 * idx, duration: 0.4, ease: 'easeOut' }}
            className="relative pl-20 pr-3 py-3 group"
          >
            {/* Nodo en la hairline */}
            <div
              aria-hidden
              className="absolute left-[28px] top-6 w-3.5 h-3.5 rounded-full border-2 border-gold-primary bg-fondo-zen shadow-[0_0_0_3px_var(--surface)] z-10"
            />
            {/* Hora */}
            <span className="absolute left-0 top-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primario-zen/70 font-sans tabular-nums">
              {format(start, 'HH:mm', { locale: es })}
            </span>

            <button
              type="button"
              onClick={() => onSelect(appt)}
              className="w-full text-left flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-gold-primary/50 hover:shadow-soft-shadow transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-serif text-base text-primario-zen truncate">
                    {appt.customer?.name ?? 'Clienta'}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[9px] font-semibold uppercase tracking-[0.15em] font-sans ${pill.cls}`}
                  >
                    {pill.label}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant/80 font-sans mt-1 italic truncate">
                  {service} · {appt.employee?.name ?? 'Sin asignar'} · ${appt.total_price ?? 0} MXN
                </p>
                {appt.customer?.phone && (
                  <p className="text-[10px] text-on-surface-variant/50 font-sans mt-0.5 flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5" />
                    {appt.customer.phone}
                  </p>
                )}
              </div>

              {/* Acciones inline — sólo en hover para no saturar */}
              <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                {appt.customer?.phone && (
                  <IconAction
                    icon={<MessageCircle className="w-3.5 h-3.5" />}
                    label="WhatsApp"
                    onClick={(e) => {
                      e.stopPropagation();
                      const phone = appt.customer!.phone!.replace(/\D/g, '');
                      const msg = `Hola ${appt.customer?.name}, te recordamos tu cita hoy a las ${format(start, 'HH:mm')}.`;
                      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                  />
                )}
                {appt.status === 'pending_advance' && (
                  <IconAction
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    label="Confirmar"
                    onClick={(e) => { e.stopPropagation(); onConfirm(appt.id); }}
                    tone="primary"
                  />
                )}
                {appt.status !== 'completed' && appt.status !== 'cancelled' && appt.status !== 'no_show' && (
                  <IconAction
                    icon={<Sparkles className="w-3.5 h-3.5" />}
                    label="Cobrada"
                    onClick={(e) => { e.stopPropagation(); onMarkPaid(appt.id); }}
                    tone="gold"
                  />
                )}
                {appt.customer?.service_notes && (
                  <IconAction
                    icon={<FileText className="w-3.5 h-3.5" />}
                    label="Notas"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.info('Notas de la clienta', appt.customer!.service_notes ?? '');
                    }}
                  />
                )}
              </div>
            </button>
          </motion.li>
        );
      })}
    </ol>
  );
}

function IconAction({
  icon,
  label,
  onClick,
  tone = 'ghost',
}: {
  icon: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  tone?: 'ghost' | 'primary' | 'gold';
}) {
  const toneCls =
    tone === 'primary'
      ? 'bg-primario-zen text-fondo-zen hover:bg-primario-zen/90'
      : tone === 'gold'
        ? 'bg-gold-primary text-botanical-1 hover:bg-gold-light'
        : 'bg-secundario-zen/30 text-primario-zen/70 hover:bg-secundario-zen/60';
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center transition-all ${toneCls}`}
    >
      {icon}
    </button>
  );
}
