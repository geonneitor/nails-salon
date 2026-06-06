'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { CalendarView } from '@/components/calendar/CalendarView';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

export default function ClientAgendaPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const [customer, setCustomer] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCustomer() {
      if (!clientId) return;
      try {
        const { data, error: err } = await supabase
          .from('customers')
          .select('name')
          .eq('id', clientId)
          .single();
        if (err || !data) throw new Error('Cliente no encontrado.');
        setCustomer(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomer();
  }, [clientId]);

  if (loading) return <div className="min-h-screen bg-fondo-zen flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primario-zen" /></div>;
  if (error) return <div className="min-h-screen bg-fondo-zen flex items-center justify-center p-6 text-center"><p className="text-red-600">{error}</p></div>;

  return (
    <main className="min-h-screen bg-fondo-zen p-6 md:p-12 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-none text-center mb-8"
      >
        <h1 className="text-primario-zen font-serif text-4xl tracking-wide mb-6">Mi Agenda ZEN</h1>
        {customer && (
          <div className="inline-flex items-center gap-3 bg-white/40 backdrop-blur-sm border border-secundario-zen/50 rounded-full px-6 py-2">
            <User className="w-4 h-4 text-primario-zen" />
            <span className="text-primario-zen font-serif text-sm">{customer.name}</span>
          </div>
        )}
      </motion.div>

      <div className="w-full max-w-none">
        <CalendarView readOnly={true} customerFilterId={clientId} />
      </div>
    </main>
  );
}
