'use client';

import React from 'react';
import { Gem } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';
import { DECOS } from '@/lib/nail-menu-config';

interface DecorationsSectionProps {
  deco: Record<string, number>;
  setDeco: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  decoTonos: number;
  setDecoTonos: (v: number) => void;
  onReset: () => void;
}

export function DecorationsSection({ deco, setDeco, decoTonos, setDecoTonos, onReset }: DecorationsSectionProps) {
  const adjObj = (key: string, delta: number) => {
    setDeco((prev) => {
      const current = prev[key] ?? 0;
      const nextVal = Math.max(0, current + delta);
      return { ...prev, [key]: nextVal };
    });
  };

  return (
    <SectionWrapper title="Decoraciones por Uña" icon={<Gem className="w-4 h-4" />} onReset={onReset}>
      <p className="text-[10px] text-primario-zen/60 italic mb-2">Selecciona la cantidad de uñas decoradas.</p>
      <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
        {DECOS.map((d) => {
          const qty = deco[d.name] ?? 0;
          return (
            <div key={d.name} className="flex items-center justify-between py-1 border-b border-secundario-zen/20">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-primario-zen">{d.name}</span>
                <span className="text-[10px] text-primario-zen/50">${d.price} MXN / uña</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => adjObj(d.name, -1)}
                  className="w-7 h-7 rounded-full bg-secundario-zen/30 hover:bg-secundario-zen/50 text-primario-zen flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-sm font-bold text-primario-zen w-5 text-center">{qty}</span>
                <button
                  type="button"
                  onClick={() => adjObj(d.name, 1)}
                  className="w-7 h-7 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-secundario-zen/30 pt-3">
        <span className="text-xs font-semibold text-primario-zen/85">Tonos extra (+$5 c/u)</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDecoTonos(Math.max(0, decoTonos - 1))}
            className="w-7 h-7 rounded-full bg-secundario-zen/30 hover:bg-secundario-zen/50 text-primario-zen flex items-center justify-center"
          >
            -
          </button>
          <span className="text-sm font-bold text-primario-zen w-5 text-center">{decoTonos}</span>
          <button
            type="button"
            onClick={() => setDecoTonos(decoTonos + 1)}
            className="w-7 h-7 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
}
