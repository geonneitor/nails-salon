-- Insertar Servicios de Ejemplo
INSERT INTO public.services (project_id, name, duration_minutes, price)
VALUES 
  ('449ac875-5da6-4cd5-b280-8f1e1232a50e', 'Manicure Gel Clásico', 60, 350),
  ('449ac875-5da6-4cd5-b280-8f1e1232a50e', 'Pedicure Spa', 90, 450),
  ('449ac875-5da6-4cd5-b280-8f1e1232a50e', 'Acrílico Básico', 120, 600);

-- Insertar Empleadas de Ejemplo
INSERT INTO public.employees (project_id, name, email, role)
VALUES 
  ('449ac875-5da6-4cd5-b280-8f1e1232a50e', 'Ana López (Admin)', 'ana@zen.com', 'TOTAL'),
  ('449ac875-5da6-4cd5-b280-8f1e1232a50e', 'Sofía Martínez', 'sofia@zen.com', 'ONLY_BOOK');

-- Insertar Clientas de Ejemplo
INSERT INTO public.customers (project_id, name, phone, email, visit_count)
VALUES 
  ('449ac875-5da6-4cd5-b280-8f1e1232a50e', 'María Fernanda', '5512345678', 'maria@ejemplo.com', 5),
  ('449ac875-5da6-4cd5-b280-8f1e1232a50e', 'Camila Torres', '5587654321', 'camila@ejemplo.com', 2),
  ('449ac875-5da6-4cd5-b280-8f1e1232a50e', 'Valeria Gómez', '5599887766', 'valeria@ejemplo.com', 0);
