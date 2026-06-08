'use client';

import { useState, useEffect, useMemo } from 'react';
import { useServices } from '@/hooks/useServices';
import { useAppointments } from '@/hooks/useAppointments';
import { useCustomers } from '@/hooks/useCustomers';
import { useEmployees } from '@/hooks/useEmployees';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { format, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/components/ui/ToastProvider';

interface FormData {
  name: string;
  contact: string; // email or phone/WhatsApp
  serviceId: string;
  date: Date;
  timeSlot: { label: string; h: number; m: number };
}

export default function AppointmentForm() {
  const toast = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    contact: '',
    serviceId: '',
    date: new Date(),
    timeSlot: { label: '10:00 a.m.', h: 10, m: 0 },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPending, setPaymentPending] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [appointmentIdToConfirm, setAppointmentIdToConfirm] = useState<string | null>(null);

  const { services, isLoading: loadingServices } = useServices();
  const { createAppointment, updateAppointment, refetch, checkEmployeeAvailability } = useAppointments();
  const { customers, isLoading: loadingCustomers, createCustomer } = useCustomers();
  const { employees, isLoading: loadingEmployees } = useEmployees();
  const { activeProject } = useApp();

  const [businessSettings, setBusinessSettings] = useState<{
    max_employees: number;
    opening_hour: string;
    closing_hour: string;
    working_days: number[];
  } | null>(null);
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

  // Dynamic Time slots based on business settings
  const TIME_SLOTS = useMemo(() => {
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
  }, [businessSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.contact || !formData.serviceId || !activeProject?.id) {
      setSubmitStatus('error');
      setSubmitMessage('Por favor completa todos los campos.');
      return;
    }

    if (loadingServices || loadingCustomers || loadingEmployees || !services.length || !employees.length) {
      setSubmitStatus('error');
      setSubmitMessage('No hay servicios o empleadas disponibles actualmente. Por favor intenta más tarde.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('loading');

    try {
      // Step 0: Validate working day
      if (businessSettings) {
        const dayOfWeek = formData.date.getDay();
        if (!businessSettings.working_days.includes(dayOfWeek)) {
          setSubmitStatus('error');
          setSubmitMessage('Lo sentimos, el día seleccionado no es un día laboral. Por favor, elige otra fecha.');
          return;
        }
      }

      // Step 1: Find or create customer
      let customerId = '';

      const existingCustomer = customers.find(c =>
        (c.email && c.email.toLowerCase() === formData.contact.toLowerCase().trim()) ||
        (c.phone && c.phone === formData.contact.trim())
      );

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const isEmail = formData.contact.includes('@') && formData.contact.includes('.');
        
        // CORRECCIÓN AQUÍ: Se limpian propiedades no permitidas por 'CreateCustomerInput' (como birthday)
        const newCustomer = await createCustomer({
          name: formData.name,
          email: isEmail ? formData.contact.trim() : null,
          phone: !isEmail ? formData.contact.trim() : null,
          service_notes: null,
          birthday: null,
          allergies: null,
          color_formulas: null,
        });

        if (newCustomer) {
          customerId = newCustomer.id;
        } else {
          throw new Error('No se pudo crear el registro de clienta');
        }
      }

      // Calculate start and end times FIRST
      const start = new Date(formData.date);
      start.setHours(formData.timeSlot.h, formData.timeSlot.m, 0, 0);

      const service = services.find(s => s.id === formData.serviceId);
      const duration = service ? service.duration_minutes : 60;
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + duration);

      // Step 2: Find an available employee
      let selectedEmployeeId = '';
      for (const emp of employees) {
        const { available } = await checkEmployeeAvailability(emp.id, start, end);
        if (available) {
          selectedEmployeeId = emp.id;
          break;
        }
      }

      if (!selectedEmployeeId) {
        throw new Error('Lo sentimos, no hay empleadas disponibles en el horario seleccionado. Por favor, intenta con otra hora o fecha.');
      }

      // Step 3: Create appointment with pending_advance status
      const payload = {
        project_id: activeProject.id,
        customer_id: customerId,
        service_id: formData.serviceId,
        employee_id: selectedEmployeeId,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        status: 'pending_advance' as const,
        ticket_details: null,
        total_price: service ? service.price : 0,
        total_duration: duration
      };

      const result = await createAppointment(payload);

      if (result) {
        setIsSubmitting(false);
        setSubmitStatus('success');
        setSubmitMessage('¡Tu solicitud ha sido recibida! Ahora procede con el anticipo para confirmar tu cita.');
        setAppointmentIdToConfirm(result.id);
        setShowPaymentModal(true);
        // Reset form
        setFormData({
          name: '',
          contact: '',
          serviceId: '',
          date: new Date(),
          timeSlot: TIME_SLOTS[4] || { label: '10:00 a.m.', h: 10, m: 0 }
        });
      } else {
        throw new Error('Error desconocido al crear la cita');
      }
    } catch (error: any) {
      setIsSubmitting(false);
      setSubmitStatus('error');
      setSubmitMessage(error.message || 'Hubo un error al procesar tu solicitud. Por favor intenta nuevamente.');
    }
  };

  // Simulate payment processing
  const handlePayment = async () => {
    setPaymentPending(true);
    setPaymentMessage('Procesando pago...');
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (appointmentIdToConfirm) {
      try {
        await updateAppointment(appointmentIdToConfirm, { status: 'confirmed' as any });
        setPaymentMessage('¡Pago exitoso! Tu cita está confirmada.');
        setTimeout(() => {
          setShowPaymentModal(false);
          setPaymentPending(false);
          setAppointmentIdToConfirm(null);
          refetch();
        }, 1500);
      } catch (err: any) {
        setPaymentMessage('Error al procesar el pago. Por favor intenta nuevamente.');
        setPaymentPending(false);
      }
    }
  };

  return (
    <>
      {/* Form Card */}
      <section className="mb-12">
        <div className="bg-fondo-zen/80 backdrop-blur-sm rounded-3xl p-8 w-full max-w-none border border-secundario-zen/50">
          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-accent-sage/20 rounded-xl border border-accent-sage/50">
              <p className="text-primario-zen font-semibold">{submitMessage}</p>
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50/20 rounded-xl border border-red-50/50">
              <p className="text-red-600 font-semibold">{submitMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
                Nombre completo
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-secundario-zen/20 border border-secundario-zen/60 text-primario-zen text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primario-zen/30 transition-all"
                placeholder="Tu nombre completo"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
                Correo electrónico o WhatsApp
              </label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                className="w-full bg-secundario-zen/20 border border-secundario-zen/60 text-primario-zen text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primario-zen/30 transition-all"
                placeholder="ej: ejemplo@email.com o +52 1 55 1234 5678"
                required
              />
            </div>

            {!loadingServices && services.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
                  Servicio
                </label>
                <select
                  value={formData.serviceId}
                  onChange={(e) => setFormData(prev => ({ ...prev, serviceId: e.target.value }))}
                  className="w-full bg-secundario-zen/20 border border-secundario-zen/60 text-primario-zen text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primario-zen/30 transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">Selecciona un servicio...</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.duration_minutes} min - ${service.price})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {loadingServices && (
              <div className="flex justify-center py-4">
                <p className="text-primario-zen/50">Cargando servicios...</p>
              </div>
            )}

            {!loadingServices && services.length === 0 && (
              <div className="flex justify-center py-4">
                <p className="text-primario-zen/50 text-center">
                  No hay servicios disponibles actualmente
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
                Fecha
              </label>
              <input
                type="date"
                value={format(formData.date, 'yyyy-MM-dd')}
                onChange={(e) => {
                  if (!e.target.value) return;
                  const date = new Date(e.target.value + 'T00:00:00');
                  setFormData(prev => ({ ...prev, date }));
                }}
                className="w-full bg-secundario-zen/20 border border-secundario-zen/60 text-primario-zen text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primario-zen/30 transition-all"
                min={format(startOfDay(new Date()), 'yyyy-MM-dd')}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
                Hora de inicio
              </label>
              <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                {TIME_SLOTS.map((slot) => (
                  <button
                    type="button"
                    key={slot.label}
                    onClick={() => setFormData(prev => ({ ...prev, timeSlot: slot }))}
                    className={`py-2 rounded-xl text-xs font-medium transition-all border ${formData.timeSlot.label === slot.label
                        ? 'bg-primario-zen text-fondo-zen border-primario-zen font-bold'
                        : 'border-secundario-zen/50 text-primario-zen/70 hover:bg-secundario-zen/30'
                      }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={() => toast.info('Calendario', 'Para ver disponibilidad detallada, visita nuestro calendario completo')}
                className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/60 hover:text-primario-zen sm:w-auto w-full text-center sm:text-left"
              >
                Ver disponibilidad completa
              </button>

              <button
                type="submit"
                disabled={isSubmitting || loadingServices || loadingEmployees || !services.length || !employees.length}
                className="sm:w-auto w-full bg-primario-zen text-fondo-zen py-3.5 px-8 rounded-full uppercase tracking-widest text-xs font-semibold hover:bg-opacity-90 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting ? 'Agendando...' : 'Solicitar Cita'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-fondo-zen rounded-2xl p-8 w-full max-w-md shadow-xl border border-secundario-zen/50">
            <h2 className="text-primario-zen font-serif text-xl mb-4 uppercase tracking-widest text-center">
              Pago de Anticipo
            </h2>
            <p className="text-primario-zen/70 text-center mb-6">
              Para confirmar tu cita, se requiere un anticipo del 50% del total del servicio.
              El monto será descontado del pago final el día de tu cita.
            </p>
            <div className="mb-4 p-4 bg-accent-sage/20 rounded-xl border border-accent-sage/50">
              <p className="text-primario-zen font-semibold">{paymentMessage || 'Esperando el pago del anticipo...'}</p>
            </div>
            {appointmentIdToConfirm && (
              <button
                onClick={handlePayment}
                disabled={paymentPending}
                className="w-full bg-primario-zen text-fondo-zen py-3 rounded-full uppercase tracking-widest text-xs font-semibold hover:bg-opacity-90 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center"
              >
                {paymentPending ? 'Procesando...' : 'Pagar Anticipo (50%)'}
              </button>
            )}
            <button
              onClick={() => {
                setShowPaymentModal(false);
                setAppointmentIdToConfirm(null);
              }}
              className="mt-4 w-full text-primario-zen/60 hover:text-primario-zen text-sm transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}