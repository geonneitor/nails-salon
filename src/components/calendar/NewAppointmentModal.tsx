'use client';

// ============================================================
// src/components/calendar/NewAppointmentModal.tsx
// Formulario premium para crear una nueva cita.
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, UserPlus } from 'lucide-react';
import { format, addMinutes, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCustomers } from '@/hooks/useCustomers';
import { useServices } from '@/hooks/useServices';
import { useEmployees } from '@/hooks/useEmployees';
import { NailMenuCalculator } from '@/components/booking/NailMenuCalculator';
import type { CreateAppointmentPayload, TicketDetails } from '@/types/supabase';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate: Date;
  onSubmit: (payload: CreateAppointmentPayload) => Promise<unknown>;
}

// Slots de hora disponibles: 8am → 8pm cada 30 min
const TIME_SLOTS = Array.from({ length: 25 }, (_, i) => {
  const totalMinutes = 8 * 60 + i * 30;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return { label: format(setMinutes(setHours(new Date(), h), m), 'h:mm a'), h, m };
});

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

const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID ?? '';

export function NewAppointmentModal({
  isOpen,
  onClose,
  defaultDate,
  onSubmit,
}: NewAppointmentModalProps) {
  const { customers, isLoading: loadingC } = useCustomers();
  const { services, isLoading: loadingS } = useServices();
  const { employees, isLoading: loadingE } = useEmployees();

  const [customerId, setCustomerId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [ticketDetails, setTicketDetails] = useState<TicketDetails | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[4]); // 10:00 a.m. por defecto
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    const start = setMinutes(setHours(defaultDate, timeSlot.h), timeSlot.m);
    const end = addMinutes(start, totalDuration > 0 ? totalDuration : 60);

    setSubmitting(true);
    const result = await onSubmit({
      project_id: PROJECT_ID,
      customer_id: customerId,
      service_id: null,
      employee_id: employeeId,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: 'pending_advance',
      ticket_details: ticketDetails,
      total_price: totalPrice,
      total_duration: totalDuration,
    });
    setSubmitting(false);

    if (result) {
      // Reset y cerrar
      setCustomerId('');
      setEmployeeId('');
      setTicketDetails(null);
      setTotalPrice(0);
      setTotalDuration(0);
      onClose();
    } else {
      setError('No se pudo agendar la cita. Verifica que no haya un conflicto de horario.');
    }
  };

  const isDataLoading = loadingC || loadingS || loadingE;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
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
            className="relative w-full md:max-w-xl bg-[#FDFBEE] rounded-t-3xl md:rounded-3xl shadow-2xl border border-secundario-zen/50 p-6 md:p-8 max-h-[95vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primario-zen/40 font-semibold mb-1">
                  {format(defaultDate, "EEEE, d 'de' MMMM", { locale: es })}
                </p>
                <h2 className="font-serif text-primario-zen text-2xl tracking-wide">
                  Nueva Cita a la Carta
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
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primario-zen/50" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Cliente */}
                <Field label="Cliente">
                  <select
                    id="new-appt-customer"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className={SELECT_CLASS}
                    required
                  >
                    <option value="">Selecciona una clienta…</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {customers.length === 0 && (
                    <p className="text-xs text-primario-zen/50 flex items-center gap-1.5 mt-0.5">
                      <UserPlus className="w-3 h-3" />
                      Primero agrega clientes en la sección Customers.
                    </p>
                  )}
                </Field>

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

                {/* Cotizador Interactivo */}
                <div className="border-t border-secundario-zen/30 pt-4">
                  <NailMenuCalculator
                    value={ticketDetails}
                    onChange={({ ticketDetails: details, totalPrice: price, totalDuration: duration }) => {
                      setTicketDetails(details);
                      setTotalPrice(price);
                      setTotalDuration(duration);
                    }}
                  />
                </div>

                {/* Hora */}
                <Field label="Hora de inicio">
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        type="button"
                        key={slot.label}
                        onClick={() => setTimeSlot(slot)}
                        className={`py-2 rounded-xl text-xs font-medium transition-all border ${
                          timeSlot.label === slot.label
                            ? 'bg-primario-zen text-fondo-zen border-primario-zen font-bold'
                            : 'border-secundario-zen/50 text-primario-zen/70 hover:bg-secundario-zen/30'
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Resumen Final */}
                {totalPrice > 0 && (
                  <div className="bg-secundario-zen/30 rounded-2xl p-4 text-sm text-primario-zen/80 border border-secundario-zen/50 font-sans">
                    <p><span className="font-semibold">Resumen de Cita</span> · {totalDuration} min</p>
                    <p className="text-primario-zen/60 text-xs mt-0.5">
                      {timeSlot.label} → {format(addMinutes(setMinutes(setHours(defaultDate, timeSlot.h), timeSlot.m), totalDuration), 'h:mm a')}
                    </p>
                    <p className="font-semibold mt-2">${totalPrice} MXN</p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-sans">
                    {error}
                  </p>
                )}

                {/* Submit */}
                <button
                  id="submit-new-appointment"
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primario-zen text-fondo-zen py-3.5 rounded-full uppercase tracking-widest text-xs font-semibold hover:bg-opacity-90 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 font-sans"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Agendando…</>
                  ) : (
                    'Confirmar Cita'
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
