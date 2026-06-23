// ============================================================
// src/lib/notifications/useNotificationBell.ts
//
// Hook que centraliza el ciclo de vida de la campanita de notificaciones:
//
//   1. Lee el proyecto activo del contexto de la app.
//   2. Lee el usuario autenticado (para registrar suscripciones push).
//   3. Mantiene un contador `pendingCount` que el FAB de Lotito
//      consume para mostrar el badge rojo con número.
//   4. Se suscribe al bus bellEvents y, ante cada evento:
//        - Incrementa pendingCount.
//        - Si la pestaña está oculta y el permiso está concedido,
//          dispara una Notification nativa con título + cuerpo.
//   5. Ofrece `requestPermission()` para que la UI lo invoque.
//   6. Ofrece `clearNotifications()` para resetear el contador al
//      abrir Lotito (decisión: NO persistente entre recargas).
//
// Decisiones:
//   * El contador es volátil (se reinicia al refrescar).
//   * NO se dispara notificación local cuando la pestaña está visible
//     (sería ruidoso); el badge in-app cubre ese caso.
//   * El hook NO instala el SW — eso lo hace `registerServiceWorker`
//     una sola vez en el layout.
// ============================================================

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { bellEvents, type BellEvent } from './bellEvents';
import {
  getPermissionState,
  requestPermission,
  showLocalNotification,
} from './pushService';

interface UseNotificationBellReturn {
  /** Cantidad de notificaciones no leídas (badge del FAB). */
  pendingCount: number;
  /** Estado del permiso del navegador. */
  permission: ReturnType<typeof getPermissionState>;
  /** Última notificación recibida (útil para tooltip). */
  lastEvent: BellEvent | null;
  /** Pide permiso al usuario. Idempotente. */
  requestPermission: () => Promise<void>;
  /** Resetea el contador (al abrir Lotito). */
  clearNotifications: () => void;
  /** Sube/baja el contador manualmente (para testing). */
  bump: (n?: number) => void;
}

export function useNotificationBell(): UseNotificationBellReturn {
  const { user, activeProject } = useApp();
  const [pendingCount, setPendingCount] = useState(0);
  const [permission, setPermission] = useState<ReturnType<typeof getPermissionState>>('default');
  const [lastEvent, setLastEvent] = useState<BellEvent | null>(null);

  // Ref para el último event.id procesado: evita doble conteo cuando
  // el listener se monta dos veces en StrictMode.
  const seenIdsRef = useRef<Set<string>>(new Set());

  // -----------------------------------------------------------
  // Inicializar permission state
  // -----------------------------------------------------------
  useEffect(() => {
    setPermission(getPermissionState());
  }, []);

  // -----------------------------------------------------------
  // Suscripción al bus de eventos
  // -----------------------------------------------------------
  useEffect(() => {
    const unsubscribe = bellEvents.subscribe((event) => {
      // Dedup por timestamp (1s de tolerancia): si llega el mismo evento
      // dos veces seguidas (Strict Mode, re-render), solo contamos una.
      const dedupeKey = `${event.type}-${Math.floor(event.at / 1000)}`;
      if (seenIdsRef.current.has(dedupeKey)) return;
      seenIdsRef.current.add(dedupeKey);
      // Limpiar entradas viejas después de 10s para no acumular memoria.
      setTimeout(() => seenIdsRef.current.delete(dedupeKey), 10_000);

      setPendingCount((c) => c + 1);
      setLastEvent(event);

      // Notificación nativa si hay permiso concedido.
      if (
        typeof document !== 'undefined' &&
        Notification.permission === 'granted'
      ) {
        const title = event.payload?.title ?? defaultTitleFor(event.type);
        const body =
          event.payload?.body ??
          event.payload?.customerName ??
          defaultBodyFor(event);
        showLocalNotification(title, {
          body,
          tag: `zen-${event.type}`,
        });
      }
    });

    return unsubscribe;
  }, []);

  // -----------------------------------------------------------
  // Pedir permiso al usuario
  // -----------------------------------------------------------
  const requestPermissionAndUpdate = useCallback(async () => {
    const next = await requestPermission();
    setPermission(next);
  }, []);

  const clearNotifications = useCallback(() => {
    setPendingCount(0);
  }, []);

  const bump = useCallback((n = 1) => {
    setPendingCount((c) => c + n);
  }, []);

  return {
    pendingCount,
    permission,
    lastEvent,
    requestPermission: requestPermissionAndUpdate,
    clearNotifications,
    bump,
  };
}

// -----------------------------------------------------------
// Helpers para títulos/bodies default por tipo de evento
// -----------------------------------------------------------

function defaultTitleFor(type: BellEvent['type']): string {
  switch (type) {
    case 'new_appointment':
      return 'Nueva cita agendada';
    case 'reminder_sent':
      return 'Recordatorio listo para enviar';
    case 'dashboard_alert':
      return 'Alerta del dashboard';
    case 'lotito_reply':
      return 'Lotito respondió';
    default:
      return 'Zen Nails';
  }
}

function defaultBodyFor(event: BellEvent): string {
  if (event.payload?.customerName) {
    return `${event.payload.customerName} — revisa los detalles.`;
  }
  switch (event.type) {
    case 'new_appointment':
      return 'Tienes una nueva cita en tu agenda.';
    case 'reminder_sent':
      return 'Un recordatorio está listo para enviar al cliente.';
    case 'dashboard_alert':
      return 'Hay nuevas alertas en tu dashboard.';
    case 'lotito_reply':
      return 'Lotito tiene una respuesta para ti.';
    default:
      return '';
  }
}
