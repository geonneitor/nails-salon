-- =====================================================================
-- MIGRACIÓN: Fix RLS faltantes para settings y dynamic services
-- Fecha: 2026-06-08
-- Objetivo: Añadir políticas RLS que faltaron para el correcto
--           funcionamiento de business_settings y el menú dinámico.
-- =====================================================================

-- 1. BUSINESS SETTINGS: Los administradores (authed) pueden ver, insertar y actualizar.
-- El público general (anon) SÓLO necesita leer (SELECT) para saber los horarios de la sucursal.
CREATE POLICY "Admins have full access on business_settings"
ON public.business_settings FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can view business_settings"
ON public.business_settings FOR SELECT TO anon
USING (true);

-- 2. DYNAMIC SERVICES: Los administradores ya tienen acceso por otras policies, 
-- pero el público (anon) DEBE poder LEER para ver el menú en /reserva.
CREATE POLICY "Public can view service_categories"
ON public.service_categories FOR SELECT TO anon
USING (true);

CREATE POLICY "Public can view service_variants"
ON public.service_variants FOR SELECT TO anon
USING (true);

CREATE POLICY "Public can view service_modifiers"
ON public.service_modifiers FOR SELECT TO anon
USING (true);

-- Asegurarse de que los administradores tengan ALL si no lo tenían
CREATE POLICY "Admins have full access on service_categories"
ON public.service_categories FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins have full access on service_variants"
ON public.service_variants FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins have full access on service_modifiers"
ON public.service_modifiers FOR ALL TO authenticated
USING (true)
WITH CHECK (true);
