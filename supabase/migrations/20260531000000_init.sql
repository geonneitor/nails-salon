-- Habilitar extensión para generar UUIDs si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE employee_role AS ENUM ('TOTAL', 'ONLY_BOOK');
CREATE TYPE appointment_status AS ENUM ('pending_advance', 'confirmed_advance', 'free');

-- 2. TABLA MADRE: projects (Salones / Sucursales - Entidad Máxima)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLA: employees (Personal)
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role employee_role NOT NULL DEFAULT 'ONLY_BOOK',
    qr_code_token UUID UNIQUE DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABLA: customers (Clientas)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    birthday DATE,
    service_notes TEXT,
    visit_count INT NOT NULL DEFAULT 0 CHECK (visit_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABLA: services (Servicios)
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABLA: appointments (Citas)
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status appointment_status NOT NULL DEFAULT 'pending_advance',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Restricciones de integridad de fechas y horas
    CONSTRAINT chk_appointment_times CHECK (start_time < end_time)
);

-- 7. TABLA: time_blocks (Bloqueos de Espacio / Horarios)
CREATE TABLE time_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Restricciones de integridad de tiempos
    CONSTRAINT chk_block_times CHECK (start_time < end_time)
);

-- 8. INDEXACIÓN PARA OPTIMIZACIÓN DE BÚSQUEDAS Y DESEMPEÑO
CREATE INDEX idx_employees_project ON employees(project_id);
CREATE INDEX idx_customers_project ON customers(project_id);
CREATE INDEX idx_services_project ON services(project_id);
CREATE INDEX idx_appointments_project ON appointments(project_id);
CREATE INDEX idx_appointments_employee_time ON appointments(employee_id, start_time, end_time);
CREATE INDEX idx_time_blocks_employee_time ON time_blocks(employee_id, start_time, end_time);

-- 9. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;