-- =====================================================================
-- MIGRACIÓN: Restringir escritura de settings y servicios dinámicos a admins
-- Fecha: 2026-06-12
-- Objetivo: Blindar la base de datos limitando privilegios de escritura
--           a usuarios con rol 'admin' en user_roles.
-- =====================================================================

-- 1. BUSINESS SETTINGS:
DROP POLICY IF EXISTS "Admins have full access on business_settings" ON public.business_settings;
DROP POLICY IF EXISTS "Public can view business_settings" ON public.business_settings;

CREATE POLICY "Public can view business_settings"
ON public.business_settings FOR SELECT
USING (true);

CREATE POLICY "Admins have full access on business_settings"
ON public.business_settings FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 2. DYNAMIC SERVICES - CATEGORIES:
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.service_categories;
DROP POLICY IF EXISTS "Categories are insertable by admin" ON public.service_categories;
DROP POLICY IF EXISTS "Categories are updatable by admin" ON public.service_categories;
DROP POLICY IF EXISTS "Public can view service_categories" ON public.service_categories;
DROP POLICY IF EXISTS "Admins have full access on service_categories" ON public.service_categories;

CREATE POLICY "Public can view service_categories"
ON public.service_categories FOR SELECT
USING (true);

CREATE POLICY "Admins have full access on service_categories"
ON public.service_categories FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 3. DYNAMIC SERVICES - VARIANTS:
DROP POLICY IF EXISTS "Variants are viewable by everyone" ON public.service_variants;
DROP POLICY IF EXISTS "Variants are insertable by admin" ON public.service_variants;
DROP POLICY IF EXISTS "Variants are updatable by admin" ON public.service_variants;
DROP POLICY IF EXISTS "Public can view service_variants" ON public.service_variants;
DROP POLICY IF EXISTS "Admins have full access on service_variants" ON public.service_variants;

CREATE POLICY "Public can view service_variants"
ON public.service_variants FOR SELECT
USING (true);

CREATE POLICY "Admins have full access on service_variants"
ON public.service_variants FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. DYNAMIC SERVICES - MODIFIERS:
DROP POLICY IF EXISTS "Modifiers are viewable by everyone" ON public.service_modifiers;
DROP POLICY IF EXISTS "Modifiers are insertable by admin" ON public.service_modifiers;
DROP POLICY IF EXISTS "Modifiers are updatable by admin" ON public.service_modifiers;
DROP POLICY IF EXISTS "Public can view service_modifiers" ON public.service_modifiers;
DROP POLICY IF EXISTS "Admins have full access on service_modifiers" ON public.service_modifiers;

CREATE POLICY "Public can view service_modifiers"
ON public.service_modifiers FOR SELECT
USING (true);

CREATE POLICY "Admins have full access on service_modifiers"
ON public.service_modifiers FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
