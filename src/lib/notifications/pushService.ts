// ============================================================
// src/lib/notifications/pushService.ts
//
// Wrapper sobre la Web Push API del navegador. Encapsula:
//   * Chequeo de soporte (algunos navegadores no tienen PushManager).
//   * Pedir permiso al usuario (Notification.requestPermission).
//   * Suscribir la pestaña a push con VAPID public key.
//   * Reenviar la suscripción al backend (/api/push/subscribe).
//   * Des-suscriberse (limpia SW + backend).
//
// Esta capa NO decide CUÁNDO notificar — eso es responsabilidad del
// hook useNotificationBell y de los emisores de eventos.
// ============================================================

export type PermissionState = NotificationPermission | 'unsupported';

/** Estado actual del permiso (cacheado en memoria, no persistente). */
export function getPermissionState(): PermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/** Pide permiso al SO. Resuelve a 'denied' si el usuario rechaza o no hay soporte. */
export async function requestPermission(): Promise<PermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';

  try {
    const result = await Notification.requestPermission();
    return result;
  } catch (err) {
    console.warn('[pushService] requestPermission failed:', err);
    return 'denied';
  }
}

/**
 * Devuelve la suscripción push actual, o null si no existe o no hay soporte.
 * Espera a que el SW esté listo antes de consultar.
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (typeof window === 'undefined') return null;
  if (!('serviceWorker' in navigator)) return null;
  if (!('PushManager' in window)) return null;

  try {
    const reg = await navigator.serviceWorker.ready;
    return (await reg.pushManager.getSubscription()) ?? null;
  } catch (err) {
    console.warn('[pushService] getCurrentSubscription failed:', err);
    return null;
  }
}

/**
 * Suscribe el SW actual a push usando la VAPID public key.
 * Si ya hay suscripción, la reutiliza. Si la API no está disponible
 * o el usuario rechaza el permiso, devuelve null.
 *
 * Después de suscribir, envía la suscripción al backend para que
 * /api/push/send la pueda encontrar más tarde.
 */
export async function subscribeToPush(opts: {
  userId: string;
  projectId: string;
}): Promise<PushSubscription | null> {
  const { userId, projectId } = opts;
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!vapidKey) {
    console.warn('[pushService] NEXT_PUBLIC_VAPID_PUBLIC_KEY no está definida. Saltando suscripción.');
    return null;
  }

  if (typeof window === 'undefined') return null;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.info('[pushService] Push API no soportada en este navegador.');
    return null;
  }

  // Asegurar que el SW está registrado y listo.
  let registration: ServiceWorkerRegistration;
  try {
    registration = await navigator.serviceWorker.ready;
  } catch (err) {
    console.warn('[pushService] SW no listo:', err);
    return null;
  }

  // Reusar suscripción existente si ya hay una.
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    try {
      const convertedKey = urlBase64ToUint8Array(vapidKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as any,
      });
    } catch (err) {
      console.warn('[pushService] subscribe() falló:', err);
      return null;
    }
  }

  // Reenviar al backend para persistencia.
  try {
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userId,
        projectId,
        userAgent: navigator.userAgent,
      }),
    });
  } catch (err) {
    console.warn('[pushService] No se pudo registrar la suscripción en el backend:', err);
    // Aún así devolvemos la suscripción — puede funcionar si el backend
    // la recibe por otro canal.
  }

  return subscription;
}

/** Cancela la suscripción push y la elimina del backend. */
export async function unsubscribeFromPush(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
  } catch (err) {
    console.warn('[pushService] unsubscribeFromPush failed:', err);
  }
}

/**
 * Muestra una notificación nativa directamente (sin pasar por el SW).
 * Útil cuando el SW aún no está listo o cuando queremos un fallback.
 * En la práctica, esta función casi no se usa porque el SW se encarga
 * de los pushes remotos; aquí solo la usamos para "local notifications"
 * disparadas por el propio navegador mientras la pestaña está abierta.
 */
export function showLocalNotification(title: string, options?: NotificationOptions & { tag?: string }): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    new Notification(title, {
      icon: '/icon.png',
      badge: '/icon-badge.png',
      ...options,
    });
  } catch (err) {
    console.warn('[pushService] showLocalNotification failed:', err);
  }
}

// -----------------------------------------------------------
// Helpers
// -----------------------------------------------------------

/**
 * Convierte una clave VAPID en base64-url a Uint8Array, que es lo
 * que la Web Push API espera para applicationServerKey.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
