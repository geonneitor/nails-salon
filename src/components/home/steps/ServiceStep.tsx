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
  Sparkle,
  X
} from 'lucide-react';

// ============================================================
// METADATOS DE DISEÑO
// ============================================================
const getCategoryMeta = (name: string) => {
  const normalized = name.toLowerCase().trim();
  
  if (normalized.includes('full set') || normalized.includes('acril')) {
    return {
      subtitle: 'Alargamiento y escultura con acrílico de autor.',
      badge: 'Popular',
      bgSolid: 'bg-amber-50/80 dark:bg-amber-900/20',
      borderSolid: 'border-amber-200 dark:border-amber-700/50',
      iconBg: 'bg-amber-200/50 dark:bg-amber-800/50',
      iconColor: 'text-amber-800 dark:text-amber-300',
      icon: Sparkles,
      hoverRing: 'hover:ring-amber-400/50'
    };
  }
  
  if (normalized.includes('gel') || normalized.includes('protec')) {
    return {
      subtitle: 'Fortalecimiento y brillo de alta duración.',
      badge: 'Protección',
      bgSolid: 'bg-purple-50/80 dark:bg-purple-900/20',
      borderSolid: 'border-purple-200 dark:border-purple-700/50',
      iconBg: 'bg-purple-200/50 dark:bg-purple-800/50',
      iconColor: 'text-purple-800 dark:text-purple-300',
      icon: Shield,
      hoverRing: 'hover:ring-purple-400/50'
    };
  }

  if (normalized.includes('pedi') || normalized.includes('pie')) {
    return {
      subtitle: 'Exfoliación profunda y masaje hidro-relajante.',
      badge: 'Relax',
      bgSolid: 'bg-blue-50/80 dark:bg-blue-900/20',
      borderSolid: 'border-blue-200 dark:border-blue-700/50',
      iconBg: 'bg-blue-200/50 dark:bg-blue-800/50',
      iconColor: 'text-blue-800 dark:text-blue-300',
      icon: Scissors,
      hoverRing: 'hover:ring-blue-400/50'
    };
  }

  if (normalized.includes('mani') || normalized.includes('mano')) {
    return {
      subtitle: 'Ritual clásico de embellecimiento y nutrición.',
      badge: 'Esencial',
      bgSolid: 'bg-emerald-50/80 dark:bg-emerald-900/20',
      borderSolid: 'border-emerald-200 dark:border-emerald-700/50',
      iconBg: 'bg-emerald-200/50 dark:bg-emerald-800/50',
      iconColor: 'text-emerald-800 dark:text-emerald-300',
      icon: Heart,
      hoverRing: 'hover:ring-emerald-400/50'
    };
  }

  return {
    subtitle: 'Personaliza tu ritual con nuestra selección.',
    badge: 'Servicio',
    bgSolid: 'bg-surface-container dark:bg-surface-container-high',
    borderSolid: 'border-outline-variant/50',
    iconBg: 'bg-surface-container-highest',
    iconColor: 'text-on-surface',
    icon: Sparkles,
    hoverRing: 'hover:ring-primary/50'
  };
};

export default function ServiceStep({ data, onSelect }: { data: any, onSelect: (ticket: any) => void }) {
  const { categories, variants, modifiers, isLoading } = useDynamicServices();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, number>>({});

  const activeCategory = useMemo(() => categories.find(c => c.id === selectedCategoryId), [categories, selectedCategoryId]);
  const catVariants = useMemo(() => variants.filter(v => v.category_id === selectedCategoryId && v.is_active), [variants, selectedCategoryId]);
  const catModifiers = useMemo(() => modifiers.filter(m => m.category_id === selectedCategoryId && m.is_active), [modifiers, selectedCategoryId]);

  const activeCategories = categories.filter(c => c.is_active && c.selection_type !== 'add_on');

  const handleOpenCategory = (id: string) => {
    setSelectedCategoryId(id);
    setSelectedVariantId(null);
    setSelectedModifiers({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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

  const handleAddToCart = () => {
    if (catVariants.length > 0 && !selectedVariantId) return;
    setIsModalOpen(false);
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
      <div className="flex flex-col items-center justify-center py-24 text-primary/50 animate-pulse">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-xs uppercase tracking-[0.2em] font-semibold">Cargando servicios...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full mx-auto pb-8">
      {/* ── Vista Principal: Categorías ── */}
      <div className="w-full flex flex-col items-center">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 px-4 py-1.5 rounded-full mb-3">
            <Sparkle className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">
              Catálogo
            </span>
          </div>
          <h2 className="text-primary font-serif text-2xl md:text-3xl mb-2">¿Qué ritual buscas hoy?</h2>
        </div>

        {/* Grid de Categorías con Fondos Sólidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full">
          {activeCategories.map(c => {
            const meta = getCategoryMeta(c.name);
            const Icon = meta.icon;
            return (
              <motion.button
                key={c.id}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpenCategory(c.id)}
                className={`w-full text-left p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between group overflow-hidden shadow-sm hover:shadow-md hover:ring-2 ring-offset-2 ring-offset-background ${meta.bgSolid} ${meta.borderSolid} ${meta.hoverRing}`}
              >
                <div className="flex items-start justify-between w-full mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-sm ${meta.iconBg}`}>
                    <Icon className={`w-6 h-6 ${meta.iconColor}`} strokeWidth={1.5} />
                  </div>
                  {meta.badge && (
                    <span className="text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-background/50 backdrop-blur-md text-on-surface border border-outline-variant/30">
                      {meta.badge}
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="font-serif text-2xl text-on-surface mb-2 leading-tight">
                    {c.name}
                  </h3>
                  <p className="font-sans text-xs text-on-surface-variant leading-relaxed font-medium">
                    {meta.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-primary mt-auto bg-background/40 w-fit px-4 py-2 rounded-xl backdrop-blur-sm group-hover:bg-primary group-hover:text-white transition-colors">
                  <span>Configurar</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Modal de Configuración (Blur Overlay) ── */}
      <AnimatePresence>
        {isModalOpen && activeCategory && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center px-0 md:px-4">
            {/* Backdrop Blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full md:max-w-lg bg-surface-container-lowest md:rounded-[2rem] rounded-t-[2rem] shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/30 sticky top-0 bg-surface-container-lowest/90 backdrop-blur-md z-10 md:rounded-t-[2rem] rounded-t-[2rem]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryMeta(activeCategory.name).iconBg}`}>
                    {React.createElement(getCategoryMeta(activeCategory.name).icon, {
                      className: `w-5 h-5 ${getCategoryMeta(activeCategory.name).iconColor}`,
                      strokeWidth: 2
                    })}
                  </div>
                  <h2 className="font-serif text-xl text-primary">{activeCategory.name}</h2>
                </div>
                <button 
                  onClick={handleCloseModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-variant transition-colors"
                >
                  <X className="w-5 h-5 text-on-surface" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
                
                {/* Base Variants (Obligatorio) */}
                {catVariants.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                        Selecciona tu base <span className="text-error">*</span>
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {catVariants.map(v => {
                        const isSelected = selectedVariantId === v.id;
                        return (
                          <motion.button
                            key={v.id}
                            onClick={() => setSelectedVariantId(v.id)}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full p-4 rounded-2xl border text-left transition-all flex justify-between items-center ${
                              isSelected 
                                ? 'bg-primary text-white border-primary shadow-md' 
                                : 'bg-surface-container border-outline-variant/40 text-on-surface hover:border-primary/40'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <motion.div 
                                animate={{ rotate: isSelected ? 4 : 0 }}
                                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                  isSelected ? 'bg-white border-white text-primary' : 'border-outline-variant text-transparent'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                              </motion.div>
                              <span className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-on-surface'}`}>
                                {v.name}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              {v.base_duration_minutes > 0 && (
                                <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-surface-variant text-on-surface-variant'
                                }`}>
                                  <Clock className="w-3 h-3" />
                                  {v.base_duration_minutes}m
                                </span>
                              )}
                              <motion.span 
                                key={isSelected ? 'selected' : 'unselected'}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className={`font-serif text-sm ${isSelected ? 'text-white' : 'text-on-surface-variant'}`}
                              >
                                ${v.base_price}
                              </motion.span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Modifiers (Opcional) */}
                {catModifiers.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                        Adicionales (Opcional)
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {catModifiers.map(m => {
                        const qty = selectedModifiers[m.id] || 0;
                        const isPerUnit = m.modifier_type === 'per_unit';
                        const isSelected = qty > 0;

                        return (
                          <div 
                            key={m.id} 
                            className={`w-full p-4 rounded-2xl border transition-all flex justify-between items-center ${
                              isSelected ? 'bg-primary/5 border-primary/50' : 'bg-surface-container border-outline-variant/40'
                            }`}
                          >
                            <div>
                              <p className="font-semibold text-on-surface text-sm">{m.name}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-primary font-medium">
                                  +${m.price_delta} {isPerUnit && 'c/u'}
                                </span>
                                {m.duration_delta > 0 && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-on-surface-variant font-medium">
                                    <Clock className="w-3 h-3" />
                                    +{m.duration_delta}m
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {isPerUnit ? (
                              <div className="flex items-center gap-3 bg-background border border-outline-variant/30 rounded-full px-2 py-1">
                                <button 
                                  onClick={() => handleModifierQuantity(m.id, -1)} 
                                  className="w-7 h-7 flex items-center justify-center text-on-surface hover:bg-surface-variant rounded-full transition-colors"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-sm font-bold w-4 text-center text-primary">{qty}</span>
                                <button 
                                  onClick={() => handleModifierQuantity(m.id, 1)} 
                                  className="w-7 h-7 flex items-center justify-center text-on-surface hover:bg-surface-variant rounded-full transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleModifierQuantity(m.id, qty > 0 ? -1 : 1)}
                                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all border ${
                                  qty > 0 
                                    ? 'bg-primary border-primary text-white' 
                                    : 'border-outline-variant hover:border-primary text-transparent'
                                }`}
                              >
                                <Check className="w-4 h-4" strokeWidth={2.5} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Floating Footer in Modal */}
              <div className="absolute bottom-0 left-0 w-full bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/30 p-4 md:rounded-b-[2rem]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Total</span>
                    <span className="font-serif text-2xl text-primary leading-none">${currentTotal.price} MXN</span>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    disabled={catVariants.length > 0 && !selectedVariantId}
                    className="bg-primary text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:bg-primary/90 hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Agregar a la Cita
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
