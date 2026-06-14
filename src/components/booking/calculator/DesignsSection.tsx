'use client';

import React from 'react';
import { Palette } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';
import { DISENOS_COMPLETOS } from '@/lib/nail-menu-config';

interface DesignsSectionProps {
  dis: Record<string, number>;
  setDis: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  disTonos: number;
  setDisTonos: (v: number) => void;
  onReset: () => void;
  categories?: any[];
  variants?: any[];
  modifiers?: any[];
}

export function DesignsSection({
  dis,
  setDis,
  disTonos,
  setDisTonos,
  onReset,
  categories,
  variants,
  modifiers
}: DesignsSectionProps) {
  const disCategory = categories?.find(c => c.name.toLowerCase().includes('diseño'));
  const dbDis = disCategory && modifiers
    ? modifiers.filter(m => m.category_id === disCategory.id && m.is_active)
    : [];
  const displayDis = dbDis.length > 0
    ? dbDis.map(m => ({ name: m.name, price: Number(m.price_delta) }))
    : DISENOS_COMPLETOS;

  const extraTonoMod = disCategory && modifiers
    ? modifiers.find(m => m.category_id === disCategory.id && m.name.toLowerCase().includes('tono'))
    : null;
  const disTonoPrice = extraTonoMod ? Number(extraTonoMod.price_delta) : 5;

  const adjObj = (key: string, delta: number) => {
    setDis((prev) => {
      const current = prev[key] ?? 0;
      const nextVal = Math.max(0, current + delta);
      return { ...prev, [key]: nextVal };
    });
  };

  return (
    <SectionWrapper title="Diseños Completos" icon={<Palette className="w-4 h-4" />} onReset={onReset}>
      <p className="text-[10px] text-primario-zen/60 italic mb-2 font-sans">Multiplica la cantidad de uñas por diseño.</p>
      <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
        {displayDis.map((d) => {
          const qty = dis[d.name] ?? 0;
          return (
            <div key={d.name} className="flex items-center justify-between py-1 border-b border-secundario-zen/20 font-sans">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-primario-zen">{d.name}</span>
                <span className="text-[10px] text-primario-zen/50">${d.price} MXN / uña</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => adjObj(d.name, -1)}
                  className="w-7 h-7 rounded-full bg-secundario-zen/30 hover:bg-secundario-zen/50 text-primario-zen flex items-center justify-center font-sans font-bold"
                >
                  -
                </button>
                <span className="text-sm font-bold text-primario-zen w-5 text-center font-sans">{qty}</span>
                <button
                  type="button"
                  onClick={() => adjObj(d.name, 1)}
                  className="w-7 h-7 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 flex items-center justify-center font-sans font-bold"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-secundario-zen/30 pt-3">
        <span className="text-xs font-semibold text-primario-zen/85 font-sans">Tonos extra (+${disTonoPrice} c/u)</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDisTonos(Math.max(0, disTonos - 1))}
            className="w-7 h-7 rounded-full bg-secundario-zen/30 hover:bg-secundario-zen/50 text-primario-zen flex items-center justify-center font-sans"
          >
            -
          </button>
          <span className="text-sm font-bold text-primario-zen w-5 text-center font-sans">{disTonos}</span>
          <button
            type="button"
            onClick={() => setDisTonos(disTonos + 1)}
            className="w-7 h-7 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 flex items-center justify-center font-sans"
          >
            +
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
}
