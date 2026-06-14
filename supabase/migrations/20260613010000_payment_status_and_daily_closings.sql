-- =====================================================================
-- MIGRACIÓN: payment_status + daily_closings
-- Fecha: 2026-06-13
--
-- D2 — Separa "pago" de "confirmación" en las citas.
--   * status  = flujo de la cita (pending_advance | confirmed_advance |
--               completed | cancelled | no_show | free)
--   * payment_status = dinero (unpaid | advance | paid)
--
-- D3 — Tabla `daily_closings` para el snapshot de fin de día.
-- =====================================================================

-- 1. PAYMENT_STATUS
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS payment_status TEXT
  NOT NULL DEFAULT 'unpaid'
  CHECK (payment_status IN ('unpaid', 'advance', 'paid'));

-- Backfill conservador: las citas ya marcadas como 'completed' se
-- consideran cobradas, las 'confirmed_advance'/'pending_advance'
-- como anticipo (si tienen total_price > 0) o sin pago, y el resto
-- como unpaid. Ajustable manualmente.
UPDATE public.appointments
SET payment_status = CASE
  WHEN status::text = 'completed'  THEN 'paid'
  WHEN status IN ('confirmed_advance', 'pending_advance') AND total_price > 0 THEN 'advance'
  WHEN status = 'free'             THEN 'paid'
  ELSE 'unpaid'
END
WHERE payment_status = 'unpaid';

CREATE INDEX IF NOT EXISTS idx_appointments_payment
  ON public.appointments (project_id, payment_status, start_time);

-- 2. DAILY_CLOSINGS
CREATE TABLE IF NOT EXISTS public.daily_closings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    -- Día cerrado (truncado a fecha local MX, almacenado en UTC para
    -- que un cierre del "13 de junio" sea siempre el mismo row sin
    -- importar la zona horaria del servidor).
    closing_date DATE NOT NULL,
    -- Conteos agregados (denormalizados para lectura rápida).
    total_collected NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_pending   NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_expected  NUMERIC(10, 2) NOT NULL DEFAULT 0,
    appointment_count INTEGER NOT NULL DEFAULT 0,
    -- IDs de las citas incluidas en el cierre (snapshot).
    appointment_ids UUID[] NOT NULL DEFAULT '{}',
    -- Metadata libre: notas del admin, métodos de pago, etc.
    notes TEXT,
    closed_by UUID, -- refs auth.users(id)
    closed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Una sola fila por (project_id, closing_date).
    UNIQUE (project_id, closing_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_closings_project_date
  ON public.daily_closings (project_id, closing_date DESC);

ALTER TABLE public.daily_closings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access on daily_closings" ON public.daily_closings;
CREATE POLICY "Admins have full access on daily_closings"
ON public.daily_closings FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Employees can view daily_closings" ON public.daily_closings;
CREATE POLICY "Employees can view daily_closings"
ON public.daily_closings FOR SELECT TO authenticated
USING (true);
