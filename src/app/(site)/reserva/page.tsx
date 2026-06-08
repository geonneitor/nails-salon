'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Loader2, Check, Sparkles, CreditCard } from 'lucide-react';
import { usePublicBooking, type TimeSlot, type BookingPayload, type PublicService } from '@/hooks/usePublicBooking';
import { ADDON_GROUPS, SERVICE_CATEGORIES } from '@/lib/serviceAddons';

export default function BookingPage() {
  const { services, loadingServices, loadingSettings, submitBooking, fetchAvailableSlots } = usePublicBooking();
  
  // -- Form State --
  const [activeCategory, setActiveCategory] = useState<string>('manos');
  const [selectedService, setSelectedService] = useState<PublicService | null>(null);
  
  // Addons State: { groupId: optionId }
  const [selectedAddons, setSelectedAddons] = useState<Record<string, string>>({});
  
  // Date & Time
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // Contact info
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // -- Calculations --
  let totalPrice = selectedService?.price ?? 0;
  let totalDuration = selectedService?.duration_minutes ?? 0;
  
  const addonDetails: any = {};
  
  Object.entries(selectedAddons).forEach(([groupId, optionId]) => {
    const group = ADDON_GROUPS.find(g => g.id === groupId);
    const option = group?.options.find(o => o.id === optionId);
    if (option) {
      totalPrice += option.price;
      totalDuration += option.duration_minutes;
      addonDetails[groupId] = option.label;
    }
  });

  const anticipo = totalPrice * 0.5;

  // -- Handlers --
  const handleAddonToggle = (groupId: string, optionId: string) => {
    setSelectedAddons(prev => {
      const next = { ...prev };
      if (next[groupId] === optionId) {
        delete next[groupId]; // allow deselection
      } else {
        next[groupId] = optionId;
      }
      return next;
    });
    // Reset date/time since duration changed
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const handleServiceSelect = (s: PublicService) => {
    setSelectedService(s);
    setSelectedAddons({});
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  // When date is selected, fetch true available slots for the calculated duration
  const handleDateSelect = async (day: Date) => {
    setSelectedDate(day);
    setSelectedSlot(null);
    setLoadingSlots(true);
    try {
      const slots = await fetchAvailableSlots(day, totalDuration);
      setAvailableSlots(slots);
    } catch (e) {
      console.error(e);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot || !selectedService || !selectedDate || !name.trim() || !contact.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const ticketDetails = {
        baseService: selectedService.name,
        addons: addonDetails
      };

      const payload: BookingPayload = {
        serviceId: selectedService.id,
        date: selectedDate,
        timeSlot: selectedSlot,
        name,
        contact,
        totalPrice,
        totalDuration,
        ticketDetails
      };
      await submitBooking(payload);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || 'Error al agendar. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // -- Calendar Logic --
  const monthDate = selectedDate || startOfToday();
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  const daysInMonth = eachDayOfInterval({ start, end });
  const firstDayOfWeek = getDay(start);
  const blanks = Array.from({ length: firstDayOfWeek });

  const handleMonthChange = (dir: 1 | -1) => {
    const newDate = new Date(monthDate);
    newDate.setMonth(newDate.getMonth() + dir);
    // Just change the view, don't auto-select a day
    setSelectedDate(newDate); 
    setSelectedSlot(null);
    setAvailableSlots([]);
  };

  // -- Render Success --
  if (success) {
    return (
      <div className="min-h-screen bg-fondo-zen pt-24 px-5">
        <div className="max-w-md mx-auto bg-fondo-zen border border-secundario-zen/50 rounded-3xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-primario-zen/10 text-primario-zen rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl text-primario-zen mb-4">Cita Provisional</h1>
          <p className="font-sans text-primario-zen/70 mb-8 leading-relaxed">
            Hemos reservado tu espacio temporalmente. Para confirmarla definitivamente, requerimos un anticipo del 50% (<strong className="text-primario-zen">${anticipo} MXN</strong>).
          </p>
          
          <div className="bg-secundario-zen/10 p-5 rounded-xl text-left mb-8">
            <div className="flex items-center gap-2 text-primario-zen mb-2 font-semibold font-sans text-sm">
              <CreditCard className="w-4 h-4"/> Instrucciones de pago
            </div>
            <p className="font-sans text-sm text-primario-zen/70 mb-4">
              Realiza una transferencia a la cuenta XXXXXXXX o contáctanos por WhatsApp enviando tu comprobante de pago.
            </p>
            <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer" className="block text-center w-full bg-accent-gold text-fondo-zen py-3 rounded-full font-sans font-semibold text-sm hover:opacity-90 transition">
              Enviar comprobante por WhatsApp
            </a>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="text-primario-zen/50 hover:text-primario-zen uppercase tracking-widest font-sans text-xs transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fondo-zen pt-24 pb-24 px-5">
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-primario-zen/60 hover:text-primario-zen font-sans text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Volver
        </Link>
        <h1 className="font-serif text-4xl text-primario-zen mb-3">Arma tu Ritual</h1>
        <p className="font-sans text-primario-zen/60 text-lg">Personaliza tu servicio para calcular tiempo y precio exacto.</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COL: BUILDER */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. Categorías y Servicio Base */}
          <div className="bg-fondo-zen border border-secundario-zen/50 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="font-sans font-semibold text-primario-zen uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-secundario-zen/40 flex items-center justify-center text-xs">1</span> 
              Elige un Servicio
            </h2>
            
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-4 border-b border-secundario-zen/30">
              {SERVICE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-5 py-2 rounded-full font-sans text-sm whitespace-nowrap transition-colors ${
                    activeCategory === cat.id ? 'bg-primario-zen text-fondo-zen' : 'text-primario-zen/60 hover:bg-secundario-zen/20'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Servicios list */}
            {loadingServices ? (
              <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primario-zen/40"/></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nota: En la BD no tenemos categoría, simulamos que todos son de la activa por ahora, o mostramos todos */}
                {services.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleServiceSelect(s)}
                    className={`text-left p-5 rounded-2xl border transition-all duration-300 ${
                      selectedService?.id === s.id 
                        ? 'border-primario-zen bg-primario-zen/5' 
                        : 'border-secundario-zen/50 hover:border-primario-zen/30 hover:bg-secundario-zen/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-serif text-primario-zen text-base leading-snug">{s.name}</span>
                    </div>
                    <p className="font-sans text-xs text-primario-zen/50 mb-3">{s.description || 'Tratamiento base'}</p>
                    <div className="flex gap-4">
                      <span className="font-sans text-xs font-semibold text-accent-gold">Desde ${s.price}</span>
                      <span className="font-sans text-xs text-primario-zen/40">{s.duration_minutes} min base</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Personalización (Solo visible si hay servicio base) */}
          {selectedService && (
            <div className="bg-fondo-zen border border-secundario-zen/50 rounded-3xl p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="font-sans font-semibold text-primario-zen uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-secundario-zen/40 flex items-center justify-center text-xs">2</span> 
                Personaliza tu estilo
              </h2>
              
              <div className="space-y-8">
                {ADDON_GROUPS.map(group => (
                  <div key={group.id}>
                    <p className="font-serif text-lg text-primario-zen mb-3">{group.title}</p>
                    <div className="flex flex-wrap gap-3">
                      {group.options.map(opt => {
                        const isSelected = selectedAddons[group.id] === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleAddonToggle(group.id, opt.id)}
                            className={`px-4 py-3 rounded-xl border text-left flex flex-col min-w-[140px] transition-all ${
                              isSelected 
                                ? 'border-primario-zen bg-primario-zen text-fondo-zen shadow-md' 
                                : 'border-secundario-zen/50 text-primario-zen/70 hover:border-primario-zen/40 hover:bg-secundario-zen/10'
                            }`}
                          >
                            <span className="font-sans text-sm font-semibold mb-1">{opt.label}</span>
                            <span className={`font-sans text-[10px] uppercase tracking-wider ${isSelected ? 'text-fondo-zen/70' : 'text-primario-zen/40'}`}>
                              {opt.price > 0 ? `+$${opt.price}` : 'Gratis'} · {opt.duration_minutes > 0 ? `+${opt.duration_minutes}m` : '0m'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Fecha y Hora */}
          {selectedService && (
            <div className="bg-fondo-zen border border-secundario-zen/50 rounded-3xl p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="font-sans font-semibold text-primario-zen uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-secundario-zen/40 flex items-center justify-center text-xs">3</span> 
                Disponibilidad
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Calendario */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <button onClick={() => handleMonthChange(-1)} className="p-1 text-primario-zen/40 hover:text-primario-zen"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="font-sans text-sm text-primario-zen font-semibold uppercase">{format(monthDate, 'MMMM yyyy', { locale: es })}</span>
                    <button onClick={() => handleMonthChange(1)} className="p-1 text-primario-zen/40 hover:text-primario-zen"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-y-2 text-center mb-2">
                    {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map(d => <div key={d} className="text-[10px] uppercase text-primario-zen/40">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-y-2 text-center">
                    {blanks.map((_, i) => <div key={`blank-${i}`} />)}
                    {daysInMonth.map(day => {
                      const isPast = isBefore(day, startOfToday());
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      return (
                        <button
                          key={day.toISOString()}
                          disabled={isPast}
                          onClick={() => handleDateSelect(day)}
                          className={`
                            py-2 rounded-full font-sans text-sm transition-colors
                            ${isPast ? 'text-primario-zen/20 cursor-not-allowed' : 'hover:bg-secundario-zen/30'}
                            ${isSelected ? 'bg-primario-zen text-fondo-zen' : 'text-primario-zen'}
                          `}
                        >
                          {format(day, 'd')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Horas */}
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-primario-zen/40 mb-4">Horarios Libres</p>
                  {!selectedDate ? (
                    <p className="font-sans text-sm text-primario-zen/40 italic">Selecciona un día en el calendario.</p>
                  ) : loadingSlots ? (
                    <div className="flex items-center text-primario-zen/50 text-sm"><Loader2 className="w-4 h-4 animate-spin mr-2"/> Calculando...</div>
                  ) : availableSlots.length === 0 ? (
                    <p className="font-sans text-sm text-red-400">No hay espacios de {totalDuration} min disponibles este día.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map(slot => {
                        const isSelected = selectedSlot?.label === slot.label;
                        return (
                          <button
                            key={slot.label}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 rounded-xl border text-sm font-sans transition-colors ${
                              isSelected ? 'bg-primario-zen text-fondo-zen border-primario-zen' : 'border-secundario-zen/50 text-primario-zen hover:border-primario-zen'
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
            </div>
          )}

          {/* 4. Datos de Contacto */}
          {selectedSlot && (
            <div className="bg-fondo-zen border border-secundario-zen/50 rounded-3xl p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="font-sans font-semibold text-primario-zen uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-secundario-zen/40 flex items-center justify-center text-xs">4</span> 
                Tus Datos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-sans text-[10px] uppercase tracking-widest text-primario-zen/50 mb-2">Nombre Completo</label>
                  <input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-transparent border-b border-secundario-zen py-2 text-primario-zen font-serif text-lg focus:outline-none focus:border-primario-zen" placeholder="Ej. Ana Gómez"/>
                </div>
                <div>
                  <label className="block font-sans text-[10px] uppercase tracking-widest text-primario-zen/50 mb-2">WhatsApp / Email</label>
                  <input type="text" value={contact} onChange={e=>setContact(e.target.value)} className="w-full bg-transparent border-b border-secundario-zen py-2 text-primario-zen font-serif text-lg focus:outline-none focus:border-primario-zen" placeholder="Para contactarte"/>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COL: SUMMARY STICKY PANEL */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 bg-primario-zen rounded-3xl p-6 md:p-8 text-fondo-zen shadow-xl">
            <h3 className="font-serif text-2xl mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-gold" /> Resumen
            </h3>
            
            {!selectedService ? (
              <p className="font-sans text-sm text-fondo-zen/50 italic">Selecciona un servicio para comenzar a armar tu cita.</p>
            ) : (
              <div className="space-y-6">
                {/* Desglose */}
                <div className="space-y-3 pb-6 border-b border-fondo-zen/10">
                  <div className="flex justify-between items-start">
                    <span className="font-sans text-sm opacity-90 pr-4">{selectedService.name}</span>
                    <span className="font-sans text-sm font-semibold">${selectedService.price}</span>
                  </div>
                  {Object.entries(selectedAddons).map(([groupId, optId]) => {
                    const group = ADDON_GROUPS.find(g => g.id === groupId);
                    const opt = group?.options.find(o => o.id === optId);
                    if (!opt || opt.price === 0) return null;
                    return (
                      <div key={groupId} className="flex justify-between items-start text-fondo-zen/70">
                        <span className="font-sans text-xs pr-4">+ {opt.label}</span>
                        <span className="font-sans text-xs">+${opt.price}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Fecha / Hora */}
                {(selectedDate && selectedSlot) && (
                  <div className="pb-6 border-b border-fondo-zen/10">
                    <p className="font-sans text-[10px] uppercase tracking-widest opacity-50 mb-1">Cita Programada</p>
                    <p className="font-sans text-sm opacity-90">{format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}</p>
                    <p className="font-sans text-sm opacity-90">a las {selectedSlot.label}</p>
                  </div>
                )}

                {/* Totales */}
                <div className="flex justify-between items-end">
                  <div>
                    <p className="font-sans text-[10px] uppercase tracking-widest opacity-50 mb-1">Total Estimado</p>
                    <p className="font-serif text-3xl text-accent-gold">${totalPrice}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-[10px] uppercase tracking-widest opacity-50 mb-1">Duración</p>
                    <p className="font-sans text-sm opacity-90">{totalDuration} min</p>
                  </div>
                </div>

                {/* Anticipo info */}
                <div className="bg-fondo-zen/10 rounded-xl p-4 mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-sans text-xs font-semibold">Anticipo Requerido</span>
                    <span className="font-sans text-sm font-bold text-accent-gold">${anticipo}</span>
                  </div>
                  <p className="font-sans text-[10px] opacity-60 leading-relaxed">
                    Se requiere el pago del 50% para confirmar la cita en el sistema.
                  </p>
                </div>

                {error && <p className="text-red-300 font-sans text-xs bg-red-900/30 p-3 rounded-lg">{error}</p>}

                <button
                  disabled={!selectedSlot || !name.trim() || !contact.trim() || submitting}
                  onClick={handleBooking}
                  className="w-full bg-fondo-zen text-primario-zen py-4 rounded-full font-sans font-semibold text-sm uppercase tracking-widest disabled:opacity-50 hover:opacity-90 transition flex items-center justify-center"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2"/> Procesando...</> : 'Solicitar Cita'}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
