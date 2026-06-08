'use client';
// ============================================================
// src/components/services/ServiceCard.tsx
// Tarjeta individual de servicio con acciones de edición y borrado.
// ============================================================
import { Clock, DollarSign, Pencil, Trash2 } from 'lucide-react';
import type { Service } from '@/types/supabase';
import { useConfirm } from '@/components/ui/ConfirmDialog';

interface ServiceCardProps {
  service: Service;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  const confirm = useConfirm();

  return (
    /* FIXED: bg-[#FDFBEE] → bg-surface-container-lowest */
    <div className="group flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-5 shadow-sm border border-secundario-zen/40 hover:shadow-md hover:border-secundario-zen hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
      <div className="flex justify-between items-start">
        <h3 className="font-serif text-primario-zen text-lg tracking-wide">
          {service.name}
        </h3>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="p-2 rounded-full bg-surface-container text-primario-zen/60 hover:bg-primario-zen hover:text-fondo-zen transition-colors"
            title="Editar servicio"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              const ok = await confirm({
                title: 'Eliminar servicio',
                message: `¿Eliminar "${service.name}"? Esta acción no se puede deshacer.`,
                confirmLabel: 'Sí, eliminar',
                danger: true,
              });
              if (ok) onDelete?.();
            }}
            className="p-2 rounded-full bg-surface-container text-on-surface-variant/50 hover:text-error hover:bg-error/10 transition-colors"
            title="Eliminar servicio"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

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
