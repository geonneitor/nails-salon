-- ============================================================
-- Migration: 20260608020000_storage_buckets.sql
-- Description: Creates the customer-gallery bucket and configures RLS.
-- Idempotente: usa DROP IF EXISTS antes de cada CREATE POLICY.
-- ============================================================

-- Crear el bucket si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('customer-gallery', 'customer-gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Limpiar policies existentes antes de recrear (evita el error 42710)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;

-- 1. Lectura pública
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'customer-gallery');

-- 2. Inserción para usuarios autenticados
CREATE POLICY "Auth Insert" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'customer-gallery');

-- 3. Actualización para usuarios autenticados
CREATE POLICY "Auth Update" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'customer-gallery');

-- 4. Borrado para usuarios autenticados
CREATE POLICY "Auth Delete" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'customer-gallery');
