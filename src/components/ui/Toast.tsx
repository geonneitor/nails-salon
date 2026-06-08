'use client';

/**
 * Toast.tsx
 * ─────────────────────────────────────────────────────────────
 * Sistema de notificaciones efímeras de Zen.
 * Aparece como una etiqueta de papel colgada con un "clip" dorado.
 * Reemplaza todos los alert() y console.log() de la app.
 *
 * Tipos:
 *   - success: confirmación positiva (verde-oliva)
 *   - error:   fallo (terracota suave)
 *   - info:    mensaje neutral (azul tinta)
 *   - warning: atención (ámbar cálido)
 *
 * Usa los tokens semánticos del design system (no literales).
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertTriangle, Info, X, AlertOctagon } from 'lucide-react';
import { useEffect } from 'react';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
  /** Duración en ms. 0 = sticky. Por defecto, success/info = 4s, error = 6s, warning = 5s */
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

/* ── Configuración visual por tipo ──────────────────────────── */
const KIND_CONFIG: Record<
  ToastKind,
  {
    Icon: typeof Check;
    iconBgClass: string;
    iconColorClass: string;
    accentVar: string; // var(--...) para el "clip" dorado
    title: string;
  }
> = {
  success: {
    Icon: Check,
    iconBgClass: 'bg-primary/10',
    iconColorClass: 'text-primary',
    accentVar: 'var(--inverse-primary)',
    title: 'Listo',
  },
  error: {
    Icon: AlertOctagon,
    iconBgClass: 'bg-error/10',
    iconColorClass: 'text-error',
    accentVar: 'var(--error)',
    title: 'Algo salió mal',
  },
  warning: {
    Icon: AlertTriangle,
    iconBgClass: 'bg-[#B8860B]/10',
    iconColorClass: 'text-[#8B6914]',
    accentVar: '#B8860B',
    title: 'Atención',
  },
  info: {
    Icon: Info,
    iconBgClass: 'bg-[#5C7A8C]/10',
    iconColorClass: 'text-[#3D5A6C]',
    accentVar: '#5C7A8C',
    title: 'Aviso',
  },
};

/* ── Animaciones ───────────────────────────────────────────── */
const enter = {
  initial: { opacity: 0, x: 60, y: -8, scale: 0.96 },
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 380, damping: 30, mass: 0.9 },
  },
  exit: {
    opacity: 0,
    x: 80,
    scale: 0.95,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] as const },
  },
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const cfg = KIND_CONFIG[toast.kind];
  const Icon = cfg.Icon;
  const defaultDurations: Record<ToastKind, number> = {
    success: 4000,
    info: 4000,
    warning: 5000,
    error: 6000,
  };
  const duration = toast.duration ?? defaultDurations[toast.kind];

  // Auto-dismiss
  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => onDismiss(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onDismiss]);

  return (
    <motion.div
      layout
      {...enter}
      role={toast.kind === 'error' ? 'alert' : 'status'}
      aria-live={toast.kind === 'error' ? 'assertive' : 'polite'}
      className="group relative w-[calc(100vw-2rem)] sm:w-[380px] pointer-events-auto"
    >
      {/* "Clip" dorado en la esquina superior derecha — detalle de orfebrería */}
      <div
        className="absolute -top-1.5 right-6 w-3 h-5 rounded-sm rotate-[8deg] shadow-sm z-10"
        style={{
          background: `linear-gradient(135deg, ${cfg.accentVar} 0%, color-mix(in srgb, ${cfg.accentVar} 70%, white) 100%)`,
        }}
        aria-hidden
      />

      {/* Tarjeta principal — papel washi con textura sutil */}
      <div
        className="relative overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-[0_10px_40px_-12px_rgba(52,70,35,0.18),0_4px_12px_-4px_rgba(52,70,35,0.08)] backdrop-blur-sm"
      >
        {/* Línea de acento lateral — un toque editorial */}
        <div
          className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
          style={{ background: cfg.accentVar, opacity: 0.7 }}
          aria-hidden
        />

        <div className="flex items-start gap-3 pl-5 pr-3 py-3.5">
          {/* Icono en cápsula */}
          <div
            className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-xl ${cfg.iconBgClass}`}
          >
            <Icon className={`w-4.5 h-4.5 ${cfg.iconColorClass}`} strokeWidth={2.25} />
          </div>

          {/* Texto */}
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="font-serif text-[15px] leading-tight text-on-surface">
              {toast.title}
            </p>
            {toast.message && (
              <p className="mt-1 font-sans text-[13px] leading-snug text-on-surface-variant">
                {toast.message}
              </p>
            )}
            {/* Línea de tiempo de vida — barra finísima que se vacía */}
            {duration > 0 && (
              <motion.div
                className="mt-2.5 h-px rounded-full"
                style={{ background: cfg.accentVar, opacity: 0.25, transformOrigin: 'left' }}
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
              />
            )}
          </div>

          {/* Botón cerrar */}
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Cerrar notificación"
            className="shrink-0 -mr-1 -mt-1 p-1.5 rounded-lg text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Contenedor de la pila ─────────────────────────────────── */
interface ToastViewportProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  return (
    <div
      aria-label="Notificaciones"
      className="fixed z-[200] pointer-events-none flex flex-col-reverse gap-2.5
                 top-4 left-1/2 -translate-x-1/2
                 sm:top-auto sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0 sm:items-end
                 w-full sm:w-auto px-4 sm:px-0"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
