'use client';

import React from 'react';
import { Footprints } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';
import { PEDIS } from '@/lib/nail-menu-config';

interface PediSectionProps {
  pedi: string | null;
  setPedi: (v: string | null) => void;
  pediTonos: number;
  setPediTonos: (v: number) => void;
  onReset: () => void;
  categories?: any[];
  variants?: any[];
  modifiers?: any[];
}

export function PediSection({
  pedi,
  setPedi,
  pediTonos,
  setPediTonos,
  onReset,
  categories,
  variants,
  modifiers
}: PediSectionProps) {
  const pediCategory = categories?.find(c => c.name.toLowerCase().includes('pedi'));
  const dbPedis = pediCategory && variants
    ? variants.filter(v => v.category_id === pediCategory.id && v.is_active)
    : [];
  const displayPedis = dbPedis.length > 0
    ? dbPedis.map(v => ({ name: v.name, price: Number(v.base_price) }))
    : PEDIS;

  const extraTonoMod = pediCategory && modifiers
    ? modifiers.find(m => m.category_id === pediCategory.id && m.name.toLowerCase().includes('tono'))
    : null;
  const pediTonoPrice = extraTonoMod ? Number(extraTonoMod.price_delta) : 5;

  return (
    <SectionWrapper title="Pedicura Spa" icon={<Footprints className="w-4 h-4" />} onReset={onReset}>
      <div className="flex flex-col gap-2">
        {displayPedis.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => setPedi(pedi === p.name ? null : p.name)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border text-left transition-all ${
              pedi === p.name
                ? 'bg-primario-zen text-fondo-zen border-primario-zen'
                : 'bg-secundario-zen/10 border-secundario-zen/40 text-primario-zen/80 hover:bg-secundario-zen/25'
            }`}
          >
            {p.name} (${p.price})
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-secundario-zen/30 pt-3">
        <span className="text-xs font-semibold text-primario-zen/85 font-sans">Tonos extra (+${pediTonoPrice} c/u)</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPediTonos(Math.max(0, pediTonos - 1))}
            className="w-7 h-7 rounded-full bg-secundario-zen/30 hover:bg-secundario-zen/50 text-primario-zen flex items-center justify-center font-sans"
          >
            -
          </button>
          <span className="text-sm font-bold text-primario-zen w-5 text-center font-sans">{pediTonos}</span>
          <button
            type="button"
            onClick={() => setPediTonos(pediTonos + 1)}
            className="w-7 h-7 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 flex items-center justify-center font-sans"
          >
            +
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
}
