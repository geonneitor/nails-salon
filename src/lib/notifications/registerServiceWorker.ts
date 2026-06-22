// ============================================================
// src/lib/notifications/registerServiceWorker.ts
//
// Encapsula el registro del Service Worker y (opcionalmente) la
// suscripción push con VAPID. Pensado para llamarse UNA SOLA VEZ
// desde un componente de cliente montado en el root layout.
//
// Diseño:
//   * Idempotente: si el SW ya está registrado, no falla.
//   * Tolerante: si el navegador no soporta SW o PushManager, no
//     rompe la app — solo loguea.
//   * Solo suscribe push si el usuario explícitamente lo aceptó
//     (decisión de producto: opt-in, no opt-out).
// ============================================================

import { getPermissionState, subscribeToPush } from './pushService';

let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

/**
 * Registra el SW (/sw.js) si el navegador lo soporta. Devuelve la
 * promesa de registration (cacheada) o null si no hay soporte.
 */
export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (!('serviceWorker' in navigator)) return Promise.resolve(null);
  if (registrationPromise) return registrationPromise;

  registrationPromise = navigator.serviceWorker
    .register('/sw.js', { scope: '/' })
    .then((reg) => {
      // Forzar update check para que el SW nuevo reemplace al viejo rápido.
      reg.update().catch(() => {
        /* silencioso: update() puede fallar por red */
      });
      return reg;
    })
    .catch((err) => {
      console.warn('[registerSW] registration failed:', err);
      return null;
    });

  return registrationPromise;
}

/**
 * Suscribe el SW a push con VAPID public key + persiste la suscripción
 * en Supabase vía /api/push/subscribe.
 *
 * Solo llamar si el usuario aceptó explícitamente el permiso.
 */
export async function enablePushNotifications(opts: {
  userId: string;
  projectId: string;
}): Promise<void> {
  const permission = getPermissionState();
  if (permission !== 'granted') {
    console.info('[registerSW] permission no concedida; no se suscribe a push.');
    return;
  }

  // Asegurar SW listo.
  await registerServiceWorker();

  // Suscribir.
  await subscribeToPush(opts);
}
