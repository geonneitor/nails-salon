// ============================================================
// NotificationOptIn.tsx
//
// Banner sutil que invita al usuario a activar notificaciones nativas
// del navegador. Aparece una sola vez (la primera vez que el usuario
// entra a la app y aún no ha decidido).
//
// Comportamiento:
//   * Si Notification.permission === 'default' y nunca se le preguntó
//     en esta sesión: mostrar.
//   * Si 'granted' o 'denied': ocultar.
//   * Si el usuario hace click en "Activar": pedir permiso. Si lo
//     concede, suscribir push con VAPID (best-effort).
//   * Si hace click en "Más tarde": cerrar y recordar por 7 días
//     (localStorage) antes de volver a molestar.
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useNotificationBell } from '@/lib/notifications/useNotificationBell';
import { enablePushNotifications, registerServiceWorker } from '@/lib/notifications/registerServiceWorker';

const DISMISS_KEY = 'zen.notifOptIn.dismissedAt';
const DISMISS_DAYS = 7;

export function NotificationOptIn() {
  const { user, activeProject } = useApp();
  const { permission, requestPermission } = useNotificationBell();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // SSR guard: solo decidimos visibilidad en cliente.
    if (typeof window === 'undefined') return;
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'default') return;

    // ¿El usuario ya descartó este banner hace poco?
    try {
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      if (dismissedAt) {
        const ageMs = Date.now() - Number(dismissedAt);
        if (ageMs < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
      }
    } catch {
      /* localStorage puede estar bloqueado: ignorar */
    }

    // Mostrar tras 5s para no interrumpir la entrada a la app.
    const t = setTimeout(() => setVisible(true), 5_000);
    return () => clearTimeout(t);
  }, [permission]);

  const handleAccept = async () => {
    await requestPermission();
    // Si concedió, intentar suscribir push (best-effort).
    if (
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted' &&
      user &&
      activeProject
    ) {
      await registerServiceWorker();
      await enablePushNotifications({ userId: user.id, projectId: activeProject.id });
    }
    setVisible(false);
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignorar */
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-40 max-w-md w-[calc(100vw-2rem)]"
          role="dialog"
          aria-label="Activar notificaciones"
        >
          <div className="bg-surface-container-lowest border border-primary/30 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-4 flex items-start gap-3 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-full bg-accent-gold-primary/15 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-accent-gold-primary" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                ¿Activar notificaciones?
                <Sparkles className="w-3 h-3 text-accent-gold-primary" />
              </p>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Te avisaremos al instante cuando llegue una nueva cita o un recordatorio esté listo, incluso con la app cerrada.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleAccept}
                  className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Activar
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 text-on-surface-variant hover:text-on-surface rounded-lg text-xs font-medium hover:bg-surface-container transition-colors"
                >
                  Más tarde
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors shrink-0"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
