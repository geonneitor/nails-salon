'use client';

import React from 'react';
import { RotateCcw, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SectionWrapperProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onReset: () => void;
  onSettings?: () => void;
}

export function SectionWrapper({ title, icon, children, onReset, onSettings }: SectionWrapperProps) {
  const router = useRouter();

  const handleSettings = () => {
    if (onSettings) {
      onSettings();
    } else {
      router.push('/reserva/servicios');
    }
  };

  return (
    <div className="bg-surface-container-low border border-secundario-zen/60 rounded-3xl p-5 flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="flex justify-between items-center">
        <h3 className="font-serif text-lg text-primario-zen flex items-center gap-1.5 font-bold">
          {icon} {title}
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSettings}
            className="text-[10px] font-semibold text-primario-zen/40 hover:text-primario-zen flex items-center justify-center bg-secundario-zen/20 w-6 h-6 rounded-full transition-colors"
            title="Configurar este servicio"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onReset}
            className="text-[10px] font-semibold text-primario-zen/40 hover:text-primario-zen flex items-center gap-1 bg-secundario-zen/20 px-2.5 py-1 rounded-full"
          >
            <RotateCcw className="w-3 h-3" /> Reiniciar
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
