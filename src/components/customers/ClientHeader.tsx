'use client';

import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Phone, CalendarDays } from 'lucide-react';
import type { Customer } from '@/types/supabase';

interface ClientHeaderProps {
  customer: Customer;
}

export function ClientHeader({ customer }: ClientHeaderProps) {
  const initial = customer.name.charAt(0).toUpperCase();
  const since = customer.created_at ? format(new Date(customer.created_at), "MMMM yyyy", { locale: es }) : 'Reciente';

  const handleWhatsapp = () => {
    if (customer.phone) {
      window.open(`https://wa.me/${customer.phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  return (
    <div className="card-depth relative overflow-hidden rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 w-full bg-fondo-zen border border-secundario-zen/40">
      {/* Avatar Glassmorphism */}
      <div className="shrink-0 w-24 h-24 rounded-full bg-primario-zen/5 border border-primario-zen/20 flex items-center justify-center shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primario-zen/20 to-transparent opacity-50"></div>
        <span className="font-serif text-5xl text-primario-zen relative z-10">{initial}</span>
      </div>

      <div className="flex-1 text-center md:text-left flex flex-col justify-center">
        <h1 className="font-serif text-3xl md:text-4xl text-primario-zen mb-2">{customer.name}</h1>
        
        {customer.phone && (
          <button 
            onClick={handleWhatsapp}
            className="group flex items-center justify-center md:justify-start gap-2 text-primario-zen/70 hover:text-primario-zen transition-colors mb-4"
          >
            <Phone className="w-4 h-4" />
            <span className="text-sm font-sans tracking-wide border-b border-dashed border-primario-zen/30 group-hover:border-primario-zen/70 transition-colors">
              {customer.phone}
            </span>
          </button>
        )}

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-sans font-medium text-primario-zen/60">
          <div className="flex items-center gap-1.5 bg-secundario-zen/30 px-3 py-1.5 rounded-full border border-secundario-zen/60">
            <CalendarDays className="w-4 h-4" />
            <span>Clienta desde {since}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gold-primary/10 text-gold-dark px-3 py-1.5 rounded-full border border-gold-primary/30">
            <span className="font-bold text-sm leading-none tabular-nums">{customer.visit_count ?? 0}</span>
            <span className="uppercase tracking-widest text-[10px]">Visitas</span>
          </div>
        </div>
      </div>
      
      {/* Ornamento Decorativo */}
      <div className="hidden md:block absolute top-0 right-0 w-48 h-48 bg-primario-zen/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
    </div>
  );
}
