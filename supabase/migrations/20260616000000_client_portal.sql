-- =====================================================================
-- MIGRACIÓN: Portal de Autogestión de Clientas
-- Fecha: 2026-06-16
-- =====================================================================

-- 1. Agregar configuración de horas límite de cancelación
ALTER TABLE public.business_settings 
ADD COLUMN IF NOT EXISTS cancel_grace_period_hours INT DEFAULT 24;

-- 2. Función RPC para obtener los detalles de una cita públicamente por ID
CREATE OR REPLACE FUNCTION public.get_appointment_public(p_appointment_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', a.id,
    'start_time', a.start_time,
    'end_time', a.end_time,
    'status', a.status,
    'payment_proof_url', a.payment_proof_url,
    'employee', jsonb_build_object(
      'id', e.id,
      'name', e.name
    ),
    'service', jsonb_build_object(
      'id', s.id,
      'name', s.name,
      'price', s.price
    ),
    'customer', jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'phone', c.phone
    ),
    'project', jsonb_build_object(
      'id', p.id,
      'name', p.name
    )
  ) INTO v_result
  FROM public.appointments a
  JOIN public.employees e ON a.employee_id = e.id
  JOIN public.services s ON a.service_id = s.id
  JOIN public.customers c ON a.customer_id = c.id
  JOIN public.projects p ON a.project_id = p.id
  WHERE a.id = p_appointment_id
  LIMIT 1;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_appointment_public(UUID) TO anon;

-- 3. Función RPC para que la clienta cancele su cita si cumple las 24 horas
CREATE OR REPLACE FUNCTION public.cancel_appointment_public(p_appointment_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_appointment RECORD;
  v_settings RECORD;
  v_hours_diff NUMERIC;
BEGIN
  -- Obtener la cita
  SELECT start_time, status, project_id INTO v_appointment
  FROM public.appointments
  WHERE id = p_appointment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cita no encontrada.';
  END IF;

  IF v_appointment.status IN ('cancelled', 'no_show') THEN
    RAISE EXCEPTION 'La cita ya está cancelada.';
  END IF;

  -- Obtener las configuraciones del negocio para las horas de gracia
  SELECT cancel_grace_period_hours INTO v_settings
  FROM public.business_settings
  WHERE project_id = v_appointment.project_id
  LIMIT 1;

  -- Calcular la diferencia en horas entre ahora y la cita
  v_hours_diff := EXTRACT(EPOCH FROM (v_appointment.start_time - NOW())) / 3600;

  IF v_hours_diff < COALESCE(v_settings.cancel_grace_period_hours, 24) THEN
    RAISE EXCEPTION 'No puedes cancelar automáticamente con menos de % horas de anticipación. Por favor contacta al salón.', COALESCE(v_settings.cancel_grace_period_hours, 24);
  END IF;

  -- Actualizar el estado de la cita a cancelada
  UPDATE public.appointments
  SET status = 'cancelled'::public.appointment_status
  WHERE id = p_appointment_id;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_appointment_public(UUID) TO anon;
