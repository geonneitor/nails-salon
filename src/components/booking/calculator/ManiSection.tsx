'use client';

import React from 'react';
import { Hand } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';
import { MANIS } from '@/lib/nail-menu-config';

interface ManiSectionProps {
  mani: string | null;
  setMani: (v: string | null) => void;
  maniTonos: number;
  setManiTonos: (v: number) => void;
  onReset: () => void;
}

export function ManiSection({ mani, setMani, maniTonos, setManiTonos, onReset }: ManiSectionProps) {
  return (
    <SectionWrapper title="Manicura" icon={<Hand className="w-4 h-4" />} onReset={onReset}>
      <div className="flex flex-wrap gap-2">
        {MANIS.map((m) => (
          <button
            key={m.name}
            type="button"
            onClick={() => setMani(mani === m.name ? null : m.name)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              mani === m.name
                ? 'bg-primario-zen text-fondo-zen border-primario-zen'
                : 'bg-secundario-zen/10 border-secundario-zen/40 text-primario-zen/80 hover:bg-secundario-zen/25'
            }`}
          >
            {m.name} (${m.price})
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-secundario-zen/30 pt-3">
        <span className="text-xs font-semibold text-primario-zen/85">Tonos extra (+$5 c/u)</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setManiTonos(Math.max(0, maniTonos - 1))}
            className="w-7 h-7 rounded-full bg-secundario-zen/30 hover:bg-secundario-zen/50 text-primario-zen flex items-center justify-center"
          >
            -
          </button>
          <span className="text-sm font-bold text-primario-zen w-5 text-center">{maniTonos}</span>
          <button
            type="button"
            onClick={() => setManiTonos(maniTonos + 1)}
            className="w-7 h-7 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
}
