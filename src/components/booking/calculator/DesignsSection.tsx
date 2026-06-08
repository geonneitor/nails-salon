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
}

export function DesignsSection({ dis, setDis, disTonos, setDisTonos, onReset }: DesignsSectionProps) {
  const adjObj = (key: string, delta: number) => {
    setDis((prev) => {
      const current = prev[key] ?? 0;
      const nextVal = Math.max(0, current + delta);
      return { ...prev, [key]: nextVal };
    });
  };

  return (
    <SectionWrapper title="Diseños Completos" icon={<Palette className="w-4 h-4" />} onReset={onReset}>
      <p className="text-[10px] text-primario-zen/60 italic mb-2">Multiplica la cantidad de uñas por diseño.</p>
      <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
        {DISENOS_COMPLETOS.map((d) => {
          const qty = dis[d.name] ?? 0;
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
            onClick={() => setDisTonos(Math.max(0, disTonos - 1))}
            className="w-7 h-7 rounded-full bg-secundario-zen/30 hover:bg-secundario-zen/50 text-primario-zen flex items-center justify-center"
          >
            -
          </button>
          <span className="text-sm font-bold text-primario-zen w-5 text-center">{disTonos}</span>
          <button
            type="button"
            onClick={() => setDisTonos(disTonos + 1)}
            className="w-7 h-7 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
}
