-- =====================================================================
-- MIGRACIÓN: Push Subscriptions (Web Push API)
-- Fecha: 2026-06-21
-- =====================================================================
--
-- Cada fila representa una suscripción push de un dispositivo/navegador
-- concreto para un usuario dentro de un proyecto. El cliente la crea al
-- aceptar el permiso de notificaciones; el backend la consulta desde
-- /api/push/send para entregar push real (aparece en la barra del celular
-- aunque la app esté cerrada).
--
-- `endpoint` es único por suscripción: lo usamos para upsert y limpieza.
-- Si el provider devuelve 404/410 (suscripción inválida), el backend borra
-- la fila automáticamente.
--
-- Seguridad:
--   * RLS activado.
--   * El usuario solo puede gestionar SUS propias suscripciones.
--   * El backend usa supabaseAdmin (service_role) para envíos masivos,
--     bypaseando RLS — ese rol no debe filtrarse al cliente.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

    -- Identificador único del provider (PushSubscription.endpoint).
    endpoint TEXT NOT NULL,

    -- Llaves de la suscripción (PushSubscription.getKey('p256dh') / 'auth') en base64.
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,

    -- Metadatos opcionales para depuración y agrupamiento.
    user_agent TEXT,
    device_label TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT push_subscriptions_endpoint_unique UNIQUE (endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user
  ON public.push_subscriptions (user_id, project_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Cada usuario puede insertar y leer solo SUS propias suscripciones.
DROP POLICY IF EXISTS "Users manage their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users manage their own push subscriptions"
ON public.push_subscriptions FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger: actualizar last_seen_at cuando se hace upsert.
CREATE OR REPLACE FUNCTION public.touch_push_subscription()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_seen_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_push_subscription ON public.push_subscriptions;
CREATE TRIGGER trg_touch_push_subscription
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.touch_push_subscription();
