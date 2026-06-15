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
   * Obtiene los slots de tiempo y los marca como ocupados si chocan con citas existentes.
   */
  const getDailySlots = async (date: Date) => {
    // 1. Generate base slots
    const openingHour = businessSettings?.opening_hour ?? '09:00';
    const closingHour = businessSettings?.closing_hour ?? '20:00';
    const startHour = parseInt(openingHour.split(':')[0]);
    const startMin = parseInt(openingHour.split(':')[1]);
    const endHour = parseInt(closingHour.split(':')[0]);
    const endMin = parseInt(closingHour.split(':')[1]);
    
    const slots: any[] = [];
    let current = new Date(date);
    current.setHours(startHour, startMin, 0, 0);
    const end = new Date(date);
    end.setHours(endHour, endMin, 0, 0);
    
    const nowTime = new Date().getTime();
    
    while (current < end) {
      const slotTime = current.getTime();
      slots.push({
        label: format(current, 'h:mm a'),
        h: current.getHours(),
        m: current.getMinutes(),
        time: slotTime,
        isOccupied: slotTime <= nowTime // Disable if the slot is in the past
      });
      current = new Date(current.getTime() + 30 * 60000);
    }

    // 2. Fetch appointments for this day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('start_time, end_time, status, created_at')
        .eq('project_id', PROJECT_ID)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .not('status', 'eq', 'cancelled');

      if (error) throw error;

      if (appointments && appointments.length > 0) {
        // Filtra citas pending_advance expiradas
        const validAppointments = appointments.filter(appt => {
          if (appt.status === 'pending_advance') {
            const createdAt = new Date(appt.created_at).getTime();
            const graceMs = (businessSettings?.advance_grace_period_hours ?? 2) * 3600000;
            if (new Date().getTime() > createdAt + graceMs) {
              return false; // Ignore because grace period expired
            }
          }
          return true;
        });

        // Mark overlapping slots as occupied
        slots.forEach(slot => {
          const slotStart = slot.time;
          const slotEnd = slotStart + (30 * 60000); // Assume each slot represents a 30m block

          for (const appt of validAppointments) {
            const apptStart = new Date(appt.start_time).getTime();
            const apptEnd = new Date(appt.end_time).getTime();
            
            // If the slot overlaps with the appointment, mark as occupied
            if (slotStart < apptEnd && slotEnd > apptStart) {
              slot.isOccupied = true;
              break;
            }
          }
        });
      }
    } catch (err: any) {
      console.error("Error fetching daily appointments:", err?.message || err);
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

    // 2. Upsert customer securely via RPC
    const isEmail = contact.includes('@') && contact.includes('.');
    
    const { data: customerId, error: custErr } = await supabase.rpc('get_or_create_customer', {
      p_project_id: PROJECT_ID,
      p_name: name.trim(),
      p_email: isEmail ? contact.trim() : null,
      p_phone: !isEmail ? contact.trim() : null
    });

    if (custErr || !customerId) {
      console.error(custErr);
      throw new Error('No se pudo registrar tu contacto por razones de seguridad.');
    }

    // 3. Build start/end times
    const start = new Date(date);
    start.setHours(timeSlot.h, timeSlot.m, 0, 0);
    const duration = totalDuration || 60;
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + duration);

    // 4. Find available employee (simplified logic for now)
    const { data: employees } = await supabase.from('employees').select('id').eq('project_id', PROJECT_ID);
    let employeeId: string | null = employees && employees.length > 0 ? employees[0].id : null;

    if (!employeeId) throw new Error('No hay personal configurado para atender la cita.');

    // 5. Create appointment
    const { data: newAppt, error: apptErr } = await supabase.from('appointments').insert({
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
    }).select('id').single();

    if (apptErr) {
      console.error(apptErr);
      throw new Error('Error al crear la cita. Intenta de nuevo.');
    }
    
    return newAppt.id;
  };

  const markProofSent = async (appointmentId: string, proofUrl?: string) => {
    // Marcamos que se envió comprobante. Podemos guardarlo en ticket_details o en payment_proof_url
    const updatePayload: any = {};
    if (proofUrl) {
      updatePayload.payment_proof_url = proofUrl;
    }
    
    // Obtener ticket details actuales para no sobreescribir
    const { data: appt } = await supabase.from('appointments').select('ticket_details').eq('id', appointmentId).single();
    
    const currentTicket = appt?.ticket_details || {};
    updatePayload.ticket_details = { ...currentTicket, payment_proof_sent: true };

    const { error } = await supabase.from('appointments').update(updatePayload).eq('id', appointmentId);
    if (error) throw error;
  };

  return {
    businessSettings,
    loadingSettings,
    getDailySlots,
    submitBooking,
    markProofSent,
  };
}
