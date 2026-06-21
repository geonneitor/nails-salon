'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, Plus, Minus, Sparkles, Shield, Heart, Scissors } from 'lucide-react';
import type { ServiceCategory, ServiceVariant, ServiceModifier } from '@/types/supabase';

interface DynamicServiceSelectorProps {
  categories: ServiceCategory[];
  variants: ServiceVariant[];
  modifiers: ServiceModifier[];
  selectedCategoryIds: string[];
  onChangeCategoryIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  selectedVariants: Record<string, string>;
  onChangeVariants: (variants: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  selectedModifiers: Record<string, number>;
  onChangeModifiers: (modifiers: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => void;
}

const getCategoryMeta = (name: string) => {
  const normalized = name.toLowerCase().trim();
  if (normalized.includes('full set') || normalized.includes('acril')) {
    return { subtitle: 'Alargamiento y escultura con acrílico de autor.', icon: Sparkles, bgActive: 'bg-amber-50/50 dark:bg-amber-900/20', borderActive: 'border-amber-400 dark:border-amber-500' };
  }
  if (normalized.includes('gel') || normalized.includes('protec')) {
    return { subtitle: 'Fortalecimiento y brillo de alta duración.', icon: Shield, bgActive: 'bg-purple-50/50 dark:bg-purple-900/20', borderActive: 'border-purple-400 dark:border-purple-500' };
  }
  if (normalized.includes('pedi') || normalized.includes('pie')) {
    return { subtitle: 'Exfoliación profunda y masaje hidro-relajante.', icon: Scissors, bgActive: 'bg-blue-50/50 dark:bg-blue-900/20', borderActive: 'border-blue-400 dark:border-blue-500' };
  }
  if (normalized.includes('mani') || normalized.includes('mano')) {
    return { subtitle: 'Ritual clásico de embellecimiento y nutrición.', icon: Heart, bgActive: 'bg-emerald-50/50 dark:bg-emerald-900/20', borderActive: 'border-emerald-400 dark:border-emerald-500' };
  }
  return { subtitle: 'Personaliza tu ritual con nuestra selección.', icon: Sparkles, bgActive: 'bg-primary/10', borderActive: 'border-primary' };
};

export function DynamicServiceSelector({
  categories,
  variants,
  modifiers,
  selectedCategoryIds,
  onChangeCategoryIds,
  selectedVariants,
  onChangeVariants,
  selectedModifiers,
  onChangeModifiers
}: DynamicServiceSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const activeCategories = useMemo(() => {
    return categories.filter(c => c.is_active && c.selection_type !== 'add_on');
  }, [categories]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return activeCategories;
    const lowerQ = searchQuery.toLowerCase();
    return activeCategories.filter(c => c.name.toLowerCase().includes(lowerQ));
  }, [activeCategories, searchQuery]);

  const catModifiers = useMemo(() => {
    return modifiers.filter(m => selectedCategoryIds.includes(m.category_id!) && m.is_active);
  }, [modifiers, selectedCategoryIds]);

  const filteredModifiers = useMemo(() => {
    if (!searchQuery.trim()) return catModifiers;
    const lowerQ = searchQuery.toLowerCase();
    return catModifiers.filter(m => m.name.toLowerCase().includes(lowerQ));
  }, [catModifiers, searchQuery]);

  const handleModifierQuantity = (id: string, delta: number) => {
    onChangeModifiers(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Search Bar */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-on-surface-variant/50" />
        </div>
        <input
          type="text"
          placeholder="Buscar servicios o complementos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-sans"
        />
      </div>

      {/* Services Grid */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-serif text-2xl text-on-surface">Servicios</h2>
        </div>
        
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant/60 font-sans">
            No se encontraron servicios con ese nombre.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredCategories.map(c => {
              const meta = getCategoryMeta(c.name);
              const isSelected = selectedCategoryIds.includes(c.id);
              const catVariants = variants.filter(v => v.category_id === c.id && v.is_active);
              
              return (
                <motion.button
                  key={c.id}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ y: -2 }}
                  animate={{ y: isSelected ? -2 : 0 }}
                  onClick={() => {
                    onChangeCategoryIds(prev => prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]);
                  }}
                  className={`relative w-full text-left p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md
                    ${isSelected ? `${meta.bgActive} ${meta.borderActive}` : 'bg-surface-container-lowest border-outline-variant/30 hover:border-primary/50'}
                  `}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </div>
                  )}
                  <h3 className={`font-serif text-xl mb-2 pr-8 flex items-center gap-2 ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                    <motion.div animate={{ rotate: isSelected ? 4 : 0 }}>
                      {React.createElement(meta.icon, { className: 'w-4 h-4' })}
                    </motion.div>
                    {c.name}
                  </h3>
                  <p className="font-sans text-xs text-on-surface-variant font-light leading-relaxed mb-2">
                    {meta.subtitle}
                  </p>
                  
                  {/* Variantes */}
                  <AnimatePresence>
                    {isSelected && catVariants.length > 0 && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-2 pt-4 border-t border-primary/20 space-y-2"
                      >
                        <p className="text-[10px] uppercase tracking-widest font-bold text-primary/70 mb-2">Variantes</p>
                        {catVariants.map(v => (
                          <div 
                            key={v.id}
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              onChangeVariants(prev => ({...prev, [c.id]: v.id})); 
                            }}
                            className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                              selectedVariants[c.id] === v.id ? 'bg-background border-primary/50 text-primary font-semibold' : 'border-transparent text-on-surface hover:bg-background/50'
                            }`}
                          >
                            <span className="truncate pr-2">{v.name}</span>
                            <span className="whitespace-nowrap font-medium">${v.base_price}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        )}
      </section>

      {/* Modifiers (Complementos) */}
      <AnimatePresence>
        {selectedCategoryIds.length > 0 && filteredModifiers.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center gap-2 mb-4 mt-4">
              <Plus className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-2xl text-on-surface">Complementos Adicionales</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredModifiers.map(m => {
                const qty = selectedModifiers[m.id] || 0;
                const isSelected = qty > 0;
                const isPerUnit = m.modifier_type === 'per_unit';
                const parentCat = categories.find(c => c.id === m.category_id);

                return (
                  <div 
                    key={m.id}
                    onClick={() => !isPerUnit && handleModifierQuantity(m.id, isSelected ? -1 : 1)}
                    className={`relative flex flex-col items-center justify-center text-center p-4 rounded-xl border transition-all cursor-pointer select-none
                      ${isSelected ? 'bg-primary/5 border-primary shadow-sm' : 'bg-surface-container-lowest border-outline-variant/30 hover:border-primary/50'}
                    `}
                  >
                    {isSelected && !isPerUnit && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary text-on-primary flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" strokeWidth={3} />
                      </div>
                    )}
                    <span className={`text-xs font-semibold mb-0.5 ${isSelected ? 'text-primary' : 'text-on-surface'}`}>{m.name}</span>
                    {selectedCategoryIds.length > 1 && parentCat && (
                      <span className="text-[9px] uppercase tracking-wider text-on-surface-variant/70 mb-1">
                        Para {parentCat.name}
                      </span>
                    )}
                    <span className="text-[10px] text-on-surface-variant font-medium mt-1">+${m.price_delta}</span>

                    {isPerUnit && (
                      <div className="flex items-center gap-2 mt-3 bg-background border border-outline-variant/30 rounded-full px-2 py-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleModifierQuantity(m.id, -1)} className="w-6 h-6 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-on-surface">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center text-primary">{qty}</span>
                        <button onClick={() => handleModifierQuantity(m.id, 1)} className="w-6 h-6 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-on-surface">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
