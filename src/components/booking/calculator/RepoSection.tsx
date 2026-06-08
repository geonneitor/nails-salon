'use client';

import React from 'react';
import { Wrench } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';
import { REPOS } from '@/lib/nail-menu-config';

interface RepoSectionProps {
  repo: Record<string, number>;
  setRepo: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  repoTonos: number;
  setRepoTonos: (v: number) => void;
  onReset: () => void;
}

export function RepoSection({ repo, setRepo, repoTonos, setRepoTonos, onReset }: RepoSectionProps) {
  const adjObj = (key: string, delta: number) => {
    setRepo((prev) => {
      const current = prev[key] ?? 0;
      const nextVal = Math.max(0, current + delta);
      return { ...prev, [key]: nextVal };
    });
  };

  return (
    <SectionWrapper title="Reposiciones" icon={<Wrench className="w-4 h-4" />} onReset={onReset}>
      <div className="flex flex-col gap-2">
        {REPOS.map((r) => {
          const qty = repo[r.name] ?? 0;
          return (
            <div key={r.name} className="flex items-center justify-between py-1 border-b border-secundario-zen/20">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-primario-zen">{r.name}</span>
                <span className="text-[10px] text-primario-zen/50">${r.price} MXN / uña</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => adjObj(r.name, -1)}
                  className="w-7 h-7 rounded-full bg-secundario-zen/30 hover:bg-secundario-zen/50 text-primario-zen flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-sm font-bold text-primario-zen w-5 text-center">{qty}</span>
                <button
                  type="button"
                  onClick={() => adjObj(r.name, 1)}
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
            onClick={() => setRepoTonos(Math.max(0, repoTonos - 1))}
            className="w-7 h-7 rounded-full bg-secundario-zen/30 hover:bg-secundario-zen/50 text-primario-zen flex items-center justify-center"
          >
            -
          </button>
          <span className="text-sm font-bold text-primario-zen w-5 text-center">{repoTonos}</span>
          <button
            type="button"
            onClick={() => setRepoTonos(repoTonos + 1)}
            className="w-7 h-7 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
}
