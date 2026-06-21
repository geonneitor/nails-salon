'use client';

import { useEffect, useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';

export type CalendarViewMode = 'day' | 'week' | 'month';

const STORAGE_KEY_VIEW = 'zen-cal-view';
const STORAGE_KEY_ZOOM = 'zen-cal-zoom';

/** Zoom vertical: altura en píxeles de cada hora. */
export const ZOOM_LEVELS = {
  compact: 60,
  comfortable: 100,
  airy: 140,
} as const;

export type ZoomLevel = keyof typeof ZOOM_LEVELS;
const DEFAULT_ZOOM: ZoomLevel = 'comfortable';
const DEFAULT_VIEW: CalendarViewMode = 'day';

/** Hook seguro para leer localStorage (SSR-safe). */
function readStored<T extends string>(key: string, fallback: T, allowed: readonly T[]): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = window.localStorage.getItem(key);
    if (value && (allowed as readonly string[]).includes(value)) {
      return value as T;
    }
  } catch {
    // localStorage puede estar bloqueado (modo privado, etc.)
  }
  return fallback;
}
function persist<T extends string>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignorar: en modo lectura o sin cuota
  }
}

interface UseCalendarViewReturn {
  view: CalendarViewMode;
  setView: (v: CalendarViewMode) => void;
  zoom: ZoomLevel;
  setZoom: (z: ZoomLevel) => void;
  /** Altura en px por hora, derivada del zoom actual. */
  hourHeight: number;
  /** Hora actual (HH:MM) que se refresca cada 60 segundos. */
  currentTime: Date;
}

/**
 * Hook de estado del calendario: vista activa, zoom vertical y hora actual.
 * Persiste vista y zoom en `localStorage`. La hora actual se actualiza
 * con `setInterval(60s)` y se limpia al desmontar.
 */
export function useCalendarView(): UseCalendarViewReturn {
  const { preferences } = useApp();
  const [view, setViewState] = useState<CalendarViewMode>(DEFAULT_VIEW);
  const [zoom, setZoomState] = useState<ZoomLevel>(DEFAULT_ZOOM);
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  // Hidratar desde localStorage tras el mount (evita mismatch SSR).
  useEffect(() => {
    const storedView = readStored<CalendarViewMode>(STORAGE_KEY_VIEW, DEFAULT_VIEW, ['day', 'week', 'month']);
    const storedZoom = readStored<ZoomLevel>(STORAGE_KEY_ZOOM, DEFAULT_ZOOM, ['compact', 'comfortable', 'airy']);

    const targetView = preferences?.default_view ?? storedView;
    const targetZoom = (preferences?.density as ZoomLevel) ?? storedZoom;

    if (targetView !== DEFAULT_VIEW) {
      setViewState(targetView);
    }
    if (targetZoom !== DEFAULT_ZOOM) {
      setZoomState(targetZoom);
    }
  }, []); // Ejecutar SOLO una vez al montar el componente

  // Reloj: actualiza la hora actual cada 60s.
  useEffect(() => {
    const id = window.setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const setView = useCallback((v: CalendarViewMode) => {
    setViewState(v);
    persist(STORAGE_KEY_VIEW, v);
  }, []);

  const setZoom = useCallback((z: ZoomLevel) => {
    setZoomState(z);
    persist(STORAGE_KEY_ZOOM, z);
  }, []);

  return {
    view,
    setView,
    zoom,
    setZoom,
    hourHeight: ZOOM_LEVELS[zoom],
    currentTime,
  };
}
