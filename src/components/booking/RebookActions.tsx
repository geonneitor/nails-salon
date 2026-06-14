'use client';

// ============================================================
// src/components/booking/RebookActions.tsx
// Tres acciones premium para el momento "acabás de reservar":
//  1) Añadir a mi calendario (Google, Outlook, Apple .ics)
//  2) Compartir por WhatsApp (wa.me/?text=... deep link)
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarPlus, MessageCircle, Check, ChevronDown } from 'lucide-react';

export interface RebookActionsProps {
  date: Date;
  salonName: string;
  serviceLabel: string;
  salonWhatsapp?: string;
  salonAddress?: string;
}

const TIME_FMT = new Intl.DateTimeFormat('es-MX', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

const DATE_FMT = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

function downloadIcs({
  uid,
  title,
  description,
  location,
  start,
  durationMin,
}: {
  uid: string;
  title: string;
  description: string;
  location?: string;
  start: Date;
  durationMin: number;
}) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

  const end = new Date(start.getTime() + durationMin * 60_000);
  const now = new Date();

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zen Booking//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}@zen-booking`,
    `DTSTAMP:${fmt(now)}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${escapeIcs(title)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    location ? `LOCATION:${escapeIcs(location)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zen-${title.toLowerCase().replace(/\s+/g, '-')}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function escapeIcs(s: string) {
  return s.replace(/[\\,;]/g, (m) => '\\' + m).replace(/\n/g, '\\n');
}

export function RebookActions({
  date,
  salonName,
  serviceLabel,
  salonWhatsapp,
  salonAddress,
}: RebookActionsProps) {
  const [justDownloaded, setJustDownloaded] = useState(false);
  const [showCalendarOptions, setShowCalendarOptions] = useState(false);

  const title = `Cita en ${salonName}`;
  const description = `${serviceLabel} — Recuerda tu pago de anticipo.`;
  const location = salonAddress || '';
  const durationMin = 60; // Estimated
  
  const end = new Date(date.getTime() + durationMin * 60_000);

  const handleAppleCalendar = () => {
    downloadIcs({
      uid: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      description,
      location,
      start: date,
      durationMin,
    });
    successFeedback();
  };

  const handleGoogleCalendar = () => {
    const formatGoogleDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatGoogleDate(date)}/${formatGoogleDate(end)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
    window.open(url, '_blank');
    successFeedback();
  };

  const handleOutlookCalendar = () => {
    const formatOutlookDate = (d: Date) => d.toISOString();
    const url = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(title)}&startdt=${formatOutlookDate(date)}&enddt=${formatOutlookDate(end)}&body=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
    window.open(url, '_blank');
    successFeedback();
  };

  const successFeedback = () => {
    setShowCalendarOptions(false);
    setJustDownloaded(true);
    setTimeout(() => setJustDownloaded(false), 2_500);
  };

  const handleWhatsapp = () => {
    const dateStr = DATE_FMT.format(date);
    const timeStr = TIME_FMT.format(date);
    const msg = encodeURIComponent(
      `¡Hola! Acabo de enviar mi comprobante de anticipo para mi reserva en ${salonName} el ${dateStr} a las ${timeStr}. 🌿`
    );
    const url = salonWhatsapp
      ? `https://wa.me/${salonWhatsapp}?text=${msg}`
      : `https://wa.me/?text=${msg}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="flex flex-col gap-3 mb-8 w-full max-w-sm"
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-primary/40 to-gold-primary/40" />
        <p className="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-semibold font-sans">
          Guarda tu cita
        </p>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-gold-primary/40 to-gold-primary/40" />
      </div>

      <div className="flex flex-col gap-2">
        {/* Calendar Group */}
        <div className="relative w-full">
          <button
            onClick={() => setShowCalendarOptions(!showCalendarOptions)}
            className={`w-full group relative flex items-center justify-center gap-2 px-4 py-3 rounded-full border text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-200 font-sans overflow-hidden ${
              justDownloaded
                ? 'bg-primary text-on-primary border-primary shadow-soft-shadow'
                : 'bg-surface-container-low text-primary border-outline-variant/40 hover:border-gold-primary hover:text-primary hover:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] hover:bg-surface-container-lowest'
            }`}
          >
            {justDownloaded ? <Check className="w-4 h-4" /> : <CalendarPlus className="w-4 h-4" />}
            <span>{justDownloaded ? '¡Listo!' : 'Añadir a calendario'}</span>
            {!justDownloaded && <ChevronDown className="w-3 h-3 ml-1" />}
          </button>

          <AnimatePresence>
            {showCalendarOptions && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-lg z-50 overflow-hidden flex flex-col"
              >
                <button onClick={handleGoogleCalendar} className="px-4 py-3 text-xs font-bold text-on-surface hover:bg-primary/5 hover:text-primary text-left transition-colors border-b border-outline-variant/20">Google Calendar</button>
                <button onClick={handleOutlookCalendar} className="px-4 py-3 text-xs font-bold text-on-surface hover:bg-primary/5 hover:text-primary text-left transition-colors border-b border-outline-variant/20">Outlook</button>
                <button onClick={handleAppleCalendar} className="px-4 py-3 text-xs font-bold text-on-surface hover:bg-primary/5 hover:text-primary text-left transition-colors">Apple Calendar (.ics)</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleWhatsapp}
          className="w-full group relative flex items-center justify-center gap-2 px-4 py-3 rounded-full border text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-200 font-sans overflow-hidden bg-surface-container-low text-primary border-outline-variant/40 hover:border-gold-primary hover:text-primary hover:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] hover:bg-surface-container-lowest"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Confirmar en WhatsApp</span>
        </button>
      </div>
    </motion.div>
  );
}
