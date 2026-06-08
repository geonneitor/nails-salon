-- =====================================================================
-- MIGRACIÓN: Fase 2 - Operaciones, Roles y CRM
-- Fecha: 2026-06-08
-- =====================================================================

-- 1. ADD NEW STATUSES TO ENUM
-- Note: 'cancelled' and 'no_show'
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'cancelled';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'no_show';

-- 2. MODIFY CUSTOMERS TABLE (Ficha Clínica)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS color_formulas TEXT;

-- 3. MODIFY EMPLOYEES TABLE (Vinculación con auth.users para RLS real)
ALTER TABLE employees ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. CREATE CUSTOMER_GALLERY TABLE (Fotos antes/después)
CREATE TABLE IF NOT EXISTS customer_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_customer_gallery_customer ON customer_gallery(customer_id);

-- Enable RLS for gallery
ALTER TABLE customer_gallery ENABLE ROW LEVEL SECURITY;

-- Gallery RLS Policies
CREATE POLICY "Admins have full access on customer_gallery"
ON public.customer_gallery FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Employees can view customer_gallery"
ON public.customer_gallery FOR SELECT TO authenticated
USING (true); -- Podría restringirse si es necesario, pero por ahora permitimos lectura a empleados

-- 5. RLS POLICIES FOR EMPLOYEES (Restringir visibilidad de citas)
-- Primero eliminamos la política de lectura general de empleados para citas si existe
DROP POLICY IF EXISTS "Employees can view all appointments" ON public.appointments;

-- Creamos la política estricta:
-- Un empleado (autenticado) puede ver la cita SI:
-- 1. Es Admin (cubierto por la política de Admin existente)
-- 2. Su auth.uid() coincide con el auth_user_id del employee_id asignado a la cita
-- 3. O, si su auth.uid() corresponde a un empleado con role = 'TOTAL' (esto requiere un subquery o función, por ahora usamos is_admin)

CREATE POLICY "Employees can view their own appointments"
ON public.appointments FOR SELECT TO authenticated
USING (
  employee_id IN (
    SELECT id FROM employees WHERE auth_user_id = auth.uid()
  )
);

-- Nota: public.is_admin() (de migraciones previas) asume que la tabla user_roles define quién es admin. 
-- Aquí la nueva política permite a un usuario autenticado leer la cita si su ID está vinculado al employee_id.
