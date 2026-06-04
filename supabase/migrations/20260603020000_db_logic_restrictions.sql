-- =====================================================================
-- MIGRACIÓN: Restricciones de integridad y lógicas para citas, clientes y servicios
-- Fecha: 2026-06-03
-- =====================================================================

-- 1. Habilitar btree_gist para permitir exclusiones con tipos simples y rangos de tiempo
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. Restricción de exclusión en appointments para evitar traslapes de citas del mismo empleado
ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS no_overlapping_employee_appointments,
  ADD CONSTRAINT no_overlapping_employee_appointments
  EXCLUDE USING gist (
    employee_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  );

-- 3. Restricción de exclusión en time_blocks para evitar traslapes de bloqueos del mismo empleado
ALTER TABLE public.time_blocks
  DROP CONSTRAINT IF EXISTS no_overlapping_employee_time_blocks,
  ADD CONSTRAINT no_overlapping_employee_time_blocks
  EXCLUDE USING gist (
    employee_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  );

-- 4. Trigger en appointments para impedir cruces con time_blocks
CREATE OR REPLACE FUNCTION public.check_appointment_block_overlap()
RETURNS TRIGGER AS $$
BEGIN
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

CREATE OR REPLACE TRIGGER trg_check_appointment_block_overlap
  BEFORE INSERT OR UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.check_appointment_block_overlap();

-- 5. Trigger en time_blocks para impedir cruces con appointments
CREATE OR REPLACE FUNCTION public.check_block_appointment_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.appointments
    WHERE employee_id = NEW.employee_id
      AND tstzrange(start_time, end_time) && tstzrange(NEW.start_time, NEW.end_time)
  ) THEN
    RAISE EXCEPTION 'El bloqueo de horario entra en conflicto con una cita existente de la empleada.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_check_block_appointment_overlap
  BEFORE INSERT OR UPDATE ON public.time_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.check_block_appointment_overlap();

-- 6. Unicidad de clientes por teléfono dentro de un mismo proyecto (salón)
-- Primero eliminar duplicados: conservar el registro más antiguo (menor created_at)
DELETE FROM public.customers
WHERE id NOT IN (
  SELECT DISTINCT ON (project_id, phone) id
  FROM public.customers
  WHERE phone IS NOT NULL
  ORDER BY project_id, phone, created_at ASC
);

ALTER TABLE public.customers
  DROP CONSTRAINT IF EXISTS unique_customer_phone_per_project,
  ADD CONSTRAINT unique_customer_phone_per_project UNIQUE (project_id, phone);

-- 7. Unicidad de nombres de servicios dentro de un mismo proyecto (salón)
-- Primero eliminar duplicados: conservar el registro más antiguo (menor created_at)
DELETE FROM public.services
WHERE id NOT IN (
  SELECT DISTINCT ON (project_id, name) 
  FROM public.services
  ORDER BY project_id, name, created_at ASC
);

ALTER TABLE public.services
  DROP CONSTRAINT IF EXISTS unique_service_name_per_project,
  ADD CONSTRAINT unique_service_name_per_project UNIQUE (project_id, name);

