-- =====================================================================
-- MIGRACIÓN: UNIQUE constraint en business_settings.project_id
-- Fecha: 2026-06-22
-- =====================================================================
--
-- Justificación:
--   El hook useBusinessSettings usa `.maybeSingle()` sobre project_id.
--   Sin esta constraint, es posible tener N filas por proyecto y la app
--   lee cualquiera (no determinista). Además, el upsert del formulario
--   de Settings (BusinessSettings.tsx) usa `onConflict: 'project_id'`,
--   que REQUIERE esta constraint — sin ella PostgREST devuelve 400.
--
-- Esta migración:
--   1. Desduplica filas existentes dejando la MÁS RECIENTE por proyecto
--      (criterio de desempate: created_at desc, fallback por ctid).
--   2. Crea la constraint UNIQUE.
--
-- Es segura de correr en cualquier momento (es idempotente para los
-- estados pre-existentes vía IF NOT EXISTS).
-- =====================================================================

-- 1) Deduplicar: dejar solo una fila por project_id (la más reciente).
WITH ranked AS (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY project_id
               ORDER BY created_at DESC NULLS LAST, ctid DESC
           ) AS rn
    FROM public.business_settings
)
DELETE FROM public.business_settings bs
USING ranked r
WHERE bs.id = r.id
  AND r.rn > 1;

-- 2) Añadir la constraint (idempotente).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'business_settings_project_id_unique'
          AND conrelid = 'public.business_settings'::regclass
    ) THEN
        ALTER TABLE public.business_settings
        ADD CONSTRAINT business_settings_project_id_unique UNIQUE (project_id);
    END IF;
END $$;