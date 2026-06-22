// ============================================================
// src/lib/notifications/bellEvents.ts
//
// Emitter singleton para eventos de notificación.
//
// Diseño:
//   * No reactivo: es un bus plano al que cualquier módulo puede
//     suscribirse y emitir. La capa de UI (useNotificationBell)
//     lo envuelve en useState/useEffect para re-renderizar.
//   * Volátil: NO persiste entre recargas (decisión confirmada con
//     el usuario: "no, solo mientras la pestaña está abierta").
//   * Tipos cerrados: las claves del map permiten autocompletar y
//     hacen imposible pasar un evento con tipo inválido.
//
// Uso:
//   bellEvents.emit({ type: 'new_appointment', payload: { customerName } });
//   bellEvents.subscribe((evt) => { ... });
// ============================================================

export type BellEventType =
  | 'new_appointment'
  | 'reminder_sent'
  | 'dashboard_alert'
  | 'lotito_reply';

export interface BellEvent {
  type: BellEventType;
  /** Timestamp del evento (cliente, no servidor). */
  at: number;
  /** Datos específicos del evento. */
  payload?: {
    title?: string;
    body?: string;
    customerName?: string;
    appointmentId?: string;
    reminderId?: string;
    url?: string;
  };
}

type Listener = (event: BellEvent) => void;

class BellEventEmitter {
  private listeners: Set<Listener> = new Set();

  /** Registra un listener y devuelve una función para des-suscribirse. */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Emite un evento a todos los listeners suscritos. */
  emit(event: Omit<BellEvent, 'at'>): void {
    const fullEvent: BellEvent = { ...event, at: Date.now() };
    this.listeners.forEach((listener) => {
      try {
        listener(fullEvent);
      } catch (err) {
        console.warn('[bellEvents] listener threw:', err);
      }
    });
  }

  /** Cantidad de listeners activos (útil para debug). */
  get size(): number {
    return this.listeners.size;
  }
}

/**
 * Singleton: una sola instancia para toda la app. Importar este símbolo
 * desde cualquier módulo y emitir/escuchar.
 */
export const bellEvents = new BellEventEmitter();
