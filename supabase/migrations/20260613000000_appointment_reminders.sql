-- =====================================================================
-- MIGRACIÓN: Recordatorios de Cita + Configuración de Notificaciones
-- Fecha: 2026-06-13
-- =====================================================================
--
-- Esta migración prepara la infraestructura para recordatorios automáticos.
-- Para esta primera entrega (D1 = opción c) NO se envía WhatsApp al
-- cliente automáticamente. En su lugar, el cron en /api/cron/reminders
-- dispara una "tarjeta de notificación" interna (un recordatorio en la
-- tabla) que el admin ve en su panel y desde la cual abre un `wa.me/`
-- pre-llenado. Cuando se cambie a un relay (D1=b), solo se sustituye el
-- handler de envío; el resto de la infraestructura permanece igual.
--
-- Diseño:
--  * `appointment_reminders` (1 fila por recordatorio agendado).
--  * `admin_notification_settings` (1 fila por proyecto) — número del
--    admin, horas preferidas, switches on/off.
--  * `notifications_outbox` — mensajes ya preparados/abiertos por el
--    admin (deep-link wa.me) que aún no se han "enviado" realmente.
--    Esto nos da historial y permite que el admin los reenvíe.

-- 1. APPOINTMENT_REMINDERS
CREATE TABLE IF NOT EXISTS public.appointment_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    -- Cuándo debe dispararse el recordatorio.
    send_at TIMESTAMPTZ NOT NULL,
    -- 'pending' = esperando que llegue send_at.
    -- 'sent'    = el admin ya vio la tarjeta (o el provider ya envió).
    -- 'cancelled' = el admin lo descartó o la cita se canceló.
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','cancelled','failed')),
    -- Canal: por ahora solo 'admin_card' (D1c) y 'whatsapp_customer' (futuro D1b).
    channel TEXT NOT NULL DEFAULT 'admin_card' CHECK (channel IN ('admin_card','whatsapp_customer','sms')),
    -- Snapshot del mensaje que se va a enviar (formateado al crear la fila).
    message_template TEXT,
    -- A quién se le envía — por ahora el admin. Guarda el número wa.me destino.
    recipient_phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_appt_reminders_pending
  ON public.appointment_reminders (send_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_appt_reminders_appt
  ON public.appointment_reminders (appointment_id);

CREATE INDEX IF NOT EXISTS idx_appt_reminders_project
  ON public.appointment_reminders (project_id, status);

ALTER TABLE public.appointment_reminders ENABLE ROW LEVEL SECURITY;

-- Admins: control total. Employees: lectura (para badges en el calendario).
DROP POLICY IF EXISTS "Admins have full access on appointment_reminders" ON public.appointment_reminders;
CREATE POLICY "Admins have full access on appointment_reminders"
ON public.appointment_reminders FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Employees can view appointment_reminders" ON public.appointment_reminders;
CREATE POLICY "Employees can view appointment_reminders"
ON public.appointment_reminders FOR SELECT TO authenticated
USING (true);

-- 2. ADMIN_NOTIFICATION_SETTINGS (1 fila por proyecto)
CREATE TABLE IF NOT EXISTS public.admin_notification_settings (
    project_id UUID PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
    -- Número del admin con prefijo internacional (52 para MX) y sin '+'.
    admin_whatsapp TEXT,
    -- ¿Está activo el sistema de recordatorios?
    reminders_enabled BOOLEAN NOT NULL DEFAULT true,
    -- ¿Cuántas horas antes del appointment se dispara?
    hours_before INTEGER NOT NULL DEFAULT 24 CHECK (hours_before >= 1 AND hours_before <= 168),
    -- ¿A qué hora del día se permite enviar (evita 3am)?
    send_window_start TIME NOT NULL DEFAULT '08:00:00',
    send_window_end   TIME NOT NULL DEFAULT '21:00:00',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_notification_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage notification settings" ON public.admin_notification_settings;
CREATE POLICY "Admins manage notification settings"
ON public.admin_notification_settings FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 3. NOTIFICATIONS_OUTBOX — log de mensajes generados (auditoría + reenvío)
CREATE TABLE IF NOT EXISTS public.notifications_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    reminder_id UUID REFERENCES public.appointment_reminders(id) ON DELETE SET NULL,
    -- 'admin_card' = el admin abrió la tarjeta con el deep link
    -- 'sent'       = provider lo entregó
    -- 'opened'     = el admin hizo click en el wa.me (deep link)
    kind TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_outbox_project
  ON public.notifications_outbox (project_id, created_at DESC);

ALTER TABLE public.notifications_outbox ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access on notifications_outbox" ON public.notifications_outbox;
CREATE POLICY "Admins have full access on notifications_outbox"
ON public.notifications_outbox FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. TRIGGER: cuando se crea una cita con start_time futuro, agendar el recordatorio.
-- Esto evita que el código de cliente tenga que recordar enqueue el recordatorio.
CREATE OR REPLACE FUNCTION public.enqueue_appointment_reminder()
RETURNS TRIGGER AS $$
DECLARE
    settings_row public.admin_notification_settings%ROWTYPE;
    reminder_send_at TIMESTAMPTZ;
    customer_name TEXT;
    customer_phone TEXT;
    employee_name TEXT;
    service_label TEXT;
    message TEXT;
BEGIN
    -- Si la cita ya pasó, no agendamos nada.
    IF NEW.start_time <= NOW() THEN
        RETURN NEW;
    END IF;

    -- Leer settings del proyecto (si no hay, usar defaults).
    SELECT * INTO settings_row
    FROM public.admin_notification_settings
    WHERE project_id = NEW.project_id;

    IF settings_row.reminders_enabled IS NOT DISTINCT FROM FALSE THEN
        RETURN NEW;
    END IF;

    IF settings_row.project_id IS NULL THEN
        settings_row.hours_before := 24;
        settings_row.send_window_start := '08:00:00'::TIME;
        settings_row.send_window_end := '21:00:00'::TIME;
    END IF;

    -- Calcular send_at = start_time - hours_before
    reminder_send_at := NEW.start_time - (settings_row.hours_before || ' hours')::INTERVAL;

    -- Si el send_at cae fuera de la ventana (ej. cita a las 6am, recordatorio
    -- a las 6am-24h = 6am del día anterior = todavía dentro), lo dejamos.
    -- Para mantenerlo simple, NO ajustamos por ventana — eso es responsabilidad
    -- del cron, que decide si "ahora" cae dentro de la ventana antes de marcar
    -- como 'sent'.

    -- Construir mensaje humano (es-ES, mismas plantillas que whatsapp.ts).
    SELECT name, phone INTO customer_name, customer_phone
    FROM public.customers WHERE id = NEW.customer_id;

    SELECT name INTO employee_name
    FROM public.employees WHERE id = NEW.employee_id;

    message := format(
        '🌿 *Recordatorio de Cita — %s*
Hola, %s. Te recordamos tu cita el *%s* a las *%s* con *%s*.

Servicio: %s
Total: $%s MXN

Si necesitas reprogramar, responde a este mensaje.
¡Te esperamos!',
        COALESCE((SELECT name FROM public.projects WHERE id = NEW.project_id), 'Zen'),
        COALESCE(customer_name, 'estimada clienta'),
        to_char(NEW.start_time AT TIME ZONE 'America/Mexico_City', 'DD "de" FMMonth'),
        to_char(NEW.start_time AT TIME ZONE 'America/Mexico_City', 'HH12:MI AM'),
        COALESCE(employee_name, 'nuestra especialista'),
        COALESCE(NEW.ticket_details->>'displayLabel', 'tu servicio'),
        COALESCE(NEW.total_price::TEXT, '0')
    );

    INSERT INTO public.appointment_reminders (
        project_id,
        appointment_id,
        send_at,
        status,
        channel,
        message_template,
        recipient_phone
    ) VALUES (
        NEW.project_id,
        NEW.id,
        reminder_send_at,
        'pending',
        'admin_card',
        message,
        COALESCE(settings_row.admin_whatsapp, customer_phone)
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enqueue_appointment_reminder ON public.appointments;
CREATE TRIGGER trg_enqueue_appointment_reminder
AFTER INSERT ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_appointment_reminder();

-- 5. NOTA: Las políticas existentes ya cubren Supabase Realtime en `appointments`
-- (ver 20260608000000_fase2_operations.sql). Si más adelante queremos
-- subscriptions a `appointment_reminders`, basta con añadir `postgres_changes`
-- en el cliente.
