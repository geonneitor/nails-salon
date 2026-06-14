-- ============================================================
-- Migration: 20260613020000_advance_payments.sql
-- Description: Adds advance grace period, bank details, and payment proofs.
-- ============================================================

-- 1. Modificar business_settings
ALTER TABLE business_settings 
ADD COLUMN IF NOT EXISTS advance_grace_period_hours INT DEFAULT 2;

ALTER TABLE business_settings 
ADD COLUMN IF NOT EXISTS bank_details TEXT DEFAULT 'Banco: [Tu Banco]
Cuenta: 0000000000
CLABE: 000000000000000000
Beneficiario: [Tu Nombre]';

-- 2. Modificar appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

-- 3. Crear bucket para comprobantes
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Policies para payment-proofs
DROP POLICY IF EXISTS "Proofs Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Proofs Insert" ON storage.objects;

CREATE POLICY "Proofs Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'payment-proofs');

CREATE POLICY "Proofs Insert" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'payment-proofs');
