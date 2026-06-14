'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useBookingFlow } from '@/hooks/useBookingFlow';
import { useDynamicServices } from '@/hooks/useDynamicServices';
import { useToast } from '@/components/ui/ToastProvider';
import { useApp } from '@/context/AppContext';
import { RebookActions } from '@/components/booking/RebookActions';
import { supabase } from '@/lib/supabaseClient';
import {
  Sparkles, Shield, Heart, Scissors, Clock, Check,
  Plus, Minus, CalendarDays, BookOpen, User, Phone, CheckCircle, ArrowRight,
  Landmark, Upload, FileText, FileImage
} from 'lucide-react';

// ============================================================
// METADATOS DE DISEÑO
// ============================================================
const getCategoryMeta = (name: string) => {
  const normalized = name.toLowerCase().trim();
  
  if (normalized.includes('full set') || normalized.includes('acril')) {
    return {
      subtitle: 'Alargamiento y escultura con acrílico de autor.',
      icon: Sparkles,
      bgActive: 'bg-amber-50/50 dark:bg-amber-900/20',
      borderActive: 'border-amber-400 dark:border-amber-500',
    };
  }
  if (normalized.includes('gel') || normalized.includes('protec')) {
    return {
      subtitle: 'Fortalecimiento y brillo de alta duración.',
      icon: Shield,
      bgActive: 'bg-purple-50/50 dark:bg-purple-900/20',
      borderActive: 'border-purple-400 dark:border-purple-500',
    };
  }
  if (normalized.includes('pedi') || normalized.includes('pie')) {
    return {
      subtitle: 'Exfoliación profunda y masaje hidro-relajante.',
      icon: Scissors,
      bgActive: 'bg-blue-50/50 dark:bg-blue-900/20',
      borderActive: 'border-blue-400 dark:border-blue-500',
    };
  }
  if (normalized.includes('mani') || normalized.includes('mano')) {
    return {
      subtitle: 'Ritual clásico de embellecimiento y nutrición.',
      icon: Heart,
      bgActive: 'bg-emerald-50/50 dark:bg-emerald-900/20',
      borderActive: 'border-emerald-400 dark:border-emerald-500',
    };
  }
  return {
    subtitle: 'Personaliza tu ritual con nuestra selección.',
    icon: Sparkles,
    bgActive: 'bg-primary/10',
    borderActive: 'border-primary',
  };
};

export default function ZenBookingJourney() {
  const toast = useToast();
  const { categories, variants, modifiers, isLoading: isServicesLoading } = useDynamicServices();
  const { businessSettings, getDailySlots, submitBooking, markProofSent } = useBookingFlow();
  const { activeProject } = useApp();

  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  // Unified State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, number>>({});
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null);
  
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [createdAppointmentId, setCreatedAppointmentId] = useState<string | null>(null);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofSent, setProofSent] = useState(false);

  // Compute valid date options based on business settings
  const dateOptions = useMemo(() => {
    const options: Date[] = [];
    const workingDays = businessSettings?.working_days || [1, 2, 3, 4, 5, 6]; 
    
    let i = 0;
    while (options.length < 14) {
      const d = addDays(new Date(), i);
      if (workingDays.includes(d.getDay())) {
        options.push(d);
      }
      i++;
    }
    return options;
  }, [businessSettings]);

  // Ensure selectedDate is a valid working day
  useEffect(() => {
    if (dateOptions.length > 0 && !dateOptions.some(d => isSameDay(d, selectedDate))) {
      setSelectedDate(dateOptions[0]);
    }
  }, [dateOptions, selectedDate]);

  // Fetch real-time slots when date changes
  useEffect(() => {
    async function fetchSlots() {
      setLoadingSlots(true);
      try {
        const slots = await getDailySlots(selectedDate);
        setTimeSlots(slots);
        
        if (selectedTimeSlot) {
          const stillAvailable = slots.find(s => s.label === selectedTimeSlot.label && !s.isOccupied);
          if (!stillAvailable) setSelectedTimeSlot(null);
        }
      } catch (err) {
        console.error("Failed to load slots", err);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const activeCategories = categories.filter(c => c.is_active && c.selection_type !== 'add_on');
  const catVariants = useMemo(() => variants.filter(v => v.category_id === selectedCategoryId && v.is_active), [variants, selectedCategoryId]);
  const catModifiers = useMemo(() => modifiers.filter(m => m.category_id === selectedCategoryId && m.is_active), [modifiers, selectedCategoryId]);

  useEffect(() => {
    if (catVariants.length > 0) {
      setSelectedVariantId(catVariants[0].id);
    } else {
      setSelectedVariantId(null);
    }
  }, [selectedCategoryId, catVariants]);

  // Compute Totals
  const currentTotal = useMemo(() => {
    let price = 0;
    let duration = 0;
    let names: string[] = [];

    const cat = categories.find(c => c.id === selectedCategoryId);
    if (cat) names.push(cat.name);

    if (selectedVariantId) {
      const v = variants.find(v => v.id === selectedVariantId);
      if (v) {
        price += v.base_price;
        duration += v.base_duration_minutes;
        if (v.name !== "Base") names.push(v.name);
      }
    }

    Object.entries(selectedModifiers).forEach(([modId, qty]) => {
      const m = modifiers.find(x => x.id === modId);
      if (m && qty > 0) {
        price += m.price_delta * qty;
        duration += m.duration_delta * qty;
        names.push(`${m.name}${qty > 1 ? ` (x${qty})` : ''}`);
      }
    });

    return { price, duration, names };
  }, [selectedVariantId, selectedModifiers, selectedCategoryId, categories, variants, modifiers]);

  const handleModifierQuantity = (id: string, delta: number) => {
    setSelectedModifiers(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const handleCreateAppointment = async () => {
    if (!selectedCategoryId || !selectedTimeSlot || !name.trim() || !contact.trim()) {
      toast.error('Faltan datos', 'Por favor completa todos los campos requeridos.');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalNames = [...currentTotal.names];
      if (notes.trim()) {
        finalNames.push(`Notas: ${notes}`);
      }

      const newId = await submitBooking({
        ticketDetails: {
          activeServices: finalNames,
          totalPrice: currentTotal.price,
          totalDuration: currentTotal.duration,
        },
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        name,
        contact
      });
      setCreatedAppointmentId(newId);
      setStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      toast.error('Error', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !createdAppointmentId) return;

    setUploadingProof(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${createdAppointmentId}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      await markProofSent(createdAppointmentId, publicUrlData.publicUrl);
      setProofSent(true);
      toast.success('Comprobante recibido', 'Tu comprobante ha sido adjuntado con éxito.');
    } catch (err: any) {
      console.error(err);
      toast.error('Error al subir', 'No se pudo subir tu comprobante. Intenta mandarlo por WhatsApp.');
    } finally {
      setUploadingProof(false);
    }
  };

  const handleWhatsappProof = async () => {
    if (!createdAppointmentId) return;
    setUploadingProof(true);
    try {
      await markProofSent(createdAppointmentId);
      setProofSent(true);
      toast.success('Notificado', 'Se ha marcado que enviarás el comprobante vía WhatsApp.');
    } catch (err: any) {
      console.error(err);
    } finally {
      setUploadingProof(false);
    }
  };

  const isDataFormValid = name.trim().length > 2 && contact.trim().length > 5;
  const progressPercentage = ((step - 1) / 3) * 100;

  if (isServicesLoading) {
    return (
      <div className="flex justify-center items-center py-32 w-full">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto relative pb-12 pt-4 px-4 sm:px-6">
      
      {/* Barra de Progreso */}
      <div className="w-full max-w-2xl mx-auto mb-10">
        <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2">
          <span className={step >= 1 ? 'text-primary' : ''}>Servicios</span>
          <span className={step >= 2 ? 'text-primary' : ''}>Horario</span>
          <span className={step >= 3 ? 'text-primary' : ''}>Datos</span>
          <span className={step >= 4 ? 'text-primary' : ''}>Anticipo</span>
        </div>
        <div className="h-1.5 w-full bg-surface-variant/50 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary" 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* =========================================
            PASO 1: SERVICIOS Y COMPLEMENTOS
        ========================================= */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 md:gap-12 items-start"
          >
            {/* IZQUIERDA: Lista de Servicios (scroll natural) */}
            <div className="flex flex-col gap-6 w-full">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-serif text-2xl text-on-surface">Selecciona tu Servicio</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeCategories.map(c => {
                    const meta = getCategoryMeta(c.name);
                    const isSelected = selectedCategoryId === c.id;
                    return (
                      <motion.button
                        key={c.id}
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ y: -2 }}
                        animate={{ y: isSelected ? -2 : 0 }}
                        onClick={() => {
                          setSelectedCategoryId(c.id);
                          setSelectedModifiers({});
                        }}
                        className={`relative w-full text-left p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md
                          ${isSelected ? `${meta.bgActive} ${meta.borderActive}` : 'bg-surface-container-lowest border-outline-variant/30 hover:border-primary/50'}
                        `}
                      >
                        {isSelected && (
                          <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                          </div>
                        )}
                        <h3 className={`font-serif text-xl mb-2 pr-8 flex items-center gap-2 ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                          <motion.div animate={{ rotate: isSelected ? 4 : 0 }}>
                            {React.createElement(meta.icon, { className: 'w-4 h-4' })}
                          </motion.div>
                          {c.name}
                        </h3>
                        <p className="font-sans text-xs text-on-surface-variant font-light leading-relaxed mb-2">
                          {meta.subtitle}
                        </p>
                        
                        {/* Variantes */}
                        <AnimatePresence>
                          {isSelected && catVariants.length > 0 && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mt-2 pt-4 border-t border-primary/20 space-y-2"
                            >
                              <p className="text-[10px] uppercase tracking-widest font-bold text-primary/70 mb-2">Variantes</p>
                              {catVariants.map(v => (
                                <div 
                                  key={v.id}
                                  onClick={(e) => { e.stopPropagation(); setSelectedVariantId(v.id); }}
                                  className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                                    selectedVariantId === v.id ? 'bg-background border-primary/50 text-primary font-semibold' : 'border-transparent text-on-surface hover:bg-background/50'
                                  }`}
                                >
                                  <span className="truncate pr-2">{v.name}</span>
                                  <span className="whitespace-nowrap font-medium">${v.base_price}</span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>
              </section>

              {/* Complementos */}
              <AnimatePresence>
                {selectedCategoryId && catModifiers.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Plus className="w-5 h-5 text-primary" />
                      <h2 className="font-serif text-2xl text-on-surface">Complementos Adicionales</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {catModifiers.map(m => {
                        const qty = selectedModifiers[m.id] || 0;
                        const isSelected = qty > 0;
                        const isPerUnit = m.modifier_type === 'per_unit';

                        return (
                          <div 
                            key={m.id}
                            onClick={() => !isPerUnit && handleModifierQuantity(m.id, isSelected ? -1 : 1)}
                            className={`relative flex flex-col items-center justify-center text-center p-4 rounded-xl border transition-all cursor-pointer select-none
                              ${isSelected ? 'bg-primary/5 border-primary shadow-sm' : 'bg-surface-container-lowest border-outline-variant/30 hover:border-primary/50'}
                            `}
                          >
                            {isSelected && !isPerUnit && (
                              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary text-on-primary flex items-center justify-center">
                                <Check className="w-2.5 h-2.5" strokeWidth={3} />
                              </div>
                            )}
                            <span className={`text-xs font-semibold mb-1 ${isSelected ? 'text-primary' : 'text-on-surface'}`}>{m.name}</span>
                            <span className="text-[10px] text-on-surface-variant font-medium">+${m.price_delta}</span>

                            {isPerUnit && (
                              <div className="flex items-center gap-2 mt-3 bg-background border border-outline-variant/30 rounded-full px-2 py-1" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => handleModifierQuantity(m.id, -1)} className="w-6 h-6 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-on-surface">
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold w-4 text-center text-primary">{qty}</span>
                                <button onClick={() => handleModifierQuantity(m.id, 1)} className="w-6 h-6 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-on-surface">
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>
            </div>

            {/* DERECHA: Resumen Parcial (Sticky en desktop) */}
            <div className="w-full lg:sticky lg:top-8">
              <div className="bg-primary/5 p-6 md:p-8 rounded-[2rem] border border-primary/20 shadow-soft-shadow relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <h2 className="font-serif text-3xl text-on-surface mb-8 shrink-0 relative z-10">Tu Ritual</h2>
                
                <div className="flex-1 relative z-10 mb-8 min-h-[150px]">
                  {currentTotal.names.length > 0 ? (
                    <ul className="space-y-4">
                      {currentTotal.names.map((name, idx) => (
                        <li key={idx} className="flex items-start gap-4 text-sm text-on-surface-variant font-medium">
                          <Check className="w-5 h-5 text-primary shrink-0" /> {name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                      <Sparkles className="w-12 h-12 mb-4 text-on-surface-variant" />
                      <p className="text-sm text-on-surface-variant italic font-medium">Aún no has seleccionado ningún servicio.</p>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-outline-variant/30 relative z-10">
                  <div className="flex items-end justify-between mb-8">
                    <span className="text-sm font-medium text-on-surface-variant">Total Estimado</span>
                    <span className="font-serif text-4xl text-primary leading-none">
                      ${currentTotal.price}
                      <span className="text-sm text-on-surface-variant font-sans font-medium ml-1">MXN</span>
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setStep(2);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={!selectedCategoryId}
                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-full font-sans text-sm font-bold uppercase tracking-widest transition-all duration-300 shadow-md ${
                      selectedCategoryId
                        ? 'bg-primary text-on-primary hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5'
                        : 'bg-surface-variant text-on-surface-variant/50 cursor-not-allowed'
                    }`}
                  >
                    Elegir Fecha <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================
            PASO 2: FECHA Y HORA
        ========================================= */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-4xl mx-auto flex flex-col items-center"
          >
            <div className="w-full flex items-center justify-between mb-8">
              <button 
                onClick={() => setStep(1)} 
                className="text-xs font-bold uppercase tracking-widest text-primary/70 flex items-center gap-2 hover:text-primary transition-colors"
              >
                &larr; Volver
              </button>
              <h2 className="font-serif text-3xl text-on-surface flex items-center gap-2">
                <CalendarDays className="w-6 h-6 text-primary" />
                Fecha y Hora
              </h2>
              <div className="w-20"></div> {/* Spacer for balance */}
            </div>

            <div className="w-full bg-surface-container-lowest p-6 md:p-8 rounded-[2rem] border border-outline-variant/30 shadow-sm mb-8">
              {/* Fechas */}
              <div className="mb-8">
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
                  {dateOptions.map((date, i) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = i === 0;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(date)}
                        className={`relative flex-shrink-0 w-20 h-24 rounded-2xl flex flex-col items-center justify-center snap-center border transition-all duration-300 ${
                          isSelected
                            ? 'text-on-primary shadow-md scale-105 border-transparent'
                            : 'bg-background border-outline-variant/30 text-on-surface hover:border-primary/40'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="selectedDate"
                            className="absolute inset-0 bg-primary rounded-2xl"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        <span className={`relative z-10 text-[11px] uppercase font-bold tracking-widest mb-2 ${isSelected ? 'opacity-90' : 'text-on-surface-variant'}`}>
                          {isToday ? 'Hoy' : format(date, 'eee', { locale: es })}
                        </span>
                        <span className="relative z-10 font-serif text-3xl leading-none">
                          {format(date, 'd')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Horarios */}
              <div className="w-full">
                <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-4">
                  Horarios Disponibles para {format(selectedDate, "d 'de' MMMM", { locale: es })}
                </p>
                {loadingSlots ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="text-center py-10 text-on-surface-variant text-sm border border-dashed border-outline-variant/40 rounded-xl bg-surface-variant/10">
                    No hay horarios disponibles para esta fecha. Intenta otro día.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {timeSlots.map(slot => {
                      const isSelected = selectedTimeSlot?.label === slot.label;
                      const isOccupied = slot.isOccupied;

                      return (
                        <button
                          key={slot.label}
                          disabled={isOccupied}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`py-3 rounded-xl text-sm font-bold transition-all duration-200 border relative overflow-hidden ${
                            isSelected
                              ? 'bg-primary text-on-primary border-primary shadow-md'
                              : isOccupied
                              ? 'bg-surface-variant/30 border-transparent text-on-surface-variant/40 cursor-not-allowed line-through'
                              : 'bg-background border-outline-variant/30 text-on-surface hover:border-primary/50 hover:bg-surface-container-lowest hover:-translate-y-0.5'
                          }`}
                        >
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setStep(3);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={!selectedTimeSlot}
              className={`w-full max-w-sm py-4 rounded-full font-sans text-sm font-bold uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center gap-3 ${
                selectedTimeSlot
                  ? 'bg-primary text-on-primary hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5'
                  : 'bg-surface-variant text-on-surface-variant/50 cursor-not-allowed'
              }`}
            >
              Completar Datos <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* =========================================
            PASO 3: TUS DATOS
        ========================================= */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 md:gap-12 items-start"
          >
            {/* IZQUIERDA: Formulario */}
            <div className="flex flex-col gap-6 w-full">
              <button 
                onClick={() => setStep(2)} 
                className="text-xs font-bold uppercase tracking-widest text-primary/70 flex items-center gap-2 hover:text-primary transition-colors w-fit mb-2"
              >
                &larr; Volver
              </button>

              <section className="bg-surface-container-lowest p-6 md:p-8 rounded-[2rem] border border-outline-variant/30 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <User className="w-6 h-6 text-primary" />
                  <h2 className="font-serif text-3xl text-on-surface">Tus Datos</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2 ml-2">Nombre Completo</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. María Sánchez"
                        className="w-full bg-background border border-outline-variant/50 rounded-2xl py-4 pl-12 pr-4 text-base text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40 shadow-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2 ml-2">WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
                      <input
                        type="tel"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="10 dígitos"
                        className="w-full bg-background border border-outline-variant/50 rounded-2xl py-4 pl-12 pr-4 text-base text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40 shadow-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2 ml-2">Alergias o Notas (Opcional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="¿Alguna alergia o detalle que debamos saber?"
                      rows={3}
                      className="w-full bg-background border border-outline-variant/50 rounded-2xl py-4 px-5 text-base text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40 shadow-sm resize-none"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* DERECHA: Resumen Final (Sticky) */}
            <div className="w-full lg:sticky lg:top-8">
              <div className="bg-primary/5 p-6 md:p-8 rounded-[2rem] border border-primary/20 shadow-soft-shadow relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <h2 className="font-serif text-3xl text-on-surface mb-6 shrink-0 relative z-10">Resumen Final</h2>
                
                <div className="space-y-4 mb-8 relative z-10">
                  <div className="flex gap-3 items-center text-on-surface-variant bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
                    <CalendarDays className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{format(selectedDate, "d 'de' MMMM", { locale: es })}</p>
                      <p className="text-xs">{selectedTimeSlot?.label}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center text-on-surface-variant bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{currentTotal.names[0]}</p>
                      <p className="text-xs">+{currentTotal.names.length - 1} complementos</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-outline-variant/30 relative z-10">
                  <div className="flex items-end justify-between mb-8">
                    <span className="text-sm font-medium text-on-surface-variant">Total Estimado</span>
                    <span className="font-serif text-4xl text-primary leading-none">
                      ${currentTotal.price}
                      <span className="text-sm text-on-surface-variant font-sans font-medium ml-1">MXN</span>
                    </span>
                  </div>
                  <button
                    onClick={handleCreateAppointment}
                    disabled={!isDataFormValid || isSubmitting}
                    className={`w-full py-4 rounded-full font-sans text-sm font-bold uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center gap-3 ${
                      isDataFormValid && !isSubmitting
                        ? 'bg-primary text-on-primary hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5'
                        : 'bg-surface-variant text-on-surface-variant/50 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Continuar a Pago <CheckCircle className="w-5 h-5" /></>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-on-surface-variant/60 mt-4 leading-relaxed">
                    Al continuar, tu lugar quedará bloqueado temporalmente hasta que se confirme tu pago de anticipo.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================
            PASO 4: PAGO DE ANTICIPO
        ========================================= */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flex flex-col items-center text-center w-full max-w-3xl mx-auto"
          >
            <div className="w-full bg-surface-container-lowest rounded-[2rem] border border-outline-variant/30 shadow-soft-shadow overflow-hidden flex flex-col md:flex-row text-left">
              <div className="w-full md:w-1/2 p-8 md:p-10 bg-primary/5 flex flex-col">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Landmark className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-serif text-3xl text-primary mb-4 leading-tight">Casilla Protegida.</h2>
                <p className="text-on-surface-variant font-sans text-sm leading-relaxed mb-6">
                  Tu lugar para el <strong>{format(selectedDate, "d 'de' MMMM", { locale: es })} a las {selectedTimeSlot?.label}</strong> está bloqueado por las próximas <strong>{businessSettings?.advance_grace_period_hours ?? 2} horas</strong>.
                </p>
                <p className="text-on-surface-variant font-sans text-sm leading-relaxed mb-8">
                  Para asegurarlo de forma definitiva, realiza el pago de anticipo a los siguientes datos:
                </p>

                <div className="bg-surface-container-lowest p-5 rounded-2xl border border-primary/20 shadow-sm font-mono text-sm text-on-surface whitespace-pre-wrap flex-1">
                  {businessSettings?.bank_details || 'Banco: [Pendiente]\nCLABE: 00000000000000\nBeneficiario: [Pendiente]'}
                </div>
              </div>

              <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-surface-container-lowest">
                {proofSent ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      <CheckCircle className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-serif text-2xl text-on-surface mb-3">Comprobante Enviado</h3>
                    <p className="text-sm text-on-surface-variant mb-8">
                      Validaremos tu anticipo lo más pronto posible. Te enviaremos un mensaje de confirmación final.
                    </p>
                    
                    <RebookActions
                      date={(function(){
                        const d = new Date(selectedDate);
                        if (selectedTimeSlot) d.setHours(selectedTimeSlot.h ?? 0, selectedTimeSlot.m ?? 0, 0, 0);
                        return d;
                      })()}
                      salonName={activeProject?.name ?? 'Zen'}
                      serviceLabel={currentTotal.names[0]}
                      salonWhatsapp={businessSettings?.salon_whatsapp}
                    />

                    <button
                      onClick={() => window.location.reload()}
                      className="text-xs font-bold uppercase tracking-widest text-primary hover:underline mt-4"
                    >
                      Volver al Inicio
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <h3 className="font-serif text-2xl text-on-surface mb-2">Sube tu Comprobante</h3>
                    <p className="text-sm text-on-surface-variant mb-8">
                      Adjunta la captura de tu transferencia o notifícanos por WhatsApp.
                    </p>

                    <div className="space-y-4">
                      {/* File Upload Button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingProof}
                        className="w-full flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all text-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploadingProof ? (
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-6 h-6" />
                            <span className="text-sm font-bold uppercase tracking-widest">Subir Imagen o PDF</span>
                          </>
                        )}
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/png, image/jpeg, application/pdf"
                        onChange={handleProofUpload}
                      />

                      <div className="flex items-center gap-4 py-2">
                        <div className="h-px bg-outline-variant/30 flex-1"></div>
                        <span className="text-[10px] uppercase font-bold text-on-surface-variant/50">O también</span>
                        <div className="h-px bg-outline-variant/30 flex-1"></div>
                      </div>

                      <button
                        onClick={handleWhatsappProof}
                        disabled={uploadingProof}
                        className="w-full py-4 rounded-xl font-sans text-sm font-bold uppercase tracking-widest transition-all duration-300 border border-primary text-primary hover:bg-primary hover:text-on-primary flex items-center justify-center gap-2"
                      >
                        Envié por WhatsApp <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
