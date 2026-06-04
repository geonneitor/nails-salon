import { User, Phone, Calendar } from 'lucide-react';
import type { Customer } from '@/types/supabase';
import { format } from 'date-fns';
import { useApp } from '@/context/AppContext';

interface CustomerCardProps {
  customer: Customer;
  onClick: () => void;
}

export function CustomerCard({ customer, onClick }: CustomerCardProps) {
  const { preferences } = useApp();
  const isCompact = preferences?.density === 'compact';

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col rounded-2xl bg-fondo-zen cursor-pointer transition-all duration-300 shadow-sm border border-secundario-zen/40 hover:shadow-md hover:border-secundario-zen ${
        isCompact ? 'gap-2 p-3' : 'gap-3 p-5'
      }`}
    >
      <div className="flex justify-between items-start">
        <h3 className={`font-serif text-primario-zen tracking-wide group-hover:text-primario-zen/80 transition-colors ${isCompact ? 'text-base' : 'text-lg'}`}>
          {customer.name}
        </h3>
        <span className="bg-secundario-zen/30 text-primario-zen/70 text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-semibold">
          {customer.visit_count} Visitas
        </span>
      </div>

      <div className={`flex flex-col ${isCompact ? 'gap-1' : 'gap-1.5'} mt-2`}>
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
