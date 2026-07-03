'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabaseClient';
import { CalendarDays, Clock, User, Scissors, Landmark, CheckCircle, XCircle, AlertCircle, Phone, ArrowLeft, Loader2 } from 'lucide-react';

interface ClientAppointment {
  id: string;
  start_time: string;
  end_time: string;
  status: 'pending_advance' | 'confirmed_advance' | 'cancelled' | 'no_show' | 'free';
  employee: { id: string; name: string };
  service: { id: string; name: string; price: number };
  customer: { id: string; name: string; phone: string };
  project: { id: string; name: string };
}

export default function ClientPortal({ params }: { params: { id: string } }) {
  const [appointment, setAppointment] = useState<ClientAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAppointment() {
      try {
        const { data, error } = await supabase.rpc('get_appointment_public', {
          p_appointment_id: params.id,
        });
        if (error) throw error;
        if (!data) throw new Error("No se encontró la cita.");
        setAppointment(data as ClientAppointment);
      } catch (err: any) {
        setError(err.message || 'Error al cargar la cita.');
      } finally {
        setLoading(false);
      }
    }
    fetchAppointment();
  }, [params.id]);

  const handleCancel = async () => {
    if (!confirm('¿Estás segura de que deseas cancelar esta cita?')) return;
    
    setCancelling(true);
    setCancelError(null);
    try {
      const { error } = await supabase.rpc('cancel_appointment_public', {
        p_appointment_id: params.id,
      });
      if (error) throw error;
      
      // Update local state
      setAppointment(prev => prev ? { ...prev, status: 'cancelled' } : null);
      alert('Tu cita ha sido cancelada exitosamente.');
    } catch (err: any) {
      setCancelError(err.message || 'Hubo un error al cancelar.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-on-surface-variant font-medium tracking-widest uppercase text-xs">Cargando ritual...</p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <AlertCircle className="w-12 h-12 text-error mb-4" />
        <h2 className="font-serif text-2xl text-on-surface mb-2">Cita no encontrada</h2>
        <p className="text-on-surface-variant text-sm mb-6">{error}</p>
        <button onClick={() => window.location.href = '/'} className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold uppercase tracking-widest text-xs transition-transform hover:scale-105">
          Volver al Inicio
        </button>
      </div>
    );
  }

  const startDate = new Date(appointment.start_time);
  const isCancelled = appointment.status === 'cancelled' || appointment.status === 'no_show';
  const isConfirmed = appointment.status === 'confirmed_advance';
  const isPending = appointment.status === 'pending_advance';

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 pb-20">
      
      <button 
        onClick={() => window.location.href = '/'} 
        className="text-xs font-bold uppercase tracking-widest text-primary/70 flex items-center gap-2 hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Inicio
      </button>

      <motion.div
        initial={{ opacity: 1, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-container-lowest border border-outline-variant/30 rounded-[2rem] p-6 md:p-10 shadow-soft-shadow relative overflow-hidden"
      >
        {/* Background glow */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none opacity-20 ${
          isCancelled ? 'bg-error' : isConfirmed ? 'bg-success' : 'bg-primary'
        }`}></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-serif text-3xl text-on-surface">Hola, {appointment.customer.name.split(' ')[0]}</h1>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
              isCancelled 
                ? 'bg-error/10 text-error border-error/20' 
                : isConfirmed 
                  ? 'bg-success/10 text-success border-success/20' 
                  : 'bg-accent-gold-primary/10 text-accent-gold-dark border-accent-gold-primary/20'
            }`}>
              {isCancelled ? 'Cancelada' : isConfirmed ? 'Confirmada' : 'Falta Anticipo'}
            </div>
          </div>

          <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
            {isCancelled 
              ? "Esta cita ha sido cancelada. Si deseas, puedes agendar un nuevo ritual desde nuestro portal principal."
              : isConfirmed
                ? "Tu lugar está asegurado y tu depósito ha sido confirmado. Te esperamos con mucha emoción."
                : "Tu lugar está temporalmente bloqueado. Aún estamos esperando la confirmación de tu anticipo para asegurarlo por completo."
            }
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-surface-variant/10 p-5 rounded-2xl flex gap-4 items-start border border-outline-variant/20">
              <CalendarDays className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">Día del Ritual</p>
                <p className="text-sm font-semibold text-on-surface capitalize">{format(startDate, "EEEE d 'de' MMMM", { locale: es })}</p>
              </div>
            </div>
            <div className="bg-surface-variant/10 p-5 rounded-2xl flex gap-4 items-start border border-outline-variant/20">
              <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">Hora y Duración</p>
                <p className="text-sm font-semibold text-on-surface">{format(startDate, "h:mm a")} (Aprox.)</p>
              </div>
            </div>
            <div className="bg-surface-variant/10 p-5 rounded-2xl flex gap-4 items-start border border-outline-variant/20">
              <User className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">Especialista</p>
                <p className="text-sm font-semibold text-on-surface">{appointment.employee.name}</p>
              </div>
            </div>
            <div className="bg-surface-variant/10 p-5 rounded-2xl flex gap-4 items-start border border-outline-variant/20">
              <Scissors className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">Servicio Base</p>
                <p className="text-sm font-semibold text-on-surface">{appointment.service.name}</p>
              </div>
            </div>
          </div>

          {!isCancelled && (
            <div className="pt-6 border-t border-outline-variant/20 mt-8 space-y-6">
              
              {cancelError && (
                <div className="p-4 bg-error/10 text-error rounded-xl text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{cancelError}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    const message = encodeURIComponent(`Hola, necesito ayuda con mi cita del ${format(startDate, "d 'de' MMM")} a las ${format(startDate, "h:mm a")}. (ID: ${appointment.id.split('-')[0]})`);
                    window.open(`https://wa.me/526863999319?text=${message}`, '_blank');
                  }}
                  className="flex-1 py-4 rounded-xl font-sans text-xs font-bold uppercase tracking-widest transition-all duration-300 border border-primary text-primary hover:bg-primary/5 flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" /> Hablar con Recepción
                </button>
                
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-4 rounded-xl font-sans text-xs font-bold uppercase tracking-widest transition-all duration-300 bg-surface-variant/30 text-on-surface hover:bg-error hover:text-white hover:border-error flex items-center justify-center gap-2"
                >
                  {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Cancelar Cita
                </button>
              </div>
              <p className="text-[10px] text-center text-on-surface-variant/50 leading-relaxed max-w-sm mx-auto">
                Las cancelaciones directas solo están permitidas hasta 24 horas antes de tu cita. Si el botón falla, contáctanos por WhatsApp.
              </p>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
