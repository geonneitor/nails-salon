'use client';

// ============================================================
// ServicePreviewCard.tsx
// Vista "tal cual la ve la clienta" del menú actual.
// Se actualiza en tiempo real cuando el admin edita precios
// o activa/desactiva opciones. Pensado para el panel 60/40
// de /services.
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shield, Heart, Scissors, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { useDynamicServices } from '@/hooks/useDynamicServices';

interface ServicePreviewCardProps {
  /** ID de la categoría recién editada (resalta esa card). */
  highlightCategoryId?: string | null;
  /** Slot por hora, para mostrar la duración. */
  sampleDurationMin?: number;
}

const ICON_FOR: Record<string, typeof Sparkles> = {
  fullset: Sparkles,
  acrylic: Sparkles,
  gel: Shield,
  protec: Shield,
  pedi: Scissors,
  pedicura: Scissors,
  mani: Heart,
  manicura: Heart,
};

function pickIcon(name: string) {
  const k = name.toLowerCase();
  for (const key of Object.keys(ICON_FOR)) {
    if (k.includes(key)) return ICON_FOR[key];
  }
  return Sparkles;
}

const TONE_BG: Record<string, string> = {
  fullset: 'border-gold-primary/30 bg-gold-primary/5',
  acrylic: 'border-gold-primary/30 bg-gold-primary/5',
  gel: 'border-lavender-primary/30 bg-lavender-primary/5',
  protec: 'border-lavender-primary/30 bg-lavender-primary/5',
  pedi: 'border-primario-zen/30 bg-primario-zen/5',
  pedicura: 'border-primario-zen/30 bg-primario-zen/5',
  mani: 'border-botanical-1/30 bg-botanical-1/5',
  manicura: 'border-botanical-1/30 bg-botanical-1/5',
};

const TONE_ICON: Record<string, string> = {
  fullset: 'text-gold-dark',
  acrylic: 'text-gold-dark',
  gel: 'text-lavender-dark',
  protec: 'text-lavender-dark',
  pedi: 'text-primario-zen',
  pedicura: 'text-primario-zen',
  mani: 'text-botanical-1',
  manicura: 'text-botanical-1',
};

function toneFor(name: string) {
  const k = name.toLowerCase();
  for (const key of Object.keys(TONE_BG)) {
    if (k.includes(key)) return { bg: TONE_BG[key], icon: TONE_ICON[key] };
  }
  return { bg: 'border-primario-zen/30 bg-primario-zen/5', icon: 'text-primario-zen' };
}

export function ServicePreviewCard({
  highlightCategoryId = null,
  sampleDurationMin = 60,
}: ServicePreviewCardProps) {
  const { categories, variants, modifiers } = useDynamicServices();

  // Sólo categorías con al menos una opción activa.
  const visibleCategories = useMemo(
    () =>
      categories.filter((c) => {
        const hasActiveVariant = variants.some(
          (v) => v.category_id === c.id && v.is_active
        );
        return hasActiveVariant;
      }),
    [categories, variants]
  );

  return (
    <div className="card-depth rounded-3xl p-6 sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-xl text-primario-zen">Vista de la clienta</h3>
        <span className="text-[10px] uppercase tracking-[0.2em] text-gold-dark font-semibold font-sans">
          En vivo
        </span>
      </div>

      <p className="text-xs text-on-surface-variant/70 font-sans mb-4">
        Así se ve tu menú en el paso 1 de la reserva. Los cambios se reflejan al instante.
      </p>

      {visibleCategories.length === 0 ? (
        <div className="flex flex-col items-center text-center py-10 px-4 rounded-2xl border border-dashed border-outline-variant/40">
          <Sparkles className="w-6 h-6 text-on-surface-variant/40 mb-2" strokeWidth={1.5} />
          <p className="text-sm text-on-surface-variant/70 font-sans">
            Activa al menos una opción para ver la vista previa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {visibleCategories.map((c) => {
              const tone = toneFor(c.name);
              const isHighlighted = c.id === highlightCategoryId;
              const Icon = pickIcon(c.name);
              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className={`relative rounded-2xl border p-4 transition-all ${tone.bg} ${
                    isHighlighted
                      ? 'ring-2 ring-gold-primary shadow-soft-shadow'
                      : 'hover:border-primario-zen/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-fondo-zen border border-outline-variant/30 ${tone.icon}`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.75} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-base text-primario-zen leading-tight">
                        {c.name}
                      </p>
                      <p className="text-[11px] text-on-surface-variant/70 font-sans mt-0.5">
                        {c.selection_type === 'composite'
                          ? 'Combinable'
                          : c.selection_type === 'add_on'
                            ? 'Adicional'
                            : 'Una opción'}
                      </p>
                    </div>
                  </div>

                  <ul className="mt-3 space-y-1.5">
                    {variants
                      .filter((v) => v.category_id === c.id && v.is_active)
                      .map((v) => (
                        <li
                          key={v.id}
                          className="flex items-baseline justify-between gap-2 text-xs font-sans"
                        >
                          <span className="flex items-center gap-1.5 text-primario-zen/90">
                            <Check
                              className="w-3 h-3 text-primario-zen/60"
                              strokeWidth={2.25}
                            />
                            {v.name}
                          </span>
                          <span className="font-semibold text-primario-zen tabular-nums">
                            ${Number(v.base_price).toLocaleString('es-MX')}
                          </span>
                        </li>
                      ))}
                  </ul>

                  {modifiers.some((m) => m.category_id === c.id && m.is_active) && (
                    <div className="mt-3 pt-3 border-t border-outline-variant/30">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/50 font-sans mb-1.5">
                        Complementos
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {modifiers
                          .filter((m) => m.category_id === c.id && m.is_active)
                          .map((m) => (
                            <span
                              key={m.id}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-fondo-zen border border-outline-variant/30 text-[10px] font-sans text-primario-zen/80"
                            >
                              {m.name}
                              <span className="text-gold-dark font-semibold">
                                +${Number(m.price_delta).toLocaleString('es-MX')}
                              </span>
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <p className="text-[10px] text-on-surface-variant/50 font-sans italic mt-4 text-center">
        Duración estimada: {sampleDurationMin} min · Actualizado {format(new Date(), 'HH:mm:ss')}
      </p>
    </div>
  );
}
