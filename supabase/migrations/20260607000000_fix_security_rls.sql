-- =====================================================================
-- MIGRACIÓN: Reparación de Seguridad RLS (Eliminación de Acceso Anon Total)
-- Fecha: 2026-06-07
-- Objetivo: Eliminar el acceso total del rol 'anon' y restringirlo a lo
--           estrictamente necesario para el flujo de reserva pública.
-- =====================================================================

-- 1. ELIMINAR POLÍTICAS DE ACCESO TOTAL (Creadas en 20260603000000)
DROP POLICY IF EXISTS "Anon full access on projects" ON public.projects;
DROP POLICY IF EXISTS "Anon full access on customers" ON public.customers;
DROP POLICY IF EXISTS "Anon full access on employees" ON public.employees;
DROP POLICY IF EXISTS "Anon full access on services" ON public.services;
DROP POLICY IF EXISTS "Anon full access on appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anon full access on time_blocks" ON public.time_blocks;

-- 2. DEFINIR ACCESOS PÚBLICOS RESTRICCIONES (SÓLO LECTURA O SÓLO INSERCIÓN)

-- Servicios: Lectura pública para que el cliente pueda elegir
CREATE POLICY "Public can view services"
ON public.services FOR SELECT TO anon
USING (true);

-- Empleadas: Lectura pública para asignar la cita
CREATE POLICY "Public can view employees"
ON public.employees FOR SELECT TO anon
USING (true);

-- Bloqueos de Tiempo: Lectura pública para validar disponibilidad
CREATE POLICY "Public can view time_blocks"
ON public.time_blocks FOR SELECT TO anon
USING (true);

-- Clientas: SÓLO Inserción (El flujo de reserva crea la clienta si no existe)
-- Nota: La lectura de clientas queda estrictamente para el staff (authed)
CREATE POLICY "Public can create customers"
ON public.customers FOR INSERT TO anon
WITH CHECK (true);

-- Citas: SÓLO Inserción (El cliente solicita el espacio)
CREATE POLICY "Public can request appointments"
ON public.appointments FOR INSERT TO anon
WITH CHECK (true);

-- 3. RESTABLECER ACCESOS ADMINISTRATIVOS (Asegurar que no se perdieron)
-- Estas policies ya deberían existir en 20260531010000, pero las reafirmamos
-- para evitar cualquier inconsistencia tras los DROPs.

CREATE POLICY "Admins have full access on projects_fix"
ON public.projects FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access on customers_fix"
ON public.customers FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access on employees_fix"
ON public.employees FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access on services_fix"
ON public.services FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access on appointments_fix"
ON public.appointments FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access on time_blocks_fix"
ON public.time_blocks FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Nota: Las policies de 'employee' la mantienen el archivo 20260531010000.
