// ============================================================
// src/types/supabase.ts
// Auto-derived from DB schema. Single source of truth for types.
// ============================================================

// ----- ENUMS -----

export type EmployeeRole = 'TOTAL' | 'ONLY_BOOK';

export type AppointmentStatus = 'pending_advance' | 'confirmed_advance' | 'completed' | 'cancelled' | 'no_show' | 'free';
export type PaymentStatus = 'unpaid' | 'advance' | 'paid';

export type AppRole = 'admin' | 'employee';

export interface UserRoleRecord {
  id: string; // auth.users.id
  role: AppRole;
  project_id: string | null; // Nulo = Super Admin (ve todo). Especificado = Admin de una sola sucursal.
}

export type ThemeType = 'zen-light' | 'zen-dark' | 'high-contrast';
export type DensityType = 'comfortable' | 'compact';
export type CalendarViewType = 'day' | 'week' | 'month';

// ----- TABLES -----

export interface Project {
  id: string;
  name: string;
  created_at: string; // TIMESTAMPTZ → ISO string en cliente
  owner_id?: string | null; // Opcional: añadido por migración posterior
}

export interface Employee {
  id: string;
  project_id: string;
  name: string;
  email: string | null;
  role: EmployeeRole;
  qr_code_token: string;
  auth_user_id: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  project_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  birthday: string | null; // DATE → 'YYYY-MM-DD'
  service_notes: string | null;
  allergies: string | null;
  color_formulas: string | null;
  visit_count: number;
  created_at: string;
}

export interface CustomerGallery {
  id: string;
  customer_id: string;
  image_url: string;
  notes: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  project_id: string;
  name: string;
  duration_minutes: number;
  price: number;
  created_at: string;
}

export type ServiceSelectionType = 'base' | 'composite' | 'add_on';
export type ServiceModifierType = 'fixed' | 'per_unit' | 'scale_step';

export interface ServiceCategory {
  id: string;
  project_id: string;
  name: string;
  selection_type: ServiceSelectionType;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface ServiceVariant {
  id: string;
  category_id: string;
  name: string;
  base_price: number;
  base_duration_minutes: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface ServiceModifier {
  id: string;
  category_id: string;
  name: string;
  modifier_type: ServiceModifierType;
  price_delta: number;
  duration_delta: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface TicketDetails {
  activeServices: string[];
  booking_color?: string;
  fs_sistema?: string | null;
  fs_forma?: string | null;
  fs_largo?: number | null;
  fs_tonos?: number;
  dis?: Record<string, number>;
  dis_tonos?: number;
  deco?: Record<string, number>;
  deco_tonos?: number;
  repo?: Record<string, number>;
  repo_tonos?: number;
  gel?: string | null;
  gel_tonos?: number;
  mani?: string | null;
  mani_tonos?: number;
  pedi?: string | null;
  pedi_tonos?: number;
}

export interface Appointment {
  id: string;
  project_id: string;
  customer_id: string;
  employee_id: string;
  service_id: string | null;
  start_time: string; // TIMESTAMPTZ → ISO string
  end_time: string;   // TIMESTAMPTZ → ISO string
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  created_at: string;
  ticket_details: TicketDetails | null;
  total_price: number;
  total_duration: number;
  payment_proof_url: string | null;
}

export interface TimeBlock {
  id: string;
  project_id: string;
  employee_id: string;
  start_time: string;
  end_time: string;
  reason: string;
  created_at: string;
}

export type TimeBlockWithEmployee = TimeBlock & {
  employee: Pick<Employee, 'id' | 'name'>;
};

export interface UserRole {
  id: string; // Refs auth.users(id)
  role: AppRole;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: ThemeType;
  density: DensityType;
  sidebar_collapsed: boolean;
  default_view: CalendarViewType;
  updated_at: string;
}

// ----- RELACIONES ENRIQUECIDAS (para queries con JOIN) -----

export type AppointmentWithRelations = Appointment & {
  customer: Pick<Customer, 'id' | 'name' | 'phone' | 'service_notes'>;
  employee: Pick<Employee, 'id' | 'name'>;
};

// ----- PAYLOADS DE MUTACIÓN -----

export type CreateAppointmentPayload = Omit<Appointment, 'id' | 'created_at' | 'payment_status' | 'payment_proof_url'> & {
  payment_status?: PaymentStatus;
  payment_proof_url?: string | null;
};
export type UpdateAppointmentPayload = Partial<
  Pick<Appointment, 'employee_id' | 'start_time' | 'end_time' | 'status' | 'payment_status' | 'ticket_details' | 'total_price' | 'total_duration'>
>;
