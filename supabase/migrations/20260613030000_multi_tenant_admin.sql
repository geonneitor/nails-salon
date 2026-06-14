-- ============================================================
-- Migration: 20260613030000_multi_tenant_admin.sql
-- Description: Adds project_id to user_roles to restrict branch access.
-- ============================================================

ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- Drop constraints o policies si es necesario, pero como esto solo afecta a la tabla de roles
-- y no es obligatorio para ser admin, basta con tener la columna. Un null significa "Super Admin"
-- y tiene acceso a todo.
