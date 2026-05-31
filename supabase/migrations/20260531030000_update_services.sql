-- ============================================================
-- supabase/migrations/20260531030000_update_services.sql
-- Modificaciones para admitir cotizaciones a la carta en citas
-- ============================================================

-- 1. Hacer service_id opcional (nullable) para permitir combinaciones libres
ALTER TABLE public.appointments ALTER COLUMN service_id DROP NOT NULL;

-- 2. Añadir columnas para el desglose del ticket, precio final y duración total
ALTER TABLE public.appointments ADD COLUMN ticket_details JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.appointments ADD COLUMN total_price DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE public.appointments ADD COLUMN total_duration INT DEFAULT 0;
