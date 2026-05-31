-- =====================================================================
-- 1. CREACIÓN DE LA TABLA DE ROLES (Vinculada a auth.users de Supabase)
-- =====================================================================
CREATE TYPE app_role AS ENUM ('admin', 'employee');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'employee',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 2. FUNCIONES DE AYUDA CON PRIVILEGIOS DE DEFINIDOR (SECURITY DEFINER)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.has_role(required_role app_role)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE id = auth.uid() AND role = required_role
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 3. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- =====================================================================

------------------------------------------------------------------------
-- POLÍTICAS: user_roles (Solución al bloqueo de inserción inicial)
------------------------------------------------------------------------
CREATE POLICY "Admins have full access on user_roles"
ON public.user_roles TO authenticated
USING (public.is_admin() OR (SELECT COUNT(*) FROM public.user_roles) = 0) -- Permite el primer registro
WITH CHECK (public.is_admin() OR (SELECT COUNT(*) FROM public.user_roles) = 0);

CREATE POLICY "Users can read their own role"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = id);

------------------------------------------------------------------------
-- POLÍTICAS: projects
------------------------------------------------------------------------
CREATE POLICY "Admins have full access on projects"
ON public.projects TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Permitir lectura si el usuario está autenticado en la plataforma
CREATE POLICY "Users can view projects"
ON public.projects FOR SELECT TO authenticated
USING (true);

------------------------------------------------------------------------
-- POLÍTICAS: employees
------------------------------------------------------------------------
CREATE POLICY "Admins have full access on employees"
ON public.employees TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Staff can view employees list"
ON public.employees FOR SELECT TO authenticated
USING (true);

------------------------------------------------------------------------
-- POLÍTICAS: customers
------------------------------------------------------------------------
CREATE POLICY "Admins have full access on customers"
ON public.customers TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Employees can view customers"
ON public.customers FOR SELECT TO authenticated
USING (public.has_role('employee'));

------------------------------------------------------------------------
-- POLÍTICAS: services
------------------------------------------------------------------------
CREATE POLICY "Admins have full access on services"
ON public.services TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Employees can read services"
ON public.services FOR SELECT TO authenticated
USING (public.has_role('employee'));

------------------------------------------------------------------------
-- POLÍTICAS: appointments (Optimizado para evitar Double-Booking)
------------------------------------------------------------------------
CREATE POLICY "Admins have full access on appointments"
ON public.appointments TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Modificado: El staff lee todas las citas para saber qué bloques están ocupados en el calendario global
CREATE POLICY "Employees can read all appointments for calendar sync"
ON public.appointments FOR SELECT TO authenticated
USING (public.has_role('employee'));

CREATE POLICY "Employees can update their own appointments"
ON public.appointments FOR UPDATE TO authenticated
USING (employee_id = auth.uid() AND public.has_role('employee'))
WITH CHECK (employee_id = auth.uid() AND public.has_role('employee'));

------------------------------------------------------------------------
-- POLÍTICAS: time_blocks
------------------------------------------------------------------------
CREATE POLICY "Admins have full access on time_blocks"
ON public.time_blocks TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Los empleados necesitan ver los bloqueos de horario de sus compañeros
CREATE POLICY "Employees can read all time_blocks"
ON public.time_blocks FOR SELECT TO authenticated
USING (public.has_role('employee'));