// ============================================================
// src/types/supabase.ts
// Auto-derived from DB schema. Single source of truth for types.
// ============================================================

// ----- ENUMS -----

export type EmployeeRole = 'TOTAL' | 'ONLY_BOOK';

export type AppointmentStatus = 'pending_advance' | 'confirmed_advance' | 'completed' | 'free';

export type AppRole = 'admin' | 'employee';

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
  visit_count: number;
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

export interface TicketDetails {
  activeServices: string[];
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
  created_at: string;
  ticket_details: TicketDetails | null;
  total_price: number;
  total_duration: number;
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
  service: Pick<Service, 'id' | 'name' | 'duration_minutes' | 'price'> | null;
};

// ----- PAYLOADS DE MUTACIÓN -----

export type CreateAppointmentPayload = Omit<Appointment, 'id' | 'created_at'>;
export type UpdateAppointmentPayload = Partial<
  Pick<Appointment, 'employee_id' | 'start_time' | 'end_time' | 'status' | 'ticket_details' | 'total_price' | 'total_duration'>
>;
