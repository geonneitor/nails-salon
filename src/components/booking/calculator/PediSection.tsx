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
}

export function PediSection({ pedi, setPedi, pediTonos, setPediTonos, onReset }: PediSectionProps) {
  return (
    <SectionWrapper title="Pedicura Spa" icon={<Footprints className="w-4 h-4" />} onReset={onReset}>
      <div className="flex flex-col gap-2">
        {PEDIS.map((p) => (
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
        <span className="text-xs font-semibold text-primario-zen/85">Tonos extra (+$5 c/u)</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPediTonos(Math.max(0, pediTonos - 1))}
            className="w-7 h-7 rounded-full bg-secundario-zen/30 hover:bg-secundario-zen/50 text-primario-zen flex items-center justify-center"
          >
            -
          </button>
          <span className="text-sm font-bold text-primario-zen w-5 text-center">{pediTonos}</span>
          <button
            type="button"
            onClick={() => setPediTonos(pediTonos + 1)}
            className="w-7 h-7 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
}
