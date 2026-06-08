'use client';

/**
 * ToastProvider.tsx
 * ─────────────────────────────────────────────────────────────
 * Context global de notificaciones de Zen.
 * Envuelve <ToastProvider> en layout.tsx y usa el hook
 * useToast() en cualquier componente para mostrar mensajes.
 *
 * API:
 *   toast.success(title, message?)
 *   toast.error(title, message?)
 *   toast.info(title, message?)
 *   toast.warning(title, message?)
 *   toast.dismiss(id)
 */

import { createContext, useCallback, useContext, useState } from 'react';
import { ToastViewport } from './Toast';
import type { ToastData, ToastKind } from './Toast';

/* ── Tipos del Context ──────────────────────────────────────── */
interface ToastContextValue {
  /** Muestra una notificación de éxito */
  success: (title: string, message?: string, duration?: number) => void;
  /** Muestra una notificación de error */
  error: (title: string, message?: string, duration?: number) => void;
  /** Muestra una notificación informativa */
  info: (title: string, message?: string, duration?: number) => void;
  /** Muestra una notificación de advertencia */
  warning: (title: string, message?: string, duration?: number) => void;
  /** Cierra manualmente un toast por id */
  dismiss: (id: string) => void;
}

/* ── Context ────────────────────────────────────────────────── */
const ToastContext = createContext<ToastContextValue | null>(null);

/* ── Provider ───────────────────────────────────────────────── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (kind: ToastKind, title: string, message?: string, duration?: number) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, kind, title, message, duration }]);
    },
    []
  );

  const value: ToastContextValue = {
    success: (title, msg, dur) => show('success', title, msg, dur),
    error:   (title, msg, dur) => show('error',   title, msg, dur),
    info:    (title, msg, dur) => show('info',    title, msg, dur),
    warning: (title, msg, dur) => show('warning', title, msg, dur),
    dismiss,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/* ── Hook ───────────────────────────────────────────────────── */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast() debe usarse dentro de <ToastProvider>');
  }
  return ctx;
}
