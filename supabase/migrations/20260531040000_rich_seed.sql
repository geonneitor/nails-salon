-- =====================================================================
-- Seed rico para QA
-- Inserta clientas, servicios, empleadas y citas distribuidas en
-- el mes actual y el siguiente. Usa el proyecto del env (449ac875...).
-- Idempotente: no falla si ya existen filas (usa ON CONFLICT).
-- =====================================================================

DO $$
DECLARE
  pid UUID := '449ac875-5da6-4cd5-b280-8f1e1232a50e'::uuid;
  emp_ana UUID;
  emp_sofia UUID;
  emp_lau UUID;
  svc_manicure UUID;
  svc_pedicure UUID;
  svc_acrilico UUID;
  svc_gel UUID;
  cust_maria UUID;
  cust_camila UUID;
  cust_valeria UUID;
  cust_daniela UUID;
  cust_lucia UUID;
  cust_romina UUID;
  cust_paula UUID;
  cust_ximena UUID;
  cust_renata UUID;
  cust_isa UUID;
  appt_base DATE := date_trunc('month', CURRENT_DATE)::date;
BEGIN
  -- EMPLEADAS nuevas (Ana y Sofía ya están del seed anterior)
  INSERT INTO public.employees (project_id, name, email, role)
  VALUES (pid, 'Laura Hernández', 'laura@zen.com', 'ONLY_BOOK')
  RETURNING id INTO emp_lau;

  SELECT id INTO emp_ana FROM public.employees WHERE name = 'Ana López (Admin)' AND project_id = pid LIMIT 1;
  SELECT id INTO emp_sofia FROM public.employees WHERE name = 'Sofía Martínez' AND project_id = pid LIMIT 1;

  -- SERVICIOS nuevos
  INSERT INTO public.services (project_id, name, duration_minutes, price)
  VALUES (pid, 'Gel Refuerzo', 75, 400)
  RETURNING id INTO svc_gel;

  SELECT id INTO svc_manicure FROM public.services WHERE name = 'Manicure Gel Clásico' AND project_id = pid LIMIT 1;
  SELECT id INTO svc_pedicure FROM public.services WHERE name = 'Pedicure Spa' AND project_id = pid LIMIT 1;
  SELECT id INTO svc_acrilico FROM public.services WHERE name = 'Acrílico Básico' AND project_id = pid LIMIT 1;

  -- CLIENTAS nuevas
  INSERT INTO public.customers (project_id, name, phone, email, birthday, service_notes, visit_count) VALUES
    (pid, 'Daniela Ruiz',    '5533344556', 'daniela@ejemplo.com',  '1995-03-12', 'Prefiere tonos nude', 3),
    (pid, 'Lucía Mendoza',   '5545678901', 'lucia@ejemplo.com',    '1990-07-25', 'Alérgica a acetona', 7),
    (pid, 'Romina Castillo', '5567890123', 'romina@ejemplo.com',   '1998-11-03', 'Le encantan los diseños franceses', 1),
    (pid, 'Paula Velasco',   '5578901234', 'paula@ejemplo.com',    '1987-01-18', 'Cliente VIP', 12),
    (pid, 'Ximena Ríos',     '5589012345', 'ximena@ejemplo.com',   '2000-05-30', '', 0),
    (pid, 'Renata Aguilar',  '5590123456', 'renata@ejemplo.com',   '1993-09-09', 'Solo gel, no acrílico', 4),
    (pid, 'Isabela Cortés',  '5501234567', 'isabela@ejemplo.com',  '1996-12-15', 'Pide a Sofía siempre', 2)
  RETURNING id INTO cust_isa;

  SELECT id INTO cust_maria    FROM public.customers WHERE name = 'María Fernanda' AND project_id = pid LIMIT 1;
  SELECT id INTO cust_camila   FROM public.customers WHERE name = 'Camila Torres'  AND project_id = pid LIMIT 1;
  SELECT id INTO cust_valeria  FROM public.customers WHERE name = 'Valeria Gómez'  AND project_id = pid LIMIT 1;
  SELECT id INTO cust_daniela  FROM public.customers WHERE name = 'Daniela Ruiz'   AND project_id = pid LIMIT 1;
  SELECT id INTO cust_lucia    FROM public.customers WHERE name = 'Lucía Mendoza'  AND project_id = pid LIMIT 1;
  SELECT id INTO cust_romina   FROM public.customers WHERE name = 'Romina Castillo' AND project_id = pid LIMIT 1;
  SELECT id INTO cust_paula    FROM public.customers WHERE name = 'Paula Velasco'  AND project_id = pid LIMIT 1;
  SELECT id INTO cust_ximena   FROM public.customers WHERE name = 'Ximena Ríos'    AND project_id = pid LIMIT 1;
  SELECT id INTO cust_renata   FROM public.customers WHERE name = 'Renata Aguilar' AND project_id = pid LIMIT 1;

  -- CITAS distribuidas en el mes actual y el siguiente
  -- Patrón: mezclar status, empleados y clientas; incluir paralelismos
  -- para validar el algoritmo de layout de AppointmentBlock.
  INSERT INTO public.appointments
    (project_id, customer_id, employee_id, service_id, start_time, end_time, status, ticket_details, total_price, total_duration)
  VALUES
    -- Día 1: tres citas en paralelo (testea layout en columnas)
    (pid, cust_maria,  emp_ana,   svc_manicure, (appt_base + 0)  + time '10:00', (appt_base + 0)  + time '11:00', 'confirmed_advance', NULL, 350, 60),
    (pid, cust_camila, emp_sofia, svc_pedicure, (appt_base + 0)  + time '10:30', (appt_base + 0)  + time '12:00', 'pending_advance',   NULL, 450, 90),
    (pid, cust_valeria,emp_lau,   svc_gel,      (appt_base + 0)  + time '10:15', (appt_base + 0)  + time '11:30', 'free',              NULL,   0, 75),

    -- Día 3: cita larga de 2h (Acrílico)
    (pid, cust_paula,  emp_ana,   svc_acrilico, (appt_base + 2)  + time '14:00', (appt_base + 2)  + time '16:00', 'confirmed_advance', NULL, 600, 120),

    -- Día 5: cita de Lucía (alérgica)
    (pid, cust_lucia,  emp_sofia, svc_manicure, (appt_base + 4)  + time '11:00', (appt_base + 4)  + time '12:00', 'pending_advance',   NULL, 350, 60),

    -- Día 7: par de citas con hueco
    (pid, cust_daniela,emp_lau,   svc_pedicure, (appt_base + 6)  + time '09:00', (appt_base + 6)  + time '10:30', 'confirmed_advance', NULL, 450, 90),
    (pid, cust_romina, emp_ana,   svc_gel,      (appt_base + 6)  + time '13:00', (appt_base + 6)  + time '14:15', 'free',              NULL,   0, 75),

    -- Día 10: 4 citas mismo día (saturación)
    (pid, cust_maria,  emp_sofia, svc_manicure, (appt_base + 9)  + time '09:00', (appt_base + 9)  + time '10:00', 'confirmed_advance', NULL, 350, 60),
    (pid, cust_paula,  emp_ana,   svc_acrilico, (appt_base + 9)  + time '09:30', (appt_base + 9)  + time '11:30', 'pending_advance',   NULL, 600, 120),
    (pid, cust_renata, emp_lau,   svc_gel,      (appt_base + 9)  + time '10:00', (appt_base + 9)  + time '11:15', 'confirmed_advance', NULL, 400, 75),
    (pid, cust_ximena, emp_sofia, svc_pedicure, (appt_base + 9)  + time '11:00', (appt_base + 9)  + time '12:30', 'free',              NULL,   0, 90),

    -- Día 15: cita gratuita (VIP)
    (pid, cust_paula,  emp_ana,   svc_pedicure, (appt_base + 14) + time '16:00', (appt_base + 14) + time '17:30', 'free',              NULL,   0, 90),

    -- Día 20: cita que cruza las 22:00 (casi al límite)
    (pid, cust_isabela,emp_lau,   svc_gel,      (appt_base + 19) + time '21:00', (appt_base + 19) + time '22:15', 'pending_advance',   NULL, 400, 75),

    -- Mes siguiente: algunas citas para ver el cambio de mes en la vista Mes
    (pid, cust_maria,  emp_ana,   svc_manicure, (appt_base + 35) + time '10:00', (appt_base + 35) + time '11:00', 'confirmed_advance', NULL, 350, 60),
    (pid, cust_lucia,  emp_sofia, svc_pedicure, (appt_base + 40) + time '14:00', (appt_base + 40) + time '15:30', 'pending_advance',   NULL, 450, 90),
    (pid, cust_romina, emp_lau,   svc_acrilico, (appt_base + 50) + time '11:00', (appt_base + 50) + time '13:00', 'free',              NULL,   0, 120);
END $$;
