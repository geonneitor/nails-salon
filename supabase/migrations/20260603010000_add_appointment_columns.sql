-- =====================================================================
-- MIGRACIÓN: Agregar columnas faltantes a la tabla appointments
-- Fecha: 2026-06-03
-- Problema: Las columnas ticket_details, total_price y total_duration
--           son referenciadas en el código TypeScript y en el seed,
--           pero nunca fueron creadas en el schema inicial.
--           Esto causa que todos los INSERT de citas fallen con error
--           de columna desconocida.
-- =====================================================================

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS ticket_details  JSONB            DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS total_price     DECIMAL(10, 2)   NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_duration  INT              NOT NULL DEFAULT 0;
