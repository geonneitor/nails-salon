'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';
import { SISTEMAS, FORMAS, LARGOS } from '@/lib/nail-menu-config';

interface FullSetSectionProps {
  fsSistema: string | null;
  setFsSistema: (v: string | null) => void;
  fsForma: string | null;
  setFsForma: (v: string | null) => void;
  fsLargo: number | null;
  setFsLargo: (v: number | null) => void;
  fsTonos: number;
  setFsTonos: (v: number) => void;
  onReset: () => void;
  categories?: any[];
  variants?: any[];
  modifiers?: any[];
}

export function FullSetSection({
  fsSistema, setFsSistema,
  fsForma, setFsForma,
  fsLargo, setFsLargo,
  fsTonos, setFsTonos,
  onReset,
  categories,
  variants,
  modifiers
}: FullSetSectionProps) {
  const fsCategory = categories?.find(c => c.name.toLowerCase().includes('full set') || c.name.toLowerCase().includes('acril'));
  const dbSistemas = fsCategory && variants
    ? variants.filter(v => v.category_id === fsCategory.id && v.is_active)
    : [];
  
  const displaySistemas = dbSistemas.length > 0
    ? dbSistemas.map(v => ({ name: v.name, basePrice: Number(v.base_price) }))
    : SISTEMAS;

  const extraTonoMod = fsCategory && modifiers
    ? modifiers.find(m => m.category_id === fsCategory.id && m.name.toLowerCase().includes('tono'))
    : null;
  const fsTonoPrice = extraTonoMod ? Number(extraTonoMod.price_delta) : 5;

  return (
    <SectionWrapper title="Full Set" icon={<Sparkles className="w-4 h-4" />} onReset={onReset}>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-[9px] font-bold text-primario-zen/50 uppercase tracking-widest mb-1.5">Sistema</p>
          <div className="flex flex-wrap gap-2">
            {displaySistemas.map((sys) => (
              <button
                key={sys.name}
                type="button"
                onClick={() => setFsSistema(fsSistema === sys.name ? null : sys.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  fsSistema === sys.name
                    ? 'bg-primario-zen text-fondo-zen border-primario-zen'
                    : 'bg-secundario-zen/10 border-secundario-zen/40 text-primario-zen/80 hover:bg-secundario-zen/25'
                }`}
              >
                {sys.name} (${sys.basePrice})
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[9px] font-bold text-primario-zen/50 uppercase tracking-widest mb-1.5">Forma</p>
          <div className="flex flex-wrap gap-2">
            {FORMAS.map((forma) => (
              <button
                key={forma}
                type="button"
                onClick={() => setFsForma(fsForma === forma ? null : forma)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  fsForma === forma
                    ? 'bg-primario-zen text-fondo-zen border-primario-zen'
                    : 'bg-secundario-zen/10 border-secundario-zen/40 text-primario-zen/80 hover:bg-secundario-zen/25'
                }`}
              >
                {forma}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[9px] font-bold text-primario-zen/50 uppercase tracking-widest mb-1.5">Largo (Largo {'>'} 2 añade +$50 por nivel)</p>
          <div className="flex flex-wrap gap-1 pb-1 w-full">
            {LARGOS.map((largo) => (
              <button
                key={largo}
                type="button"
                onClick={() => setFsLargo(fsLargo === largo ? null : largo)}
                className={`min-w-[32px] h-8 rounded-full text-xs font-bold border transition-all flex items-center justify-center ${
                  fsLargo === largo
                    ? 'bg-primario-zen text-fondo-zen border-primario-zen'
                    : 'bg-secundario-zen/10 border-secundario-zen/40 text-primario-zen/80 hover:bg-secundario-zen/25'
                }`}
              >
                {largo}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-secundario-zen/30 pt-3">
          <span className="text-xs font-semibold text-primario-zen/85 font-sans">Tonos extra (+${fsTonoPrice} c/u)</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFsTonos(Math.max(0, fsTonos - 1))}
              className="w-7 h-7 rounded-full bg-secundario-zen/30 hover:bg-secundario-zen/50 text-primario-zen flex items-center justify-center font-bold font-sans"
            >
              -
            </button>
            <span className="text-sm font-bold text-primario-zen w-5 text-center font-sans">{fsTonos}</span>
            <button
              type="button"
              onClick={() => setFsTonos(fsTonos + 1)}
              className="w-7 h-7 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 flex items-center justify-center font-bold font-sans"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
