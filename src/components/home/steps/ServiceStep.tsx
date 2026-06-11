'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDynamicServices } from '@/hooks/useDynamicServices';
import { 
  ArrowLeft, 
  Check, 
  Plus, 
  Minus, 
  Sparkles, 
  Shield, 
  Heart, 
  Scissors, 
  Clock, 
  ArrowRight,
  Sparkle
} from 'lucide-react';

// ============================================================
// METADATOS DE DISEÑO Y PERSONALIZACIÓN DE CATEGORÍAS
// Asocia colores, iconos y descripciones boutique a cada categoría
// ============================================================
const getCategoryMeta = (name: string) => {
  const normalized = name.toLowerCase().trim();
  
  if (normalized.includes('full set') || normalized.includes('acril')) {
    return {
      subtitle: 'Alargamiento y escultura con acrílico de autor y técnicas premium.',
      badge: 'Popular',
      gradient: 'from-amber-500/[0.04] to-amber-500/[0.01] hover:from-amber-500/[0.08] hover:to-amber-500/[0.03]',
      badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/50',
      iconBg: 'bg-amber-100/80 dark:bg-amber-950/60',
      iconColor: 'text-amber-700 dark:text-amber-300',
      icon: Sparkles,
      borderColor: 'border-amber-200/40 hover:border-amber-400/60',
      shadowGlow: 'hover:shadow-[0_8px_30px_rgba(212,175,55,0.08)]'
    };
  }
  
  if (normalized.includes('gel') || normalized.includes('protec')) {
    return {
      subtitle: 'Fortalecimiento, brillo prolongado y máximo cuidado natural.',
      badge: 'Protección',
      gradient: 'from-purple-500/[0.04] to-purple-500/[0.01] hover:from-purple-500/[0.08] hover:to-purple-500/[0.03]',
      badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/50',
      iconBg: 'bg-purple-100/80 dark:bg-purple-950/60',
      iconColor: 'text-purple-700 dark:text-purple-300',
      icon: Shield,
      borderColor: 'border-purple-200/40 hover:border-purple-400/60',
      shadowGlow: 'hover:shadow-[0_8px_30px_rgba(180,160,200,0.1)]'
    };
  }

  if (normalized.includes('pedi') || normalized.includes('pie')) {
    return {
      subtitle: 'Exfoliación profunda con sales marinas y masaje hidro-relajante.',
      badge: 'Relax Spa',
      gradient: 'from-blue-500/[0.04] to-blue-500/[0.01] hover:from-blue-500/[0.08] hover:to-blue-500/[0.03]',
      badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/50',
      iconBg: 'bg-blue-100/80 dark:bg-blue-950/60',
      iconColor: 'text-blue-700 dark:text-blue-300',
      icon: Scissors,
      borderColor: 'border-blue-200/40 hover:border-blue-400/60',
      shadowGlow: 'hover:shadow-[0_8px_30px_rgba(59,130,246,0.08)]'
    };
  }

  if (normalized.includes('mani') || normalized.includes('mano')) {
    return {
      subtitle: 'Ritual clásico de embellecimiento, nutrición e hidratación premium.',
      badge: 'Esencial',
      gradient: 'from-emerald-500/[0.04] to-emerald-500/[0.01] hover:from-emerald-500/[0.08] hover:to-emerald-500/[0.03]',
      badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/50',
      iconBg: 'bg-emerald-100/80 dark:bg-emerald-950/60',
      iconColor: 'text-emerald-700 dark:text-emerald-300',
      icon: Heart,
      borderColor: 'border-emerald-200/40 hover:border-emerald-400/60',
      shadowGlow: 'hover:shadow-[0_8px_30px_rgba(52,70,35,0.08)]'
    };
  }

  // Fallback por defecto
  return {
    subtitle: 'Personaliza tu ritual con nuestra selección de alta gama y detalle.',
    badge: 'Servicio',
    gradient: 'from-primary/[0.02] to-transparent hover:from-primary/[0.05] hover:to-primary/[0.01]',
    badgeBg: 'bg-stone-100 text-stone-800 dark:bg-stone-900/40 dark:text-stone-300 border-stone-200/50',
    iconBg: 'bg-stone-100/80 dark:bg-stone-900/60',
    iconColor: 'text-stone-700 dark:text-stone-300',
    icon: Sparkles,
    borderColor: 'border-outline-variant/30 hover:border-primario-zen/40',
    shadowGlow: 'hover:shadow-lg'
  };
};

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
    setSelectedVariantId(null);  // RESET
    setSelectedModifiers({});    // RESET
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
      <div className="flex flex-col items-center justify-center py-24 text-primario-zen/50 animate-pulse">
        <div className="w-10 h-10 rounded-full border-2 border-primario-zen border-t-transparent animate-spin mb-4" />
        <p className="text-xs uppercase tracking-[0.2em] font-semibold">Cargando rituales...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-24">
      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div 
            key="stage0" 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col items-center"
          >
            {/* Header Stage 0 */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 bg-primario-zen/8 px-4 py-1.5 rounded-full mb-3">
                <Sparkle className="w-3.5 h-3.5 text-primario-zen/60" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-primario-zen/60">
                  Paso 1 · Servicios
                </span>
              </div>
              <h2 className="text-primario-zen font-serif text-3xl mb-2">¿Qué ritual buscas hoy?</h2>
              <p className="text-primario-zen/50 font-sans text-sm max-w-md mx-auto leading-relaxed">
                Selecciona la categoría principal para tu cita y personalízala a tu gusto.
              </p>
            </div>

            {/* Grid de Categorías Bento-Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
              {activeCategories.map(c => {
                const meta = getCategoryMeta(c.name);
                const Icon = meta.icon;
                return (
                  <motion.button
                    key={c.id}
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelectCategory(c.id)}
                    className={`w-full text-left p-6 rounded-3xl border bg-surface-container-lowest/70 backdrop-blur-sm transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${meta.borderColor} ${meta.gradient} ${meta.shadowGlow}`}
                  >
                    {/* Top line: Icon & Badge */}
                    <div className="flex items-start justify-between w-full mb-8">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${meta.iconBg}`}>
                        <Icon className={`w-6 h-6 ${meta.iconColor}`} strokeWidth={1.5} />
                      </div>
                      
                      {meta.badge && (
                        <span className={`text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border ${meta.badgeBg}`}>
                          {meta.badge}
                        </span>
                      )}
                    </div>

                    {/* Content: Title & Subtitle */}
                    <div className="mb-6">
                      <h3 className="font-serif text-2xl text-primario-zen mb-2 leading-tight">
                        {c.name}
                      </h3>
                      <p className="font-sans text-xs text-primario-zen/50 leading-relaxed font-light">
                        {meta.subtitle}
                      </p>
                    </div>

                    {/* Action Link */}
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-primario-zen/60 group-hover:text-primario-zen transition-colors mt-auto">
                      <span>Personalizar</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {stage === 1 && activeCategory && (
          <motion.div 
            key="stage1" 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            {/* Volver */}
            <button 
              onClick={() => setStage(0)} 
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primario-zen/40 hover:text-primario-zen mb-8 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver a categorías
            </button>
            
            {/* Categoría Seleccionada Header */}
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-outline-variant/30">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getCategoryMeta(activeCategory.name).iconBg}`}>
                {React.createElement(getCategoryMeta(activeCategory.name).icon, {
                  className: `w-7 h-7 ${getCategoryMeta(activeCategory.name).iconColor}`,
                  strokeWidth: 1.5
                })}
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest font-bold text-primario-zen/40">Categoría</span>
                <h2 className="text-primario-zen font-serif text-3xl leading-none">{activeCategory.name}</h2>
              </div>
            </div>

            {/* Base Variants (Obligatorio) */}
            {catVariants.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-primario-zen/40">
                    Selecciona tu base <span className="text-error">*</span>
                  </h3>
                  <span className="text-[10px] text-primario-zen/40 font-medium font-sans">Obligatorio</span>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {catVariants.map(v => {
                    const isSelected = selectedVariantId === v.id;
                    return (
                      <motion.button
                        key={v.id}
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.995 }}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`w-full p-5 rounded-2xl border text-left transition-all flex justify-between items-center relative overflow-hidden ${
                          isSelected 
                            ? 'bg-primario-zen text-white border-primario-zen shadow-md shadow-primario-zen/10' 
                            : 'bg-surface-container-lowest/80 border-outline-variant/40 text-primario-zen hover:border-primario-zen/40 hover:bg-surface-container-lowest'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Bullet Circular con Check */}
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'bg-white border-white text-primario-zen' 
                              : 'border-primario-zen/20 text-transparent'
                          }`}>
                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                          </div>
                          <span className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-primario-zen'}`}>
                            {v.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {v.base_duration_minutes > 0 && (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded ${
                              isSelected ? 'bg-white/10 text-white/90' : 'bg-surface-container text-primario-zen/50'
                            }`}>
                              <Clock className="w-3 h-3" />
                              {v.base_duration_minutes} min
                            </span>
                          )}
                          <span className={`font-serif text-sm ${isSelected ? 'text-white' : 'text-primario-zen/80'}`}>
                            ${v.base_price} MXN
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add-ons / Modifiers (Opcional) */}
            {catModifiers.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-primario-zen/40">
                    Diseños y adicionales
                  </h3>
                  <span className="text-[10px] text-primario-zen/40 font-medium font-sans">Opcional</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {catModifiers.map(m => {
                    const qty = selectedModifiers[m.id] || 0;
                    const isPerUnit = m.modifier_type === 'per_unit';
                    const isSelected = qty > 0;

                    return (
                      <div 
                        key={m.id} 
                        className={`w-full p-5 rounded-2xl border transition-all flex justify-between items-center bg-surface-container-lowest/80 ${
                          isSelected ? 'border-primario-zen/50 shadow-sm' : 'border-outline-variant/40'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-primario-zen text-sm">{m.name}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs text-primario-zen/50 font-medium">
                              +${m.price_delta} MXN {isPerUnit && 'c/u'}
                            </span>
                            {m.duration_delta > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-primario-zen/40 font-medium">
                                <Clock className="w-2.5 h-2.5" />
                                +{m.duration_delta} min
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {isPerUnit ? (
                          <div className="flex items-center gap-3 bg-surface-container/50 border border-outline-variant/30 rounded-full px-2 py-1 select-none">
                            <button 
                              onClick={() => handleModifierQuantity(m.id, -1)} 
                              className="w-7 h-7 flex items-center justify-center text-primario-zen/60 hover:text-primario-zen hover:bg-surface-container rounded-full transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm font-semibold w-4 text-center text-primario-zen">{qty}</span>
                            <button 
                              onClick={() => handleModifierQuantity(m.id, 1)} 
                              className="w-7 h-7 flex items-center justify-center text-primario-zen/60 hover:text-primario-zen hover:bg-surface-container rounded-full transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleModifierQuantity(m.id, qty > 0 ? -1 : 1)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all border ${
                              qty > 0 
                                ? 'bg-primario-zen border-primario-zen text-white' 
                                : 'border-outline-variant/60 hover:border-primario-zen text-transparent'
                            }`}
                          >
                            <Check className="w-4.5 h-4.5" strokeWidth={2.5} />
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

      {/* Barra de Totales Flotante Vidrio-Premium */}
      {stage === 1 && (
        <motion.div
          initial={{ y: 100 }} 
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 w-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-t border-outline-variant/30 py-4 px-6 shadow-[0_-12px_40px_rgba(0,0,0,0.06)] z-50"
        >
          <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-primario-zen/40 font-bold">Total Estimado</span>
              <span className="font-serif text-3xl text-primario-zen leading-none">${currentTotal.price} MXN</span>
              {currentTotal.duration > 0 && (
                <span className="text-[10px] text-primario-zen/50 font-medium font-sans mt-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Duración aproximada: {currentTotal.duration} min
                </span>
              )}
            </div>
            
            <button
              onClick={handleContinue}
              disabled={catVariants.length > 0 && !selectedVariantId}
              className="bg-primario-zen text-white px-10 py-4 rounded-full text-xs font-semibold uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed shadow-md hover:bg-primario-zen/90 hover:shadow-lg transition-all"
            >
              Continuar
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
