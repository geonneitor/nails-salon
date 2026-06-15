/**
 * usePublicBooking
 * Hook independiente para el flujo de reservas del landing público.
 * No requiere sesión autenticada. Usa NEXT_PUBLIC_PROJECT_ID.
 */
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';

const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || '489e898d-3b2a-4775-b784-93a0e1a473e0';

export interface PublicService {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  description?: string;
}

export interface TimeSlot {
  label: string;
  h: number;
  m: number;
}

export interface BookingPayload {
  serviceId: string;
  date: Date;
  timeSlot: TimeSlot;
  name: string;
  contact: string;
  totalPrice: number;
  totalDuration: number;
  ticketDetails: any;
}

export function usePublicBooking() {
  const [services, setServices] = useState<PublicService[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [businessSettings, setBusinessSettings] = useState<any>(null);

  /* ── Load services ── */
  useEffect(() => {
    supabase
      .from('services')
      .select('id, name, price, duration_minutes')
      .eq('project_id', PROJECT_ID)
      .order('name')
      .then(({ data, error }) => {
        if (!error && data) setServices(data as PublicService[]);
        setLoadingServices(false);
      });
  }, []);

  /* ── Load business settings ── */
  useEffect(() => {
    supabase
      .from('business_settings')
      .select('*')
      .eq('project_id', PROJECT_ID)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error && error.code !== 'PGRST116') console.error(error);
        if (!error && data) {
          setBusinessSettings(data);
          const slots = buildSlots(data.opening_hour, data.closing_hour);
          setTimeSlots(slots);
        } else {
          setTimeSlots(buildSlots('09:00', '18:00'));
        }
        setLoadingSettings(false);
      });
  }, []);

  /* ── Fetch Real Available Slots ── */
  const fetchAvailableSlots = async (date: Date, requiredMinutes: number): Promise<TimeSlot[]> => {
    // Usar valores por defecto si no hay configuración guardada en DB
    const settings = businessSettings ?? {
      opening_hour: '10:00',
      closing_hour: '19:00',
      working_days: [1, 2, 3, 4, 5, 6], // Lun-Sáb
      max_employees: 1,
    };

    const dayOfWeek = date.getDay();
    if (settings.working_days && !settings.working_days.includes(dayOfWeek)) {
      return []; // Not a working day
    }

    // 1. Get base slots
    const allSlots = buildSlots(settings.opening_hour, settings.closing_hour);
    const validSlots: TimeSlot[] = [];

    // 2. Fetch employees
    const { data: employees } = await supabase.from('employees').select('id').eq('project_id', PROJECT_ID);
    if (!employees || employees.length === 0) return [];

    // 3. Fetch ALL appointments for that day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: appointments } = await supabase
      .from('appointments')
      .select('employee_id, start_time, end_time')
      .eq('project_id', PROJECT_ID)
      .not('status', 'eq', 'cancelled')
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString());

    const { data: timeBlocks } = await supabase
      .from('time_blocks')
      .select('employee_id, start_time, end_time')
      .eq('project_id', PROJECT_ID)
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString());

    const isSlotAvailableForEmployee = (empId: string, slotStart: Date, slotEnd: Date) => {
      // Check appointments
      const hasApptConflict = appointments?.some(a => {
        if (a.employee_id !== empId) return false;
        const aStart = new Date(a.start_time);
        const aEnd = new Date(a.end_time);
        return slotStart < aEnd && slotEnd > aStart;
      });
      if (hasApptConflict) return false;

      // Check time blocks
      const hasBlockConflict = timeBlocks?.some(b => {
        if (b.employee_id !== empId) return false;
        const bStart = new Date(b.start_time);
        const bEnd = new Date(b.end_time);
        return slotStart < bEnd && slotEnd > bStart;
      });
      return !hasBlockConflict;
    };

    const [closeH, closeM] = settings.closing_hour.split(':').map(Number);
    const closingTime = new Date(date);
    closingTime.setHours(closeH, closeM, 0, 0);

    for (const slot of allSlots) {
      const slotStart = new Date(date);
      slotStart.setHours(slot.h, slot.m, 0, 0);
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + requiredMinutes);

      // Past closing time?
      if (slotEnd > closingTime) continue;

      // Past current time if it's today?
      if (slotStart <= new Date()) continue;

      // Is there at least one employee free?
      const freeEmp = employees.find(emp => isSlotAvailableForEmployee(emp.id, slotStart, slotEnd));
      if (freeEmp) {
        validSlots.push(slot);
      }
    }

    return validSlots;
  };

  /* ── Submit booking ── */
  const submitBooking = async (payload: BookingPayload): Promise<void> => {
    const { serviceId, date, timeSlot, name, contact, totalPrice, totalDuration, ticketDetails } = payload;

    if (!name.trim() || !contact.trim() || !serviceId) {
      throw new Error('Por favor completa todos los campos.');
    }

    // 1. Upsert customer
    const isEmail = contact.includes('@') && contact.includes('.');
    let customerId: string;

    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('project_id', PROJECT_ID)
      .eq(isEmail ? 'email' : 'phone', contact.trim())
      .maybeSingle();

    if (existing) {
      customerId = existing.id;
    } else {
      const { data: newCust, error: custErr } = await supabase
        .from('customers')
        .insert({
          project_id: PROJECT_ID,
          name: name.trim(),
          email: isEmail ? contact.trim() : null,
          phone: !isEmail ? contact.trim() : null,
        })
        .select('id')
        .single();
      if (custErr || !newCust) throw new Error('No se pudo registrar tu contacto.');
      customerId = newCust.id;
    }

    // 2. Build start/end times
    const start = new Date(date);
    start.setHours(timeSlot.h, timeSlot.m, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + totalDuration);

    // 3. Find available employee (Double check at insert time)
    const { data: employees } = await supabase.from('employees').select('id').eq('project_id', PROJECT_ID);
    let employeeId: string | null = null;

    for (const emp of employees ?? []) {
      const { data: conflicts } = await supabase
        .from('appointments')
        .select('id')
        .eq('employee_id', emp.id)
        .lt('start_time', end.toISOString())
        .gt('end_time', start.toISOString())
        .not('status', 'eq', 'cancelled');
        
      const { data: blocks } = await supabase
        .from('time_blocks')
        .select('id')
        .eq('employee_id', emp.id)
        .lt('start_time', end.toISOString())
        .gt('end_time', start.toISOString());

      if ((!conflicts || conflicts.length === 0) && (!blocks || blocks.length === 0)) {
        employeeId = emp.id;
        break;
      }
    }

    if (!employeeId) throw new Error('Ya no hay horarios disponibles en ese momento. Alguien más pudo haberlo tomado.');

    // 4. Create appointment
    const { error: apptErr } = await supabase.from('appointments').insert({
      project_id: PROJECT_ID,
      customer_id: customerId,
      service_id: serviceId,
      employee_id: employeeId,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: 'pending_advance',
      total_price: totalPrice,
      total_duration: totalDuration,
      ticket_details: ticketDetails,
    });

    if (apptErr) throw new Error('Error al crear la cita. Intenta de nuevo.');
  };

  return {
    services,
    timeSlots,
    loadingServices,
    loadingSettings,
    businessSettings,
    fetchAvailableSlots,
    submitBooking,
  };
}

// ── Helpers ─────────────────────────────────────────────────
function buildSlots(openingHour: string, closingHour: string): TimeSlot[] {
  const [startH, startM] = openingHour.split(':').map(Number);
  const [endH, endM] = closingHour.split(':').map(Number);
  const slots: TimeSlot[] = [];
  let cur = new Date(0, 0, 0, startH, startM);
  const end = new Date(0, 0, 0, endH, endM);
  while (cur < end) {
    slots.push({ label: format(cur, 'h:mm a'), h: cur.getHours(), m: cur.getMinutes() });
    cur = new Date(cur.getTime() + 30 * 60 * 1000);
  }
  return slots;
}
