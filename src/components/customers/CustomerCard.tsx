// ============================================================
// src/components/customers/CustomerCard.tsx
// Tarjeta individual de clienta.
// ============================================================
import { User, Phone, Calendar } from 'lucide-react';
import type { Customer } from '@/types/supabase';
import { format } from 'date-fns';

interface CustomerCardProps {
  customer: Customer;
  onClick: () => void;
}

export function CustomerCard({ customer, onClick }: CustomerCardProps) {
  return (
    <div 
      onClick={onClick}
      className="group relative flex flex-col gap-3 rounded-2xl bg-[#FDFBEE] p-5 cursor-pointer transition-all duration-300 shadow-sm border border-secundario-zen/40 hover:shadow-md hover:border-secundario-zen"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-serif text-primario-zen text-lg tracking-wide group-hover:text-primario-zen/80 transition-colors">
          {customer.name}
        </h3>
        <span className="bg-secundario-zen/30 text-primario-zen/70 text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-semibold">
          {customer.visit_count} Visitas
        </span>
      </div>

      <div className="flex flex-col gap-1.5 mt-2">
        {customer.phone && (
          <p className="text-primario-zen/70 text-sm flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" />
            {customer.phone}
          </p>
        )}
        {customer.birthday && (
          <p className="text-primario-zen/70 text-sm flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(customer.birthday), 'd MMM')}
          </p>
        )}
      </div>
    </div>
  );
}
