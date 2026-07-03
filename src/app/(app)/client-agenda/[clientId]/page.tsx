'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { CalendarView } from '@/components/calendar/CalendarView';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { ClientHeader } from '@/components/customers/ClientHeader';
import { ClinicalCard } from '@/components/customers/ClinicalCard';
import { Customer } from '@/types/supabase';

export default function ClientAgendaPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = async () => {
    if (!clientId) return;
    try {
      const { data, error: err } = await supabase
        .from('customers')
        .select('*')
        .eq('id', clientId)
        .single();
      if (err || !data) throw new Error('Cliente no encontrado.');
      setCustomer(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [clientId]);

  if (loading) return <div className="min-h-screen bg-fondo-zen flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primario-zen" /></div>;
  if (error) return <div className="min-h-screen bg-fondo-zen flex items-center justify-center p-6 text-center"><p className="text-red-600">{error}</p></div>;

  return (
    <main className="min-h-screen bg-fondo-zen p-6 md:p-12 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 1, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-none text-center mb-8 hidden" // Ocultamos el header anterior
      >
        <h1 className="text-primario-zen font-serif text-4xl tracking-wide mb-6">Mi Agenda ZEN</h1>
      </motion.div>

      <div className="w-full max-w-none flex flex-col gap-6">
        {customer && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-full">
              <ClientHeader customer={customer} />
            </div>
            <div className="h-full">
              <ClinicalCard customer={customer} onUpdated={fetchCustomer} />
            </div>
          </div>
        )}
        
        <CalendarView readOnly={true} customerFilterId={clientId} />
      </div>
    </main>
  );
}
