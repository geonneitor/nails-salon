'use client';

// ============================================================
// /services — Layout 60/40 con vista previa en vivo.
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { ServiceList } from '@/components/services/ServiceList';
import { ServicePreviewCard } from '@/components/services/ServicePreviewCard';

export default function ServiciosPage() {
  const [highlightCategoryId, setHighlightCategoryId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cuando el admin edita, resaltamos esa categoría en la vista previa
  // durante 2.5s y luego limpiamos.
  const flash = (id: string) => {
    setHighlightCategoryId(id);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setHighlightCategoryId(null), 2500);
  };

  // Limpieza al desmontar.
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <div className="flex flex-col py-10 px-6 w-full">
      <div className="w-full max-w-none">
        <div className="flex justify-between items-end mb-8 border-b border-secundario-zen/50 pb-4">
          <div>
            <h1 className="text-primario-zen font-serif text-3xl uppercase tracking-widest">
              Servicios
            </h1>
            <p className="text-xs text-on-surface-variant/60 mt-1 font-sans italic">
              Edita a la izquierda. La vista de la clienta se actualiza en tiempo real.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8">
          <div>
            <ServiceList
              onVariantEdited={flash}
              onModifierEdited={flash}
            />
          </div>
          <div>
            <ServicePreviewCard highlightCategoryId={highlightCategoryId} />
          </div>
        </div>
      </div>
    </div>
  );
}
