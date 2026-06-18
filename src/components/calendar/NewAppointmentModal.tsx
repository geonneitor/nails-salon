'use client';

// ============================================================
// src/components/calendar/NewAppointmentModal.tsx
// Formulario premium para crear una nueva cita (Flujo Directo).
// ============================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, UserPlus, Search, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { format, addMinutes, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCustomers } from '@/hooks/useCustomers';
import { useEmployees } from '@/hooks/useEmployees';
import { NailMenuCalculator } from '@/components/booking/NailMenuCalculator';
import { CustomerFormModal } from '@/components/customers/CustomerFormModal';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabaseClient';
import type { CreateAppointmentPayload, TicketDetails } from '@/types/supabase';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate: Date; // Incluye la hora exacta seleccionada
  defaultEmployeeId?: string;
  onSubmit: (payload: CreateAppointmentPayload) => Promise<unknown>;
}

const BOOKING_COLORS = [
  '#4ade80', // green
  '#fbbf24', // yellow
  '#60a5fa', // blue
  '#a78bfa', // purple
  '#f87171', // red
  '#a3e635', // lime
  '#2dd4bf', // teal
  '#f472b6', // pink
];

/** Campo de formulario reutilizable */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 font-sans">
      <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
        {label}
      </label>
      {children}
    </div>
  );
}

const SELECT_CLASS =
  'w-full bg-secundario-zen/20 border border-secundario-zen/60 text-primario-zen text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primario-zen/30 transition-all appearance-none cursor-pointer font-sans';

export function NewAppointmentModal({
  isOpen,
  onClose,
  defaultDate,
  defaultEmployeeId,
  onSubmit,
}: NewAppointmentModalProps) {
  const { customers, isLoading: loadingC, createCustomer } = useCustomers();
  const { employees, isLoading: loadingE } = useEmployees();
  const { activeProject } = useApp();
  const projectId = activeProject?.id || process.env.NEXT_PUBLIC_PROJECT_ID || '489e898d-3b2a-4775-b784-93a0e1a473e0';

  const [step, setStep] = useState<1 | 2>(1);

  const [customerId, setCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  
  const [employeeId, setEmployeeId] = useState('');
  const [ticketDetails, setTicketDetails] = useState<TicketDetails | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [bookingColor, setBookingColor] = useState<string>(BOOKING_COLORS[0]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Al abrir el modal, resetear estados e inicializar el empleado si viene en props
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCustomerId('');
      setCustomerSearch('');
      setEmployeeId(defaultEmployeeId || '');
      setTicketDetails(null);
      setTotalPrice(0);
      setTotalDuration(0);
      setBookingColor(BOOKING_COLORS[0]);
      setError(null);
    }
  }, [isOpen, defaultEmployeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerId || !employeeId) {
      setError('Por favor selecciona una clienta y una empleada.');
      return;
    }

    if (!ticketDetails || ticketDetails.activeServices.length === 0) {
      setError('Por favor selecciona al menos una categoría de servicio y cotiza.');
      return;
    }

    const start = defaultDate;
    const end = addMinutes(start, totalDuration > 0 ? totalDuration : 60);

    const finalTicketDetails: TicketDetails = {
      ...ticketDetails,
      booking_color: bookingColor,
    };

    setSubmitting(true);
    const result = await onSubmit({
      project_id: projectId,
      customer_id: customerId,
      service_id: null,
      employee_id: employeeId,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: 'pending_advance',
      ticket_details: finalTicketDetails,
      total_price: totalPrice,
      total_duration: totalDuration,
    });
    setSubmitting(false);

    if (result) {
      onClose();
    } else {
      setError('No se pudo agendar la cita. Verifica que no haya un conflicto de horario.');
    }
  };

  const isDataLoading = loadingC || loadingE;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center md:items-center">
          {/* Backdrop */}
          <motion.div
            key="nb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-primario-zen/20 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            key="np"
            initial={{ opacity: 0, y: 50, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="relative w-full md:max-w-xl bg-surface-container-lowest rounded-t-3xl md:rounded-3xl shadow-2xl border border-secundario-zen/50 p-6 md:p-8 max-h-[95vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6 shrink-0">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primario-zen/40 font-semibold mb-1">
                  {format(defaultDate, "EEEE, d 'de' MMMM · h:mm a", { locale: es })}
                </p>
                <h2 className="font-serif text-primario-zen text-2xl tracking-wide">
                  Nueva Cita
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar formulario"
                className="p-2 rounded-full text-primario-zen/40 hover:text-primario-zen hover:bg-secundario-zen/40 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isDataLoading ? (
              <div className="flex justify-center py-12 shrink-0">
                <Loader2 className="w-6 h-6 animate-spin text-primario-zen/50" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1 min-h-0">

                {/* PASO 1: SERVICIOS */}
                {step === 1 && (
                  <div className="flex flex-col gap-4 h-full overflow-hidden">
                    <div className="flex items-center justify-between shrink-0">
                      <h3 className="text-xs uppercase tracking-widest font-bold text-primario-zen/50">
                        Paso 1: Servicios
                      </h3>
                      <span className="text-xs text-primario-zen/40 font-medium font-sans">1 de 2</span>
                    </div>

                    {/* Cotizador Interactivo */}
                    <div data-tour="service-menu" className="flex-1 border border-secundario-zen/30 rounded-2xl p-4 bg-white/30 overflow-y-auto">
                      <NailMenuCalculator
                        value={ticketDetails}
                        onChange={({ ticketDetails: details, totalPrice: price, totalDuration: duration }) => {
                          setTicketDetails(details);
                          setTotalPrice(price);
                          setTotalDuration(duration);
                        }}
                      />
                    </div>

                    {/* Resumen Final en Paso 1 */}
                    <div className="bg-secundario-zen/30 rounded-2xl p-4 text-sm text-primario-zen/80 border border-secundario-zen/50 font-sans shrink-0">
                      <div className="flex justify-between items-center">
                        <p><span className="font-semibold">Tiempo total estimado</span></p>
                        <p>{totalDuration} min</p>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="font-semibold">Costo base aproximado</p>
                        <p className="font-semibold">${totalPrice} MXN</p>
                      </div>
                    </div>

                    <div className="flex justify-end mt-2 shrink-0">
                      <button
                        type="button"
                        data-tour="next-step-btn"
                        onClick={() => setStep(2)}
                        disabled={!ticketDetails || ticketDetails.activeServices.length === 0}
                        className="bg-primario-zen text-fondo-zen px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Siguiente paso <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* PASO 2: CLIENTA Y DETALLES FINAL */}
                {step === 2 && (
                  <div className="flex flex-col gap-5 h-full overflow-y-auto pr-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs uppercase tracking-widest font-bold text-primario-zen/50">
                        Paso 2: Clienta y Detalles
                      </h3>
                      <span className="text-xs text-primario-zen/40 font-medium font-sans">2 de 2</span>
                    </div>

                    {/* Cliente */}
                    <div className="flex flex-col gap-1.5 font-sans">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
                          Cliente
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsAddingCustomer(true)}
                          className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-primario-zen hover:text-primario-zen/70 transition-colors"
                        >
                          <UserPlus className="w-3 h-3" /> Nueva clienta
                        </button>
                      </div>
                      <div className="relative flex flex-col gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primario-zen/40" />
                          <input
                            type="text"
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            className={SELECT_CLASS}
                            placeholder="Buscar clienta..."
                          />
                        </div>

                        <div className="max-h-40 overflow-y-auto rounded-xl border border-secundario-zen/50 bg-white/50 backdrop-blur-sm">
                          {customers
                            .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()))
                            .map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setCustomerId(c.id);
                                  setCustomerSearch(c.name);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors font-sans flex flex-col ${
                                  customerId === c.id
                                    ? 'bg-primario-zen text-fondo-zen font-semibold'
                                    : 'text-primario-zen hover:bg-secundario-zen/30'
                                }`}
                              >
                                <span>{c.name}</span>
                                {c.phone && <span className="text-xs opacity-70">{c.phone}</span>}
                              </button>
                            ))
                          }

                          {customerSearch &&
                            customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).length === 0 && (
                            <button
                              type="button"
                              onClick={() => setIsAddingCustomer(true)}
                              className="w-full text-left px-4 py-3 text-xs text-primario-zen/60 hover:text-primario-zen flex items-center gap-2 font-sans italic"
                            >
                              <UserPlus className="w-3 h-3" />
                              No encontrada. Agregar nueva clienta...
                            </button>
                          )}

                          {!customerSearch && customers.length > 0 && (
                            <p className="px-4 py-2 text-[10px] text-primario-zen/40 uppercase tracking-widest font-semibold">
                              Selecciona una clienta de la lista
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Empleado */}
                    <Field label="Empleada">
                      <select
                        id="new-appt-employee"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        className={SELECT_CLASS}
                        required
                      >
                        <option value="">Selecciona una empleada…</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                      {employees.length === 0 && (
                        <p className="text-xs text-primario-zen/50 mt-0.5">
                          Primero agrega empleadas en Settings.
                        </p>
                      )}
                    </Field>

                    {/* Selector de Color */}
                    <div className="flex flex-col gap-2 font-sans mb-2">
                      <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
                        Booking color
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {BOOKING_COLORS.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setBookingColor(color)}
                            className="w-8 h-8 rounded-full shadow-sm border border-black/10 flex items-center justify-center transition-transform hover:scale-110"
                            style={{ backgroundColor: color }}
                            aria-label={`Seleccionar color ${color}`}
                          >
                            {bookingColor === color && (
                              <Check className="w-4 h-4 text-white drop-shadow-md" strokeWidth={3} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-sans">
                        {error}
                      </p>
                    )}

                    <div className="flex justify-between items-center mt-2 pt-4 border-t border-secundario-zen/40">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="border border-primario-zen/40 text-primario-zen px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-secundario-zen/20 transition-all flex items-center gap-1.5"
                      >
                        <ChevronLeft className="w-4 h-4" /> Atrás
                      </button>

                      <button
                        id="submit-new-appointment"
                        type="submit"
                        data-tour="confirm-btn"
                        disabled={submitting || !customerId || !employeeId}
                        className="bg-primario-zen text-fondo-zen px-6 py-3.5 rounded-full uppercase tracking-widest text-xs font-semibold hover:bg-opacity-90 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 font-sans"
                      >
                        {submitting ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Agendando…</>
                        ) : (
                          'Confirmar Cita'
                        )}
                      </button>
                    </div>
                  </div>
                )}

              </form>
            )}
          </motion.div>
          
          {/* Modal secundario para creación de cliente */}
          <CustomerFormModal
            isOpen={isAddingCustomer}
            onClose={() => setIsAddingCustomer(false)}
            onSubmit={async (payload) => {
              const newCustomer = await createCustomer(payload);
              if (newCustomer) {
                setCustomerId(newCustomer.id);
                setCustomerSearch(newCustomer.name);
              }
              return newCustomer;
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
