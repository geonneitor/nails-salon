// ============================================================
// src/components/services/ServiceCard.tsx
// Tarjeta individual de servicio.
// ============================================================
import { Clock, DollarSign } from 'lucide-react';
import type { Service } from '@/types/supabase';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="group flex flex-col gap-3 rounded-2xl bg-[#FDFBEE] p-5 shadow-sm border border-secundario-zen/40 hover:shadow-md hover:border-secundario-zen transition-all duration-300">
      <h3 className="font-serif text-primario-zen text-lg tracking-wide">
        {service.name}
      </h3>

      <div className="flex items-center gap-4 mt-2">
        <p className="text-primario-zen/70 text-sm flex items-center gap-1.5 bg-secundario-zen/20 px-3 py-1.5 rounded-xl border border-secundario-zen/40">
          <Clock className="w-3.5 h-3.5" />
          {service.duration_minutes} min
        </p>
        <p className="text-primario-zen font-semibold text-sm flex items-center gap-1.5 bg-primario-zen/10 px-3 py-1.5 rounded-xl border border-primario-zen/20">
          <DollarSign className="w-3.5 h-3.5" />
          {service.price} MXN
        </p>
      </div>
    </div>
  );
}
