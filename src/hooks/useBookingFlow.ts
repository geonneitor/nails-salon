'use client';

import { useState, useEffect } from 'react';
import { useServices } from '@/hooks/useServices';
import { useAppointments } from '@/hooks/useAppointments';
import { useCustomers } from '@/hooks/useCustomers';
import { useEmployees } from '@/hooks/useEmployees';
import { useApp } from '@/context/AppContext';
import { createClient } from '@/utils/supabase/client'; // Adjust based on actual project path
import { format, startOfDay } from 'date-fns';

const supabase = createClient();

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
        const { data } = await supabase
          .from('business_settings')
          .select('*')
          .eq('project_id', activeProject.id)
          .single();
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
    if (!formData.name || !formData.contact || !formData.serviceId || !activeProject?.id) {
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
      const newCustomer = await createCustomer({
        name: formData.name,
        email: isEmail ? formData.contact : null,
        phone: !isEmail ? formData.contact : null,
        project_id: activeProject.id
      });
      if (!newCustomer) throw new Error('No se pudo crear el registro de clienta');
      customerId = newCustomer.id;
    }

    // 3. Timing
    const start = new Date(formData.date);
    start.setHours(formData.timeSlot.h, formData.timeSlot.m, 0, 0);
    const service = services.find(s => s.id === formData.serviceId);
    const duration = service ? service.duration_minutes : 60;
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
    const result = await createAppointment({
      project_id: activeProject.id,
      customer_id: customerId,
      service_id: formData.serviceId,
      employee_id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: 'pending_advance',
      total_price: service ? service.price : 0,
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
