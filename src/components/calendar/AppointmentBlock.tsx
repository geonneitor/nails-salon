'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Check, X as XIcon, AlertOctagon, Sparkles } from 'lucide-react';
import { rangeHeight, timeToYOffset } from '@/lib/calendarGrid';
import { useAppointments } from '@/hooks/useAppointments';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/components/ui/ToastProvider';
import { ReminderBadge, ReminderCard } from './ReminderBadge';
import type { AppointmentWithRelations, AppointmentStatus } from '@/types/supabase';
import type { AppointmentReminder } from '@/hooks/useAppointmentReminders';

// Paleta Zen extendida para los 4 estados — todos en la familia botanical / cream / gold.
const STATUS_STYLES: Record<
  AppointmentStatus,
  { bg: string; border: string; text: string; pill: string; label: string }
> = {
  confirmed_advance: {
    bg: 'bg-primario-zen',
    border: 'border-primario-zen',
    text: 'text-fondo-zen',
    pill: 'bg-fondo-zen/20 text-fondo-zen',
    label: 'Confirmado',
  },
  pending_advance: {
    bg: 'bg-surface-container-low',
    border: 'border-secundario-zen/80',
    text: 'text-primario-zen',
    pill: 'bg-secundario-zen/60 text-primario-zen/80',
    label: 'Por Confirmar',
  },
  completed: {
    bg: 'bg-secundario-zen/40',
    border: 'border-secundario-zen',
    text: 'text-primario-zen/60',
    pill: 'bg-secundario-zen text-primario-zen/70',
    label: 'Cobrada',
  },
  free: {
    bg: 'bg-transparent',
    border: 'border-dashed border-primario-zen/50',
    text: 'text-primario-zen',
    pill: 'bg-primario-zen/10 text-primario-zen',
    label: 'Gratis',
  },
  cancelled: {
    bg: 'bg-surface-container-low/60',
    border: 'border-outline-variant',
    text: 'text-on-surface-variant/70 line-through',
    pill: 'bg-surface-container text-on-surface-variant',
    label: 'Cancelada',
  },
  no_show: {
    bg: 'bg-surface-container-low/80',
    border: 'border-outline-variant',
    text: 'text-on-surface-variant/80',
    pill: 'bg-surface-container text-on-surface-variant',
    label: 'No Asistió',
  },
};

interface AppointmentBlockProps {
  appointment: AppointmentWithRelations;
  hourHeight: number;
  columnIndex: number;
  columnCount: number;
  currentTime?: Date; // Para detectar "En Proceso"
  onClick?: () => void;
  /** Si la cita está "seleccionada" (clicada, lista para atajos 1-4). */
  isSelected?: boolean;
  /** Si es true, oculta los botones inline y desactiva las mutaciones. */
  readOnly?: boolean;
  /** Handler para arrastrar y soltar (Drag & Drop) */
  onReschedule?: (id: string, newStart: Date, newEnd: Date, newEmployeeId: string) => void;
}

export function AppointmentBlock({
  appointment,
  hourHeight,
  columnIndex,
  columnCount,
  currentTime,
  onClick,
  isSelected = false,
  readOnly = false,
  onReschedule,
}: AppointmentBlockProps) {
  const { activeProject } = useApp();
  const [openReminder, setOpenReminder] = useState<AppointmentReminder | null>(null);

  const start = new Date(appointment.start_time);
  const end = new Date(appointment.end_time);
  const top = timeToYOffset(start, hourHeight);
  const height = rangeHeight(start, end, hourHeight);

  // "En Proceso": la hora actual está dentro del rango de la cita.
  const isInProgress = currentTime
    ? currentTime >= start && currentTime <= end
    : false;

  const style = STATUS_STYLES[appointment.status];

  // "En Proceso" usa la paleta gold (no amarillo chillón) para integrarse con la marca.
  const currentStyle = isInProgress
    ? {
        bg: 'bg-gold-primary',
        border: 'border-gold-dark',
        text: 'text-botanical-1',
        pill: 'bg-botanical-1/15 text-botanical-1',
        label: 'En Proceso',
      }
    : style;

  const serviceName =
    appointment.ticket_details?.activeServices?.join(', ') ??
    'Servicio Dinámico';

  const widthPct = 100 / columnCount;
  const leftPct = columnIndex * widthPct;
  const inset = 2;

  const customColor = appointment.ticket_details?.booking_color;
  const customStyle = customColor ? {
    backgroundColor: customColor,
    borderColor: customColor,
    color: '#ffffff',
    textShadow: '0px 1px 3px rgba(0,0,0,0.4)',
  } : {};

  const handleDragEnd = (e: any, info: any) => {
    if (readOnly || !onReschedule) return;

    // Localizar columna destino bajo el puntero
    const elements = document.elementsFromPoint(info.point.x, info.point.y);
    const dropzone = elements.find(el => el.classList.contains('day-col-dropzone'));
    const newEmployeeId = dropzone?.getAttribute('data-employee-id') || appointment.employee_id;

    // Calcular cambio de tiempo según desplazamiento Y (snap a 15 min)
    const totalMinutesDelta = Math.round((info.offset.y / hourHeight) * 60);
    const snappedMinutesDelta = Math.round(totalMinutesDelta / 15) * 15;

    if (snappedMinutesDelta === 0 && newEmployeeId === appointment.employee_id) {
      return; // No hubo cambio
    }

    const newStart = new Date(start.getTime() + snappedMinutesDelta * 60000);
    const newEnd = new Date(end.getTime() + snappedMinutesDelta * 60000);

    onReschedule(appointment.id, newStart, newEnd, newEmployeeId);
  };

  return (
    <motion.div
      drag={!readOnly && !!onReschedule}
      dragSnapToOrigin={true}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      style={{
        top,
        height,
        left: `calc(${leftPct}% + ${inset}px)`,
        width: `calc(${widthPct}% - ${inset * 2}px)`,
        ...customStyle,
      }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{
        opacity: 1,
        scale: isInProgress ? [1, 1.015, 1] : isSelected ? 1.01 : 1,
      }}
      transition={{
        duration: 0.18,
        scale: {
          repeat: isInProgress ? Infinity : 0,
          repeatType: 'reverse',
          duration: 2.4,
          ease: 'easeInOut',
        },
      }}
      className={`absolute rounded-xl border ${currentStyle.bg} ${currentStyle.border} ${currentStyle.text} text-left overflow-hidden shadow-sm z-10 group/block ${
        isInProgress ? 'shadow-[0_0_18px_rgba(212,175,55,0.55)] ring-1 ring-gold-light' : ''
      } ${isSelected ? 'ring-2 ring-gold-primary shadow-[0_0_14px_rgba(212,175,55,0.35)]' : ''}`}
    >
      {/* Botón principal: el área visible. La propagación se corta en los botones
          inline para que abrir el detalle no se dispare al cambiar estado. */}
      <button
        type="button"
        onClick={onClick}
        className="w-full h-full px-2 py-1.5 hover:brightness-105 transition-all text-left overflow-hidden flex flex-col justify-start"
        aria-label={`Cita de ${appointment.customer.name} a las ${format(start, 'h:mm a')}`}
      >
        <div className="flex flex-col h-full w-full overflow-hidden">
          {height < 45 ? (
            // Vista muy compacta (ej. 30min en zoom compacto = 30px)
            <div className="flex items-baseline gap-2 truncate w-full">
              <span className="text-[10px] font-bold uppercase tracking-wider">{format(start, 'HH:mm')}</span>
              <span className="text-[10px] font-medium truncate">{serviceName}</span>
            </div>
          ) : (
            // Vista normal (>= 45px)
            <>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-90 leading-tight truncate w-full">
                {format(start, 'h:mm a')}
                {height >= 80 && <span className="opacity-60"> · {currentStyle.label}</span>}
              </span>
              <span className={`text-xs font-serif font-medium leading-tight ${height < 70 ? 'truncate' : 'line-clamp-2'} w-full`}>
                {serviceName}
              </span>
              {height >= 70 && (
                <span className="text-[10px] opacity-80 leading-tight truncate italic w-full">
                  {appointment.customer.name}
                </span>
              )}
              {height >= 100 && appointment.employee && (
                <span className={`mt-auto text-[9px] ${currentStyle.pill} rounded-full px-1.5 py-0.5 self-start uppercase tracking-[0.15em] truncate max-w-full`}>
                  {appointment.employee.name}
                </span>
              )}
            </>
          )}
        </div>
      </button>

      {/* Acciones inline — sólo si hay espacio suficiente (>= 90px) y no es readOnly */}
      {!readOnly && height >= 90 && (
        <InlineStatusRow
          appointmentId={appointment.id}
          status={appointment.status}
          isInProgress={isInProgress}
        />
      )}

      {/* Campanita de recordatorio (D1c) — flotante arriba-derecha. */}
      <ReminderBadge
        appointmentId={appointment.id}
        projectId={activeProject?.id ?? null}
        onOpen={(r) => setOpenReminder((prev) => (prev?.id === r.id ? null : r))}
      />

      {/* Tarjeta del recordatorio: popover sobre la cita. */}
      <AnimatePresence>
        {openReminder && (
          <ReminderCard
            reminder={openReminder}
            onClose={() => setOpenReminder(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Fila de acciones inline: aparece al hover o al recibir foco.
 * Permite cambiar el estado sin abrir el modal, con UI optimista y toast.
 * Usa exclusivamente tokens de la marca — sin colores planos genéricos.
 */
function InlineStatusRow({
  appointmentId,
  status,
  isInProgress,
}: {
  appointmentId: string;
  status: AppointmentStatus;
  isInProgress: boolean;
}) {
  // Pasar projectId evita crear un canal Realtime zombie sin proyecto.
  const { activeProject } = useApp();
  const { updateAppointment } = useAppointments({ projectId: activeProject?.id ?? null });
  const toast = useToast();

  const change = async (next: AppointmentStatus) => {
    if (status === next) return;
    const ok = await updateAppointment(appointmentId, { status: next });
    if (ok) {
      const labels: Record<AppointmentStatus, string> = {
        pending_advance: 'Por confirmar',
        confirmed_advance: 'Confirmada',
        completed: 'Cobrada',
        free: 'Gratis',
        cancelled: 'Cancelada',
        no_show: 'No asistió',
      };
      toast.success('Cita actualizada', `Ahora: ${labels[next]}`);
    } else {
      toast.error('No se pudo actualizar');
    }
  };

  return (
    <div
      // Detener propagación: el clic aquí NO debe abrir el modal de detalle.
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="absolute inset-x-1 bottom-1 flex gap-1 opacity-0 group-hover/block:opacity-100 focus-within:opacity-100 transition-all duration-200 ease-out translate-y-1 group-hover/block:translate-y-0 pointer-events-none group-hover/block:pointer-events-auto"
    >
      {status !== 'confirmed_advance' && (
        <InlineBtn
          label="Confirmar"
          onClick={() => change('confirmed_advance')}
          tone="primary"
          icon={<Check className="w-3 h-3" strokeWidth={2.5} />}
        />
      )}
      {status !== 'completed' && (
        <InlineBtn
          label="Cobrada"
          onClick={() => change('completed')}
          tone="cream"
          icon={<Check className="w-3 h-3" strokeWidth={2.5} />}
        />
      )}
      {status !== 'no_show' && !isInProgress && (
        <InlineBtn
          label="No-show"
          onClick={() => change('no_show')}
          tone="ghost"
          icon={<AlertOctagon className="w-3 h-3" strokeWidth={2.5} />}
        />
      )}
      {status !== 'cancelled' && (
        <InlineBtn
          label="Cancelar"
          onClick={() => change('cancelled')}
          tone="ghost-danger"
          icon={<XIcon className="w-3 h-3" strokeWidth={2.5} />}
        />
      )}
    </div>
  );
}

// Tonos todos derivados del design system (sin emerald-600 / red-500 planos).
const INLINE_TONE: Record<string, string> = {
  // Acción primaria = verde botanical
  primary:
    'bg-primario-zen hover:bg-primario-zen/90 text-fondo-zen shadow-sm',
  // Cobrada = crema dorado suave
  cream:
    'bg-gold-light/80 hover:bg-gold-light text-botanical-1 shadow-sm',
  // Acciones destructivas suaves: ghost con borde fino
  ghost:
    'bg-fondo-zen/85 hover:bg-fondo-zen text-primario-zen/70 border border-outline-variant/60 backdrop-blur-sm',
  'ghost-danger':
    'bg-fondo-zen/85 hover:bg-fondo-zen text-error/80 border border-error/30 backdrop-blur-sm',
};

function InlineBtn({
  label,
  onClick,
  tone,
  icon,
}: {
  label: string;
  onClick: () => void;
  tone: keyof typeof INLINE_TONE;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex-1 min-w-0 inline-flex items-center justify-center gap-1 px-1.5 py-1 rounded-md text-[9px] font-semibold uppercase tracking-[0.15em] transition-all duration-150 ${INLINE_TONE[tone]}`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}
