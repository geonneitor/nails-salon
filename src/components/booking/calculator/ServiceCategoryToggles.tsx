'use client';

import React from 'react';
import { Sparkles, Palette, Gem, Wrench, Shield, Hand, Footprints } from 'lucide-react';

interface Category {
  id: string;
  label: string;
  icon: React.ElementType;
}

const SERVICE_CATEGORIES: Category[] = [
  { id: 'fullset', label: 'Full Set', icon: Sparkles },
  { id: 'disenos', label: 'Diseños', icon: Palette },
  { id: 'deco', label: 'Decoraciones', icon: Gem },
  { id: 'repo', label: 'Reposiciones', icon: Wrench },
  { id: 'gel', label: 'Gel Protección', icon: Shield },
  { id: 'mani', label: 'Manicura', icon: Hand },
  { id: 'pedi', label: 'Pedicura', icon: Footprints },
];

interface ServiceCategoryTogglesProps {
  activeServices: Set<string>;
  onToggle: (id: string) => void;
}

export function ServiceCategoryToggles({ activeServices, onToggle }: ServiceCategoryTogglesProps) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50 mb-2 block">
        Categorías de Servicios
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SERVICE_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeServices.has(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onToggle(cat.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                isActive
                  ? 'bg-primario-zen text-fondo-zen border-primario-zen shadow-sm'
                  : 'bg-secundario-zen/20 border-secundario-zen/50 text-primario-zen/70 hover:bg-secundario-zen/30'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[11px] font-semibold tracking-wide">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
