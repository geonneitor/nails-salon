'use client';

import { useState, useEffect } from 'react';
import { useServices } from '@/hooks/useServices';
import { useAppointments } from '@/hooks/useAppointments';
import { useCustomers } from '@/hooks/useCustomers';
import { useEmployees } from '@/hooks/useEmployees';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';

export function useBookingFlow() {
  const { services, isLoading: loadingServices } = useServices();
  const { createAppointment, updateAppointment, checkEmployeeAvailability } = useAppointments();
  const { customers, createCustomer } = useCustomers();
  const { employees, isLoading: loadingEmployees } = useEmployees();
  const { activeProject } = useApp();

  const [businessSettings, setBusinessSettings] = useState<any>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      if (!activeProject?.id) return;
      try {
        const { data, error } = await supabase
          .from('business_settings')
          .select('*')
          .eq('project_id', activeProject.id)
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
  }, [activeProject]);

  const getTimeSlots = () => {
    if (!businessSettings) return [];
    const startHour = parseInt(businessSettings.opening_hour.split(':')[0]);
    const startMin = parseInt(businessSettings.opening_hour.split(':')[1]);
    const endHour = parseInt(businessSettings.closing_hour.split(':')[0]);
    const endMin = parseInt(businessSettings.closing_hour.split(':')[1]);
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
    if (!formData.name || !formData.contact || !formData.ticketDetails || !activeProject?.id) {
      throw new Error('Por favor completa todos los campos.');
    }

    // 1. Validate working day
    if (businessSettings) {
      const dayOfWeek = formData.date.getDay();
      if (!businessSettings.working_days.includes(dayOfWeek)) {
        throw new Error('El día seleccionado no es un día laboral.');
      }
    }

    // 2. Customer logic
    let customerId = '';
    const existingCustomer = customers.find(c =>
      (c.email && c.email.toLowerCase() === formData.contact.toLowerCase().trim()) ||
      (c.phone && c.phone === formData.contact.trim())
    );

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const isEmail = formData.contact.includes('@') && formData.contact.includes('.');
      
      // CORRECCIÓN 1: Se añaden las propiedades obligatorias exigidas por el tipo
      const newCustomer = await createCustomer({
        name: formData.name,
        email: isEmail ? formData.contact : null,
        phone: !isEmail ? formData.contact : null,
        birthday: null,
        service_notes: null,
        allergies: null,
        color_formulas: null,
      });
      if (!newCustomer) throw new Error('No se pudo crear el registro de clienta');
      customerId = newCustomer.id;
    }

    // 3. Timing
    const start = new Date(formData.date);
    start.setHours(formData.timeSlot.h, formData.timeSlot.m, 0, 0);
    const duration = formData.ticketDetails.totalDuration || 60;
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + duration);

    // 4. Employee availability
    let employeeId = '';
    for (const emp of employees) {
      const { available } = await checkEmployeeAvailability(emp.id, start, end);
      if (available) {
        employeeId = emp.id;
        break;
      }
    }
    if (!employeeId) throw new Error('No hay empleadas disponibles en este horario.');

    // 5. Create appointment
    // CORRECCIÓN 2 y 3: Se asocia correctamente 'employeeId' y se añade 'ticket_details'
    const result = await createAppointment({
      project_id: activeProject.id,
      customer_id: customerId,
      service_id: null,
      employee_id: employeeId,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: 'pending_advance',
      ticket_details: formData.ticketDetails,
      total_price: formData.ticketDetails.totalPrice || 0,
      total_duration: duration
    });

    if (!result) throw new Error('Error al crear la cita');
    return result;
  };

  return {
    services,
    loadingServices,
    loadingEmployees,
    businessSettings,
    loadingSettings,
    timeSlots: getTimeSlots(),
    submitBooking
  };
}