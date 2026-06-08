-- 1. Modify appointments to support JSON service configurations instead of a single service_id
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_service_id_fkey;
ALTER TABLE public.appointments ALTER COLUMN service_id DROP NOT NULL;

-- 2. Create the new dynamic categories table
CREATE TABLE public.service_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    selection_type VARCHAR(50) NOT NULL, -- 'base', 'composite', 'add_on'
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create the new variants table (replaces the old single services)
CREATE TABLE public.service_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES public.service_categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    base_duration_minutes INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create modifiers (extras, sizes, designs)
CREATE TABLE public.service_modifiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES public.service_categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    modifier_type VARCHAR(50) NOT NULL, -- 'fixed' (adds price/time), 'per_unit' (multiplies by qty), 'scale_step' (for length > N)
    price_delta DECIMAL(10,2) NOT NULL DEFAULT 0,
    duration_delta INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RLS Policies
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_modifiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" ON public.service_categories FOR SELECT USING (true);
CREATE POLICY "Categories are insertable by admin" ON public.service_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Categories are updatable by admin" ON public.service_categories FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Variants are viewable by everyone" ON public.service_variants FOR SELECT USING (true);
CREATE POLICY "Variants are insertable by admin" ON public.service_variants FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Variants are updatable by admin" ON public.service_variants FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Modifiers are viewable by everyone" ON public.service_modifiers FOR SELECT USING (true);
CREATE POLICY "Modifiers are insertable by admin" ON public.service_modifiers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Modifiers are updatable by admin" ON public.service_modifiers FOR UPDATE USING (auth.role() = 'authenticated');

-- 6. SEED DATA FROM CANVA CALCULATOR
-- Nota: se asume que el primer proyecto en la base de datos es el principal (Sky Beauty)
DO $$
DECLARE
    default_project UUID;
    cat_fs UUID := gen_random_uuid();
    cat_dis UUID := gen_random_uuid();
    cat_dec UUID := gen_random_uuid();
    cat_rep UUID := gen_random_uuid();
    cat_gel UUID := gen_random_uuid();
    cat_man UUID := gen_random_uuid();
    cat_ped UUID := gen_random_uuid();
BEGIN
    SELECT id INTO default_project FROM public.projects ORDER BY created_at ASC LIMIT 1;
    IF default_project IS NULL THEN
        RAISE EXCEPTION 'No project found to attach services. Create a project first.';
    END IF;

    INSERT INTO public.service_categories (id, project_id, name, selection_type, display_order) VALUES
    (cat_fs, default_project, 'Full Set', 'composite', 1),
    (cat_dis, default_project, 'Diseños Completos', 'add_on', 2),
    (cat_dec, default_project, 'Decoraciones', 'add_on', 3),
    (cat_rep, default_project, 'Reposiciones', 'add_on', 4),
    (cat_gel, default_project, 'Gel Protección', 'base', 5),
    (cat_man, default_project, 'Manicura', 'base', 6),
    (cat_ped, default_project, 'Pedicura Spa', 'base', 7);

    -- FULL SET Variants (Sistemas)
    INSERT INTO public.service_variants (category_id, name, base_price, base_duration_minutes) VALUES
    (cat_fs, 'Acrílico', 450, 90),
    (cat_fs, 'Polygel', 450, 90),
    (cat_fs, 'Builder Gel', 480, 90);

    -- FULL SET Modifiers
    INSERT INTO public.service_modifiers (category_id, name, modifier_type, price_delta) VALUES
    (cat_fs, 'Forma: Cuadrada', 'fixed', 0),
    (cat_fs, 'Forma: Almendra', 'fixed', 0),
    (cat_fs, 'Forma: Stiletto', 'fixed', 0),
    (cat_fs, 'Forma: Coffin', 'fixed', 0),
    (cat_fs, 'Largo (>2 suma $50)', 'scale_step', 50),
    (cat_fs, 'Tono extra', 'per_unit', 5);

    -- DISENOS Modifiers
    INSERT INTO public.service_modifiers (category_id, name, modifier_type, price_delta) VALUES
    (cat_dis, 'Mano Alzada', 'per_unit', 200),
    (cat_dis, 'French', 'per_unit', 120),
    (cat_dis, 'Mano Alzada con Relieves', 'per_unit', 250),
    (cat_dis, 'Efecto completo / Ojo de gato', 'per_unit', 100),
    (cat_dis, 'Efecto + Diseño sencillo', 'per_unit', 150),
    (cat_dis, 'Tono extra', 'per_unit', 5);

    -- DECORACIONES Modifiers
    INSERT INTO public.service_modifiers (category_id, name, modifier_type, price_delta) VALUES
    (cat_dec, 'Espejo', 'per_unit', 15),
    (cat_dec, 'Aurora', 'per_unit', 15),
    (cat_dec, 'Azúcar', 'per_unit', 15),
    (cat_dec, 'Suéter', 'per_unit', 15),
    (cat_dec, 'Perla', 'per_unit', 15),
    (cat_dec, 'Glitter', 'per_unit', 15),
    (cat_dec, 'Carey', 'per_unit', 15),
    (cat_dec, 'Blooming', 'per_unit', 15),
    (cat_dec, 'Ojo de gato', 'per_unit', 15),
    (cat_dec, 'Relieve', 'per_unit', 15),
    (cat_dec, 'Francés', 'per_unit', 15),
    (cat_dec, 'Nail art simple', 'per_unit', 15),
    (cat_dec, 'Baby boomer', 'per_unit', 15),
    (cat_dec, '3D', 'per_unit', 20),
    (cat_dec, 'Naturaleza muerta', 'per_unit', 20),
    (cat_dec, 'Cristales Ch', 'per_unit', 20),
    (cat_dec, 'Diseño complicado', 'per_unit', 25),
    (cat_dec, 'Dijes', 'per_unit', 25),
    (cat_dec, 'Encapsulado', 'per_unit', 30),
    (cat_dec, 'Cristales M', 'per_unit', 30),
    (cat_dec, 'Cristales G', 'per_unit', 40),
    (cat_dec, 'Uña completa cristal Ch (1-3)', 'per_unit', 50),
    (cat_dec, 'Uña completa cristal M (4-6)', 'per_unit', 80),
    (cat_dec, 'Uña completa cristal G (7-9)', 'per_unit', 100),
    (cat_dec, 'Sticker', 'per_unit', 10),
    (cat_dec, 'Tono extra', 'per_unit', 5);

    -- REPOSICIONES Modifiers
    INSERT INTO public.service_modifiers (category_id, name, modifier_type, price_delta) VALUES
    (cat_rep, 'Acrílico / Polygel', 'per_unit', 50),
    (cat_rep, 'Builder Gel', 'per_unit', 60),
    (cat_rep, 'Rubber', 'per_unit', 40),
    (cat_rep, 'Tono extra', 'per_unit', 5);

    -- GEL PROTECCION Variants
    INSERT INTO public.service_variants (category_id, name, base_price, base_duration_minutes) VALUES
    (cat_gel, 'Protección Polygel', 400, 60),
    (cat_gel, 'Protección Builder Gel', 400, 60),
    (cat_gel, 'Gel sobre uña natural', 350, 50),
    (cat_gel, 'Cambio de gel', 380, 60),
    (cat_gel, 'Nivelación con Rubber', 380, 60),
    (cat_gel, 'Relleno Rubber', 380, 60);

    INSERT INTO public.service_modifiers (category_id, name, modifier_type, price_delta) VALUES
    (cat_gel, 'Tono extra', 'per_unit', 5);

    -- MANICURA Variants
    INSERT INTO public.service_variants (category_id, name, base_price, base_duration_minutes) VALUES
    (cat_man, 'Con gel', 400, 60),
    (cat_man, 'Sin gel', 300, 45);

    INSERT INTO public.service_modifiers (category_id, name, modifier_type, price_delta) VALUES
    (cat_man, 'Tono extra', 'per_unit', 5);

    -- PEDICURA Variants
    INSERT INTO public.service_variants (category_id, name, base_price, base_duration_minutes) VALUES
    (cat_ped, 'Pedicura spa', 480, 60),
    (cat_ped, 'Pedicura + French', 550, 75),
    (cat_ped, 'Pedicura, Acripie 2 dedos, French', 750, 90),
    (cat_ped, 'Pedicura + Acripie', 800, 105);

    INSERT INTO public.service_modifiers (category_id, name, modifier_type, price_delta) VALUES
    (cat_ped, 'Tono extra', 'per_unit', 5);

END $$;
