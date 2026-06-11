'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';

const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || 'bf2460b5-f50d-4b30-a780-b91f05e3096b';

export function useBookingFlow() {
  const [businessSettings, setBusinessSettings] = useState<any>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('business_settings')
          .select('*')
          .eq('project_id', PROJECT_ID)
          .maybeSingle();
        if (error && error.code !== 'PGRST116') throw error;
        if (data) setBusinessSettings(data);
      } catch (e) {
        console.error('Error fetching settings:', e);
      } finally {
        setLoadingSettings(false);
      }
    }
    fetchSettings();
  }, []);

  /**
   * Genera los slots de tiempo disponibles.
   * Siempre produce slots: usa los settings de BD o un fallback de 9am–8pm
   * para que la grilla nunca aparezca vacía por falta de configuración.
   */
  const getTimeSlots = () => {
    // Fallback to 9am–8pm when businessSettings haven't loaded from DB
    const openingHour = businessSettings?.opening_hour ?? '09:00';
    const closingHour = businessSettings?.closing_hour ?? '20:00';
    const startHour = parseInt(openingHour.split(':')[0]);
    const startMin = parseInt(openingHour.split(':')[1]);
    const endHour = parseInt(closingHour.split(':')[0]);
    const endMin = parseInt(closingHour.split(':')[1]);
    const slots = [];
    let current = new Date(0, 0, 0, startHour, startMin);
    const end = new Date(0, 0, 0, endHour, endMin);
    while (current < end) {
      slots.push({
        label: format(current, 'h:mm a'),
        h: current.getHours(),
        m: current.getMinutes(),
      });
      current.setMinutes(current.getMinutes() + 30);
    }
    return slots;
  };

  const submitBooking = async (formData: any) => {
    if (!formData.name || !formData.contact || !formData.ticketDetails) {
      throw new Error('Por favor completa todos los campos.');
    }

    const { date, timeSlot, name, contact, ticketDetails } = formData;
    const { totalPrice, totalDuration } = ticketDetails;

    // 1. Validate working day
    if (businessSettings) {
      const dayOfWeek = date.getDay();
      if (!businessSettings.working_days.includes(dayOfWeek)) {
        throw new Error('El día seleccionado no es un día laboral.');
      }
    }

    // 2. Upsert customer
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

    // 3. Build start/end times
    const start = new Date(date);
    start.setHours(timeSlot.h, timeSlot.m, 0, 0);
    const duration = totalDuration || 60;
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + duration);

    // 4. Find available employee
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

    if (!employeeId) throw new Error('Ya no hay horarios disponibles en ese momento.');

    // 5. Create appointment
    const { error: apptErr } = await supabase.from('appointments').insert({
      project_id: PROJECT_ID,
      customer_id: customerId,
      service_id: null,
      employee_id: employeeId,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: 'pending_advance',
      total_price: totalPrice,
      total_duration: duration,
      ticket_details: ticketDetails,
    });

    if (apptErr) throw new Error('Error al crear la cita. Intenta de nuevo.');
    
    return true;
  };

  return {
    businessSettings,
    loadingSettings,
    timeSlots: getTimeSlots(),
    submitBooking
  };
}
