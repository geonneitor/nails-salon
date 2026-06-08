'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';
import { GELS } from '@/lib/nail-menu-config';

interface GelSectionProps {
  gel: string | null;
  setGel: (v: string | null) => void;
  gelTonos: number;
  setGelTonos: (v: number) => void;
  onReset: () => void;
}

export function GelSection({ gel, setGel, gelTonos, setGelTonos, onReset }: GelSectionProps) {
  return (
    <SectionWrapper title="Gel Protección" icon={<Shield className="w-4 h-4" />} onReset={onReset}>
      <div className="flex flex-wrap gap-2">
        {GELS.map((g) => (
          <button
            key={g.name}
            type="button"
            onClick={() => setGel(gel === g.name ? null : g.name)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              gel === g.name
                ? 'bg-primario-zen text-fondo-zen border-primario-zen'
                : 'bg-secundario-zen/10 border-secundario-zen/40 text-primario-zen/80 hover:bg-secundario-zen/25'
            }`}
          >
            {g.name} (${g.price})
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-secundario-zen/30 pt-3">
        <span className="text-xs font-semibold text-primario-zen/85">Tonos extra (+$5 c/u)</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setGelTonos(Math.max(0, gelTonos - 1))}
            className="w-7 h-7 rounded-full bg-secundario-zen/30 hover:bg-secundario-zen/50 text-primario-zen flex items-center justify-center"
          >
            -
          </button>
          <span className="text-sm font-bold text-primario-zen w-5 text-center">{gelTonos}</span>
          <button
            type="button"
            onClick={() => setGelTonos(gelTonos + 1)}
            className="w-7 h-7 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
}
