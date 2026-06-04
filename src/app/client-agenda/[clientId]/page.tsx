'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, User, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number;
  employee: {
    name: string;
  };
}

interface Customer {
  name: string;
  phone: string;
}

export default function ClientAgendaPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!clientId) return;
      setLoading(true);

      try {
        // 1. Fetch Customer details
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('name, phone')
          .eq('id', clientId)
          .single();

        if (customerError || !customerData) {
          throw new Error('Cliente no encontrado.');
        }

        // 2. Fetch Appointments for this client
        const { data: apptData, error: apptError } = await supabase
          .from('appointments')
          .select('*, employee(name)')
          .eq('customer_id', clientId)
          .gte('start_time', new Date().toISOString()) // Only future appointments
          .order('start_time', { ascending: true });

        if (apptError) throw apptError;

        setCustomer(customerData);
        setAppointments((apptData as any[]) || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [clientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-fondo-zen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-primario-zen border-t-transparent rounded-full animate-spin" />
          <p className="text-primario-zen/50 text-xs uppercase tracking-widest font-medium">Cargando Agenda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-fondo-zen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <p className="text-red-600 font-serif text-xl mb-4">{error}</p>
          <p className="text-primario-zen/50 text-sm mb-6">No pudimos encontrar tu información de cita.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-fondo-zen p-6 md:p-12 flex flex-col items-center">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center mb-12"
      >
        <h1 className="text-primario-zen font-serif text-4xl tracking-wide mb-2">Mi Agenda ZEN</h1>
        <div className="flex justify-center gap-1 opacity-50 mb-6">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-primario-zen" />
          ))}
        </div>

        {customer && (
          <div className="bg-white/40 backdrop-blur-sm border border-secundario-zen/50 rounded-3xl p-6 flex flex-col items-center gap-2">
            <div className="p-3 bg-primario-zen/10 rounded-full">
              <User className="w-6 h-6 text-primario-zen" />
            </div>
            <h2 className="text-primario-zen font-serif text-xl">{customer.name}</h2>
            <p className="text-primario-zen/60 text-xs uppercase tracking-widest font-medium">Bienvenida</p>
          </div>
        )}
      </motion.div>

      {/* Appointments List */}
      <div className="w-full max-w-md flex flex-col gap-4">
        {appointments.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white/30 border border-dashed border-secundario-zen/50 rounded-3xl">
            <Calendar className="w-8 h-8 text-primario-zen/30 mx-auto mb-3" />
            <p className="text-primario-zen/60 font-sans text-sm">
              No tienes citas programadas actualmente.
            </p>
          </div>
        ) : (
          appointments.map((appt, idx) => (
            <motion.div
              key={appt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white/60 backdrop-blur-md border border-secundario-zen/50 p-5 rounded-3xl flex items-center justify-between hover:bg-white/80 transition-all cursor-default"
            >
              <div className="flex gap-4 items-center">
                <div className="p-3 bg-primario-zen/10 rounded-2xl text-primario-zen">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-primario-zen font-medium text-sm font-sans">
                    {format(new Date(appt.start_time), "EEEE, d 'de' MMMM", { locale: es })}
                  </p>
                  <p className="text-primario-zen/60 text-xs font-sans flex items-center gap-1 mt-0.5">
                    <span className="font-semibold">{format(new Date(appt.start_time), "h:mm a")}</span>
                    <span>•</span>
                    <span>Con {appt.employee?.name || 'nuestra especialista'}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right mr-2">
                  <p className="text-primario-zen font-serif text-sm">${appt.total_price} MXN</p>
                  <p className="text-[10px] uppercase tracking-tighter text-primario-zen/40 font-bold">Cita</p>
                </div>
                <div className="p-2 rounded-full bg-secundario-zen/30 text-primario-zen/60 group-hover:text-primario-zen transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <footer className="mt-16 text-center">
        <p className="text-primario-zen/40 text-[10px] uppercase tracking-widest font-medium font-sans">
          SISTEMA DE GESTIÓN ZEN © 2026
        </p>
      </footer>
    </main>
  );
}
