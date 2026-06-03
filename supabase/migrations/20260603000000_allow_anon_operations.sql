-- =====================================================================
-- MIGRACIÓN: Permitir operaciones CRUD con rol anon (modo demo / sin Auth)
-- Fecha: 2026-06-03
-- Contexto: La app opera principalmente con la anon key de Supabase sin
--           pasar por Supabase Auth. Las policies existentes bloquean
--           todos los INSERT/UPDATE/DELETE porque requieren auth.uid().
--           Esta migración agrega policies para el rol 'anon' que
--           permiten CRUD completo en todas las tablas operativas.
-- =====================================================================

-- -----------------------------------------------------------------------
-- projects: acceso total para anon
-- -----------------------------------------------------------------------
CREATE POLICY "Anon full access on projects"
ON public.projects
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- -----------------------------------------------------------------------
-- customers: acceso total para anon
-- -----------------------------------------------------------------------
CREATE POLICY "Anon full access on customers"
ON public.customers
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- -----------------------------------------------------------------------
-- employees: acceso total para anon
-- -----------------------------------------------------------------------
CREATE POLICY "Anon full access on employees"
ON public.employees
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- -----------------------------------------------------------------------
-- services: acceso total para anon
-- -----------------------------------------------------------------------
CREATE POLICY "Anon full access on services"
ON public.services
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- -----------------------------------------------------------------------
-- appointments: acceso total para anon
-- -----------------------------------------------------------------------
CREATE POLICY "Anon full access on appointments"
ON public.appointments
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- -----------------------------------------------------------------------
-- time_blocks: acceso total para anon
-- -----------------------------------------------------------------------
CREATE POLICY "Anon full access on time_blocks"
ON public.time_blocks
FOR ALL
TO anon
USING (true)
WITH CHECK (true);
