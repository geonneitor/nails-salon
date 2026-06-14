'use client';

// ============================================================
// src/hooks/useCalendarShortcuts.ts
// Atajos de teclado premium para el calendario.
// - `n` / `N`       → nueva cita
// - `←` / `→`       → día anterior / siguiente
// - `↑` / `↓`       → semana anterior / siguiente
// - `t` / `T`       → ir a hoy
// - `1`             → confirmar cita seleccionada
// - `2`             → marcar como pagada (cobrada)
// - `3`             → marcar como no_show
// - `4`             → cancelar cita seleccionada
// - `Esc`           → cerrar modal
//
// Se ignoran silenciosamente cuando el usuario está escribiendo
// en un input, textarea, select o contentEditable.
// ============================================================

import { useEffect } from 'react';

export type CalendarShortcut =
  | { type: 'new' }
  | { type: 'prev-day' }
  | { type: 'next-day' }
  | { type: 'prev-week' }
  | { type: 'next-week' }
  | { type: 'today' }
  | { type: 'set-status'; status: 'confirmed_advance' | 'completed' | 'no_show' | 'cancelled' }
  | { type: 'escape' };

interface UseCalendarShortcutsOptions {
  /** Se llama cuando el usuario pulsa un atajo válido. */
  onShortcut: (shortcut: CalendarShortcut) => void;
  /** Si es false, el listener no se monta (útil en modo lectura). */
  enabled?: boolean;
}

/**
 * Detecta si el target del evento es un campo en el que el usuario está
 * escribiendo. En ese caso, el atajo se ignora (no pisamos teclas).
 */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  // Si está dentro de un dialog, también es zona de escritura
  if (target.closest('[role="dialog"]')) return true;
  return false;
}

export function useCalendarShortcuts({
  onShortcut,
  enabled = true,
}: UseCalendarShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;

    const handler = (e: KeyboardEvent) => {
      // No pisar modificadores estándar (Cmd+R, Ctrl+L, etc.)
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      const key = e.key;

      switch (key) {
        case 'n':
        case 'N':
          e.preventDefault();
          onShortcut({ type: 'new' });
          return;
        case 'ArrowLeft':
          e.preventDefault();
          onShortcut({ type: 'prev-day' });
          return;
        case 'ArrowRight':
          e.preventDefault();
          onShortcut({ type: 'next-day' });
          return;
        case 'ArrowUp':
          e.preventDefault();
          onShortcut({ type: 'prev-week' });
          return;
        case 'ArrowDown':
          e.preventDefault();
          onShortcut({ type: 'next-week' });
          return;
        case 't':
        case 'T':
          e.preventDefault();
          onShortcut({ type: 'today' });
          return;
        case '1':
          e.preventDefault();
          onShortcut({ type: 'set-status', status: 'confirmed_advance' });
          return;
        case '2':
          e.preventDefault();
          onShortcut({ type: 'set-status', status: 'completed' });
          return;
        case '3':
          e.preventDefault();
          onShortcut({ type: 'set-status', status: 'no_show' });
          return;
        case '4':
          e.preventDefault();
          onShortcut({ type: 'set-status', status: 'cancelled' });
          return;
        case 'Escape':
          onShortcut({ type: 'escape' });
          return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onShortcut, enabled]);
}
