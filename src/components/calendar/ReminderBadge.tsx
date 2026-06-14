'use client';

// ============================================================
// ReminderBadge.tsx
// Campanita decorativa al lado de una cita cuando tiene un
// recordatorio agendado (pending o sent). Tooltip con la hora.
// Al hacer click, abre la tarjeta completa con el wa.me prellenado.
// ============================================================

import { Bell, BellRing } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import type { AppointmentReminder } from '@/hooks/useAppointmentReminders';
import { useAppointmentReminders } from '@/hooks/useAppointmentReminders';

interface ReminderBadgeProps {
  appointmentId: string;
  projectId: string | null;
  onOpen: (reminder: AppointmentReminder) => void;
}

/**
 * Versión inline del badge: pensada para inyectarse en la `AppointmentBlock`.
 * Si NO hay recordatorios, retorna null (cero coste visual).
 */
export function ReminderBadge({ appointmentId, projectId, onOpen }: ReminderBadgeProps) {
  const { reminders } = useAppointmentReminders({ appointmentId, projectId });
  if (reminders.length === 0) return null;

  // Mostrar el más próximo que aún no se haya enviado.
  const next =
    reminders.find((r) => r.status === 'pending') ??
    reminders.find((r) => r.status === 'sent');

  if (!next) return null;

  const isPending = next.status === 'pending';
  const sendAt = new Date(next.send_at);
  const label = formatDistanceToNow(sendAt, { addSuffix: true, locale: es });

  return (
    <AnimatePresence>
      <motion.button
        type="button"
        // Detener propagación: el click en la campanita NO debe abrir el modal
        // de detalle de la cita.
        onClick={(e) => {
          e.stopPropagation();
          onOpen(next);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.18 }}
        title={`Recordatorio: ${label}`}
        aria-label={`Recordatorio agendado ${label}`}
        className={`absolute -top-1.5 -right-1.5 z-20 w-5 h-5 rounded-full flex items-center justify-center shadow-sm border backdrop-blur-sm ${
          isPending
            ? 'bg-gold-primary text-botanical-1 border-gold-light'
            : 'bg-primario-zen/90 text-fondo-zen border-primario-zen'
        }`}
      >
        {isPending ? (
          <BellRing className="w-2.5 h-2.5" strokeWidth={2.25} />
        ) : (
          <Bell className="w-2.5 h-2.5" strokeWidth={2.25} />
        )}
      </motion.button>
    </AnimatePresence>
  );
}

/**
 * Tarjeta completa: se abre en un popover al pulsar el badge.
 * Muestra el mensaje pre-formateado, el número destino y un
 * botón "Enviar por WhatsApp" que abre el wa.me/.
 */
export function ReminderCard({
  reminder,
  onClose,
}: {
  reminder: AppointmentReminder;
  onClose: () => void;
}) {
  const phone = (reminder.recipient_phone ?? '').replace(/[^\d+]/g, '');
  const text = reminder.message_template ?? '';
  const waUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute z-30 top-7 right-1 w-72 bg-surface-container-lowest rounded-2xl border border-gold-primary/30 shadow-[0_0_20px_rgba(212,175,55,0.18)] p-4 text-left"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="w-7 h-7 rounded-full bg-gold-primary/15 flex items-center justify-center">
          <BellRing className="w-3.5 h-3.5 text-gold-dark" strokeWidth={2} />
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-gold-dark font-semibold">
            Recordatorio
          </p>
          <p className="text-[10px] text-on-surface-variant">
            {formatDistanceToNow(new Date(reminder.send_at), {
              addSuffix: true,
              locale: es,
            })}
          </p>
        </div>
      </div>

      <p className="text-xs text-on-surface font-sans whitespace-pre-wrap leading-relaxed mb-3 max-h-48 overflow-y-auto pr-1">
        {text}
      </p>

      <div className="flex gap-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-primario-zen text-fondo-zen text-[10px] font-semibold uppercase tracking-[0.18em] hover:opacity-90 transition-all"
        >
          Enviar WhatsApp
        </a>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-2 rounded-full border border-outline-variant/50 text-on-surface-variant text-[10px] font-semibold uppercase tracking-[0.18em] hover:bg-surface-container transition-all"
        >
          Cerrar
        </button>
      </div>
    </motion.div>
  );
}
