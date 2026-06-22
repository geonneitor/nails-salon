-- =====================================================================
-- MIGRACIÓN: Notification Preferences por usuario/proyecto
-- Fecha: 2026-06-21
-- =====================================================================
--
-- Switches que controlan QUÉ dispara una notificación para un usuario
-- dentro de un proyecto. Mantener separado del global `enable_*` permite
-- por ejemplo: activar recordatorios pero silenciar respuestas de Lotito.
--
-- Defaults:
--   * Notificaciones del navegador y push: opt-in (false). El usuario
--     debe aceptar explícitamente desde el banner opt-in.
--   * Eventos individuales: opt-out para cosas ruidosas (alerts,
--     lotito replies) y opt-in para las críticas (nuevas citas,
--     recordatorios enviados).
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.notification_prefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

    -- Canales
    enable_browser_notifications BOOLEAN NOT NULL DEFAULT false,
    enable_push_notifications    BOOLEAN NOT NULL DEFAULT false,

    -- Eventos
    notify_new_appointment  BOOLEAN NOT NULL DEFAULT true,
    notify_reminder_sent    BOOLEAN NOT NULL DEFAULT true,
    notify_dashboard_alerts BOOLEAN NOT NULL DEFAULT false,
    notify_lotito_replies   BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT notification_prefs_unique UNIQUE (user_id, project_id)
);

ALTER TABLE public.notification_prefs ENABLE ROW LEVEL SECURITY;

-- Cada usuario solo puede gestionar SUS propias preferencias.
DROP POLICY IF EXISTS "Users manage their own notification prefs" ON public.notification_prefs;
CREATE POLICY "Users manage their own notification prefs"
ON public.notification_prefs FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger: actualizar updated_at en cada UPDATE.
CREATE OR REPLACE FUNCTION public.touch_notification_prefs()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_notification_prefs ON public.notification_prefs;
CREATE TRIGGER trg_touch_notification_prefs
BEFORE UPDATE ON public.notification_prefs
FOR EACH ROW EXECUTE FUNCTION public.touch_notification_prefs();
