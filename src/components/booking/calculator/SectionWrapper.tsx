'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';

interface SectionWrapperProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onReset: () => void;
}

export function SectionWrapper({ title, icon, children, onReset }: SectionWrapperProps) {
  return (
    <div className="bg-surface-container-low border border-secundario-zen/60 rounded-3xl p-5 flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="flex justify-between items-center">
        <h3 className="font-serif text-lg text-primario-zen flex items-center gap-1.5 font-bold">
          {icon} {title}
        </h3>
        <button
          type="button"
          onClick={onReset}
          className="text-[10px] font-semibold text-primario-zen/40 hover:text-primario-zen flex items-center gap-1 bg-secundario-zen/20 px-2.5 py-1 rounded-full"
        >
          <RotateCcw className="w-3 h-3" /> Reiniciar
        </button>
      </div>
      {children}
    </div>
  );
}
