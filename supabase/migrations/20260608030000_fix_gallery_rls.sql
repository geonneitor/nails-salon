-- ============================================================
-- Migration: 20260608030000_fix_gallery_rls.sql
-- Description: Fix INSERT/UPDATE/DELETE policies for customer_gallery.
-- The previous migration only allowed admins to modify the gallery.
-- This migration adds a permissive policy for all authenticated users.
-- ============================================================

-- Drop the overly restrictive admin-only policy for INSERT/UPDATE/DELETE
DROP POLICY IF EXISTS "Admins have full access on customer_gallery" ON public.customer_gallery;

-- Recreate a full-access policy for ALL authenticated sessions (empleadas con sesión activa)
CREATE POLICY "Authenticated users have full access on customer_gallery"
ON public.customer_gallery FOR ALL TO authenticated
USING (true)
WITH CHECK (true);
