'use client';

// ============================================================
// src/components/calendar/NewAppointmentModal.tsx
// Formulario premium para crear una nueva cita (Flujo Directo).
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, UserPlus, Search, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { format, addMinutes, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCustomers } from '@/hooks/useCustomers';
import { useEmployees } from '@/hooks/useEmployees';
import { useDynamicServices } from '@/hooks/useDynamicServices';
import { DynamicServiceSelector } from '@/components/booking/DynamicServiceSelector';
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
  '#8A9A5B', // Verde Musgo (Moss Green)
  '#D4A373', // Arena / Terracota (Sand/Terracotta)
  '#A78A7F', // Rosa Apagado (Muted Rose)
  '#6D6875', // Morado Pizarra (Slate Purple)
  '#7C98B3', // Azul Polvo (Dusty Blue)
  '#E5989B', // Coral Suave (Soft Coral)
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
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  
  const [employeeId, setEmployeeId] = useState('');
  
  // Dynamic Services State
  const { categories, variants, modifiers, isLoading: isServicesLoading } = useDynamicServices();
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, number>>({});

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
      setSelectedCategoryIds([]);
      setSelectedVariants({});
      setSelectedModifiers({});
      setBookingColor(BOOKING_COLORS[0]);
      setError(null);
      setQuickName('');
      setQuickPhone('');
    }
  }, [isOpen, defaultEmployeeId]);

  // Set default variants when category is selected
  useEffect(() => {
    setSelectedVariants(prev => {
      const next = { ...prev };
      let changed = false;
      selectedCategoryIds.forEach(catId => {
        if (!next[catId]) {
          const defaultVar = variants.find(v => v.category_id === catId && v.is_active);
          if (defaultVar) {
            next[catId] = defaultVar.id;
            changed = true;
          }
        }
      });
      return changed ? next : prev;
    });
  }, [selectedCategoryIds, variants]);

  // Compute current total
  const currentTotal = useMemo(() => {
    let price = 0;
    let duration = 0;
    let names: string[] = [];

    selectedCategoryIds.forEach(catId => {
      const cat = categories.find(c => c.id === catId);
      if (cat) {
        names.push(cat.name);
        const varId = selectedVariants[catId];
        if (varId) {
          const v = variants.find(v => v.id === varId);
          if (v) {
            price += v.base_price;
            duration += v.base_duration_minutes;
            if (v.name !== "Base") names.push(`  + ${v.name}`);
          }
        }
      }
    });

    Object.entries(selectedModifiers).forEach(([modId, qty]) => {
      const m = modifiers.find(x => x.id === modId);
      if (m && qty > 0) {
        price += m.price_delta * qty;
        duration += m.duration_delta * qty;
        names.push(`${m.name}${qty > 1 ? ` (x${qty})` : ''}`);
      }
    });

    return { price, duration, names };
  }, [selectedCategoryIds, selectedVariants, selectedModifiers, categories, variants, modifiers]);

  const handleQuickAddCustomer = async () => {
    if (!quickName.trim() || !quickPhone.trim()) {
      setError('Por favor ingresa nombre y WhatsApp para el alta rápida.');
      return;
    }
    setSubmitting(true);
    const newCustomer = await createCustomer({
      name: quickName.trim(),
      phone: quickPhone.trim(),
      email: null,
      service_notes: null,
      birthday: null,
      allergies: null,
      color_formulas: null,
    });
    setSubmitting(false);

    if (newCustomer) {
      setCustomerId(newCustomer.id);
      setCustomerSearch(newCustomer.name);
      setIsAddingCustomer(false);
      setQuickName('');
      setQuickPhone('');
    } else {
      setError('No se pudo guardar la clienta rápida.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerId || !employeeId) {
      setError('Por favor selecciona una clienta y una empleada.');
      return;
    }

    if (selectedCategoryIds.length === 0) {
      setError('Por favor selecciona al menos una categoría de servicio.');
      return;
    }

    const start = defaultDate;
    const end = addMinutes(start, currentTotal.duration > 0 ? currentTotal.duration : 60);

    const finalTicketDetails: TicketDetails = {
      activeServices: currentTotal.names,
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
      total_price: currentTotal.price,
      total_duration: currentTotal.duration,
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
            className="relative w-full md:max-w-lg bg-surface-container-lowest rounded-t-2xl md:rounded-2xl shadow-2xl border border-secundario-zen/50 p-5 md:p-6 max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4 shrink-0">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primario-zen/50 font-semibold mb-0.5">
                  {format(defaultDate, "EEEE, d 'de' MMMM · h:mm a", { locale: es })}
                </p>
                <h2 className="font-serif text-primario-zen text-xl tracking-wide">
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
                      <DynamicServiceSelector
                        categories={categories}
                        variants={variants}
                        modifiers={modifiers}
                        selectedCategoryIds={selectedCategoryIds}
                        onChangeCategoryIds={setSelectedCategoryIds}
                        selectedVariants={selectedVariants}
                        onChangeVariants={setSelectedVariants}
                        selectedModifiers={selectedModifiers}
                        onChangeModifiers={setSelectedModifiers}
                      />
                    </div>

                    {/* Resumen Final en Paso 1 */}
                    <div className="bg-secundario-zen/30 rounded-2xl p-4 text-sm text-primario-zen/80 border border-secundario-zen/50 font-sans shrink-0">
                      <div className="flex justify-between items-center">
                        <p><span className="font-semibold">Tiempo total estimado</span></p>
                        <p>{currentTotal.duration} min</p>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="font-semibold">Costo base aproximado</p>
                        <p className="font-semibold">${currentTotal.price} MXN</p>
                      </div>
                    </div>

                    <div className="flex justify-end mt-2 shrink-0">
                      <button
                        type="button"
                        data-tour="next-step-btn"
                        onClick={() => setStep(2)}
                        disabled={selectedCategoryIds.length === 0}
                        className="bg-primario-zen text-fondo-zen px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Siguiente paso <ChevronRight className="w-3.5 h-3.5" />
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

                        <AnimatePresence>
                          {isAddingCustomer && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex flex-col gap-3 p-4 rounded-xl bg-secundario-zen/20 border border-secundario-zen/50 overflow-hidden"
                            >
                              <p className="text-[10px] uppercase tracking-widest text-primario-zen/60 font-bold">Alta Rápida</p>
                              <input
                                type="text"
                                placeholder="Nombre completo"
                                className="w-full bg-fondo-zen border border-secundario-zen/40 text-primario-zen text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-primario-zen/40 transition-colors"
                                value={quickName}
                                onChange={e => setQuickName(e.target.value)}
                              />
                              <input
                                type="tel"
                                placeholder="WhatsApp (10 dígitos)"
                                className="w-full bg-fondo-zen border border-secundario-zen/40 text-primario-zen text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-primario-zen/40 transition-colors"
                                value={quickPhone}
                                onChange={e => setQuickPhone(e.target.value)}
                              />
                              <div className="flex justify-end gap-2 mt-1">
                                <button
                                  type="button"
                                  onClick={() => setIsAddingCustomer(false)}
                                  className="px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest font-bold text-primario-zen/60 hover:text-primario-zen hover:bg-secundario-zen/30 transition-all"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={handleQuickAddCustomer}
                                  disabled={submitting}
                                  className="px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest font-bold bg-primario-zen text-fondo-zen hover:bg-opacity-90 transition-all disabled:opacity-50"
                                >
                                  {submitting ? 'Guardando...' : 'Guardar y Usar'}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Empleado */}
                    {defaultEmployeeId ? (
                      <div className="flex flex-col gap-1.5 font-sans">
                        <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
                          Especialista
                        </label>
                        <div className="w-full bg-secundario-zen/10 border border-secundario-zen/30 text-primario-zen text-sm rounded-xl px-4 py-2.5 font-medium flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primario-zen/50"></div>
                          {employees.find(e => e.id === employeeId)?.name || 'Especialista'}
                        </div>
                      </div>
                    ) : (
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
                    )}

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

                    <div className="flex justify-between items-center mt-2 pt-4 border-t border-secundario-zen/40 shrink-0">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="border border-primario-zen/40 text-primario-zen px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-secundario-zen/20 transition-all flex items-center gap-1.5"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Atrás
                      </button>

                      <button
                        id="submit-new-appointment"
                        type="submit"
                        data-tour="confirm-btn"
                        disabled={submitting || !customerId || !employeeId}
                        className="bg-primario-zen text-fondo-zen px-5 py-2.5 rounded-full uppercase tracking-widest text-[10px] font-bold hover:bg-opacity-90 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 font-sans"
                      >
                        {submitting ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Agendando…</>
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
        </div>
      )}
    </AnimatePresence>
  );
}
