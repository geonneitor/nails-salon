-- =====================================================================
-- MIGRACIÓN: Fix Bug #1, #2, #3 - Flujo de Reserva Pública (/reservas)
-- Fecha: 2026-06-15
-- =====================================================================

-- =====================================================================
-- BUG #1: La RPC get_or_create_customer falla con rol 'anon'
-- Causa: La función hace un SELECT en customers antes del INSERT,
--        pero anon solo tiene política INSERT (no SELECT) en customers.
-- Fix:   Recrear la función con SECURITY DEFINER para que opere con
--        los privilegios del owner (postgres) y no del caller (anon).
--        Adicionalmente, asegurar que la función existe correctamente.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.get_or_create_customer(
  p_project_id UUID,
  p_name       TEXT,
  p_email      TEXT DEFAULT NULL,
  p_phone      TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER  -- <-- Opera con privilegios del owner, bypassea RLS para esta función
SET search_path = public
AS $$
DECLARE
  v_customer_id UUID;
BEGIN
  -- 1. Buscar cliente existente por teléfono (prioritario) o email
  IF p_phone IS NOT NULL THEN
    SELECT id INTO v_customer_id
    FROM public.customers
    WHERE project_id = p_project_id
      AND phone = p_phone
    LIMIT 1;
  END IF;

  IF v_customer_id IS NULL AND p_email IS NOT NULL THEN
    SELECT id INTO v_customer_id
    FROM public.customers
    WHERE project_id = p_project_id
      AND email = p_email
    LIMIT 1;
  END IF;

  -- 2. Si no existe, crearlo
  IF v_customer_id IS NULL THEN
    INSERT INTO public.customers (project_id, name, email, phone)
    VALUES (p_project_id, p_name, p_email, p_phone)
    RETURNING id INTO v_customer_id;
  ELSE
    -- 3. Si existe, actualizar nombre si cambió
    UPDATE public.customers
    SET name = p_name
    WHERE id = v_customer_id
      AND name <> p_name;
  END IF;

  RETURN v_customer_id;
END;
$$;

-- Dar permiso de ejecución al rol anon (necesario para llamadas sin auth)
GRANT EXECUTE ON FUNCTION public.get_or_create_customer(UUID, TEXT, TEXT, TEXT) TO anon;

-- =====================================================================
-- BUG #2: El GIST constraint no_overlapping_employee_appointments
--         incluye citas con status='cancelled', bloqueando slots liberados.
-- Fix:   Recrear el constraint usando una PARTIAL UNIQUE / partial index
--        que excluya citas canceladas. En PostgreSQL, los EXCLUDE constraints
--        no soportan WHERE directamente, por lo que usamos un índice parcial GIST.
-- =====================================================================

-- Paso 1: Eliminar el constraint actual (bloquea todo, incluyendo canceladas)
ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS no_overlapping_employee_appointments;

-- Paso 2: Recrear como EXCLUSION constraint con predicado WHERE.
-- Los EXCLUSION constraints sí soportan WHERE; los UNIQUE INDEX GIST no.
-- Solo aplica la exclusión a citas activas (excluye cancelled y no_show).
ALTER TABLE public.appointments
  ADD CONSTRAINT no_overlapping_employee_appointments
  EXCLUDE USING gist (
    employee_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  )
  WHERE (status NOT IN ('cancelled', 'no_show'));

-- =====================================================================
-- BUG #3: El trigger check_appointment_block_overlap tampoco filtra
--         citas canceladas al validar contra time_blocks.
-- Fix:   Agregar filtro de status en la función del trigger.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.check_appointment_block_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo validar si la cita no está cancelada o no_show
  IF NEW.status IN ('cancelled', 'no_show') THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.time_blocks
    WHERE employee_id = NEW.employee_id
      AND tstzrange(start_time, end_time) && tstzrange(NEW.start_time, NEW.end_time)
  ) THEN
    RAISE EXCEPTION 'El horario de la cita entra en conflicto con un bloqueo de horario de la empleada.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- También corregir el trigger inverso (time_blocks vs appointments activas)
CREATE OR REPLACE FUNCTION public.check_block_appointment_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.appointments
    WHERE employee_id = NEW.employee_id
      AND status NOT IN ('cancelled', 'no_show')
      AND tstzrange(start_time, end_time) && tstzrange(NEW.start_time, NEW.end_time)
  ) THEN
    RAISE EXCEPTION 'El bloqueo de horario entra en conflicto con una cita existente de la empleada.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
