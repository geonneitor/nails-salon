'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDynamicServices } from '@/hooks/useDynamicServices';
import { ArrowLeft, Check, Plus, Minus } from 'lucide-react';

export default function ServiceStep({ data, onSelect }: { data: any, onSelect: (ticket: any) => void }) {
  const { categories, variants, modifiers, isLoading } = useDynamicServices();
  
  const [stage, setStage] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, number>>({});

  const activeCategory = useMemo(() => categories.find(c => c.id === selectedCategoryId), [categories, selectedCategoryId]);
  const catVariants = useMemo(() => variants.filter(v => v.category_id === selectedCategoryId && v.is_active), [variants, selectedCategoryId]);
  const catModifiers = useMemo(() => modifiers.filter(m => m.category_id === selectedCategoryId && m.is_active), [modifiers, selectedCategoryId]);

  const activeCategories = categories.filter(c => c.is_active && c.selection_type !== 'add_on');

  const handleSelectCategory = (id: string) => {
    setSelectedCategoryId(id);
    setSelectedVariantId(null);  // RESET: limpiar variante anterior
    setSelectedModifiers({});    // RESET: limpiar modificadores anteriores
    setStage(1);
  };

  const handleModifierQuantity = (id: string, delta: number) => {
    setSelectedModifiers(prev => {
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

  const currentTotal = useMemo(() => {
    let price = 0;
    let duration = 0;
    let names: string[] = [];

    if (activeCategory) names.push(activeCategory.name);

    if (selectedVariantId) {
      const v = variants.find(v => v.id === selectedVariantId);
      if (v) {
        price += v.base_price;
        duration += v.base_duration_minutes;
        names.push(v.name);
      }
    }

    Object.entries(selectedModifiers).forEach(([modId, qty]) => {
      const m = modifiers.find(x => x.id === modId);
      if (m && qty > 0) {
        price += m.price_delta * qty;
        duration += m.duration_delta * qty;
        names.push(`${m.name}${qty > 1 ? ` (x${qty})` : ''}`);
      }
    });

    return { price, duration, names };
  }, [selectedVariantId, selectedModifiers, activeCategory, variants, modifiers]);

  const handleContinue = () => {
    if (catVariants.length > 0 && !selectedVariantId) return;
    onSelect({
      activeServices: currentTotal.names,
      totalPrice: currentTotal.price,
      totalDuration: currentTotal.duration,
      categoryId: selectedCategoryId,
      variantId: selectedVariantId,
      modifiers: selectedModifiers,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-primario-zen/50 animate-pulse">
        <div className="w-8 h-8 rounded-full border-2 border-primario-zen border-t-transparent animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest font-semibold">Cargando Opciones...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto pb-24">
      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div key="stage0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
            <h2 className="text-primario-zen font-serif text-3xl text-center mb-2">¿Qué buscas hoy?</h2>
            <p className="text-primario-zen/60 font-sans text-sm text-center mb-8">Elige tu servicio principal para empezar a personalizarlo.</p>
            
            <div className="flex flex-col gap-4">
              {activeCategories.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCategory(c.id)}
                  className="w-full bg-white/60 border border-secundario-zen/40 hover:border-accent-gold/50 p-5 rounded-2xl text-left transition-all hover:bg-white flex items-center justify-between group"
                >
                  <span className="font-serif text-xl text-primario-zen">{c.name}</span>
                  <div className="w-8 h-8 rounded-full bg-fondo-zen flex items-center justify-center border border-secundario-zen/30 group-hover:bg-accent-gold/10 transition-colors">
                    <ArrowLeft className="w-4 h-4 text-primario-zen rotate-180" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {stage === 1 && activeCategory && (
          <motion.div key="stage1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full">
            <button onClick={() => setStage(0)} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primario-zen/60 hover:text-primario-zen mb-6">
              <ArrowLeft className="w-4 h-4" /> Volver a categorías
            </button>
            
            <h2 className="text-primario-zen font-serif text-3xl mb-8 border-b border-secundario-zen/50 pb-4">{activeCategory.name}</h2>

            {/* Base Variants */}
            {catVariants.length > 0 && (
              <div className="mb-10">
                <h3 className="text-[11px] uppercase tracking-widest font-bold text-primario-zen/60 mb-4">Selecciona tu Base (Obligatorio)</h3>
                <div className="flex flex-col gap-3">
                  {catVariants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex justify-between items-center ${selectedVariantId === v.id ? 'bg-primario-zen text-white border-primario-zen' : 'bg-white/60 border-secundario-zen/40 hover:border-primario-zen/50'}`}
                    >
                      <span className={`font-medium ${selectedVariantId === v.id ? 'text-white' : 'text-primario-zen'}`}>{v.name}</span>
                      <span className={`text-sm ${selectedVariantId === v.id ? 'text-white/80' : 'text-primario-zen/60'}`}>${v.base_price} MXN</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons / Modifiers */}
            {catModifiers.length > 0 && (
              <div className="mb-8">
                <h3 className="text-[11px] uppercase tracking-widest font-bold text-primario-zen/60 mb-4">Diseños y Adicionales (Opcional)</h3>
                <div className="flex flex-col gap-3">
                  {catModifiers.map(m => {
                    const qty = selectedModifiers[m.id] || 0;
                    const isPerUnit = m.modifier_type === 'per_unit';

                    return (
                      <div key={m.id} className="w-full p-4 rounded-2xl bg-white/60 border border-secundario-zen/40 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-primario-zen text-sm">{m.name}</p>
                          <p className="text-xs text-primario-zen/60">+${m.price_delta} MXN {isPerUnit && 'c/u'}</p>
                        </div>
                        
                        {isPerUnit ? (
                          <div className="flex items-center gap-3 bg-fondo-zen border border-secundario-zen/30 rounded-full px-2 py-1">
                            <button onClick={() => handleModifierQuantity(m.id, -1)} className="w-7 h-7 flex items-center justify-center text-primario-zen hover:bg-secundario-zen/20 rounded-full"><Minus className="w-3 h-3" /></button>
                            <span className="text-sm font-semibold w-4 text-center">{qty}</span>
                            <button onClick={() => handleModifierQuantity(m.id, 1)} className="w-7 h-7 flex items-center justify-center text-primario-zen hover:bg-secundario-zen/20 rounded-full"><Plus className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleModifierQuantity(m.id, qty > 0 ? -1 : 1)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors border ${qty > 0 ? 'bg-primario-zen border-primario-zen text-white' : 'border-secundario-zen/40 hover:border-primario-zen text-transparent'}`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Total Bar for Mobile (and Desktop) */}
      {stage === 1 && (
        <motion.div
          initial={{ y: 100 }} animate={{ y: 0 }}
          className="fixed bottom-0 left-0 w-full bg-white border-t border-secundario-zen/30 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50"
        >
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-primario-zen/50 font-bold">Total Estimado</span>
              <span className="font-serif text-2xl text-primario-zen">${currentTotal.price} MXN</span>
              {currentTotal.duration > 0 && <span className="text-xs text-primario-zen/60">~{currentTotal.duration} min</span>}
            </div>
            
            <button
              onClick={handleContinue}
              disabled={catVariants.length > 0 && !selectedVariantId}
              className="bg-primario-zen text-white px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:bg-primario-zen/90 transition-all"
            >
              Continuar
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
