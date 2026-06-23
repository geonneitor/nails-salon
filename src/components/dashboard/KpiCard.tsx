'use client';

// ============================================================
// KpiCard.tsx — Tarjeta de KPI premium con número animado.
// Diseñada para el "morning brief" del dashboard.
// ============================================================

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Texto descriptivo debajo del número. */
  caption?: string;
  /** Sufijo (ej. "MXN", "min", "%"). */
  suffix?: string;
  /** Color del icono / acentos. Default: primario zen. */
  tone?: 'primary' | 'gold' | 'lavender' | 'botanical';
  /** Comparación vs día anterior (positivo = verde, negativo = rojo). */
  delta?: { value: number; label?: string } | null;
  /** Hint editorial arriba a la derecha (ej. "HOY"). */
  hint?: string;
  /** Función al hacer clic para filtrar o accionar. */
  onClick?: () => void;
  /** Estado activo para indicar que el filtro está aplicado. */
  isActive?: boolean;
}

const TONE_STYLES = {
  primary: {
    iconBg: 'bg-primario-zen/10',
    iconColor: 'text-primario-zen',
    glow: 'before:bg-primario-zen/0',
    numColor: 'text-primario-zen',
  },
  gold: {
    iconBg: 'bg-gold-primary/15',
    iconColor: 'text-gold-dark',
    glow: 'before:bg-gold-primary/0',
    numColor: 'text-gold-dark',
  },
  lavender: {
    iconBg: 'bg-lavender-primary/15',
    iconColor: 'text-lavender-dark',
    glow: 'before:bg-lavender-primary/0',
    numColor: 'text-lavender-dark',
  },
  botanical: {
    iconBg: 'bg-botanical-2/15',
    iconColor: 'text-botanical-1',
    glow: 'before:bg-botanical-1/0',
    numColor: 'text-botanical-1',
  },
} as const;

export function KpiCard({
  label,
  value,
  icon: Icon,
  caption,
  suffix,
  tone = 'primary',
  delta,
  hint,
  onClick,
  isActive = false,
}: KpiCardProps) {
  const toneStyle = TONE_STYLES[tone];
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  // Anima el número de 0 → value en 1.2s (easeOutCubic).
  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    let raf: number;
    const tick = (t: number) => {
      const elapsed = t - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`card-depth relative rounded-3xl p-6 flex flex-col gap-5 group overflow-hidden ${
        onClick ? 'cursor-pointer hover:-translate-y-1 transition-all shadow-sm hover:shadow-md' : ''
      } ${isActive ? 'ring-2 ring-offset-2 ring-offset-fondo-zen ring-primario-zen' : ''}`}
    >
      {/* Hairline dorado superior — un toque editorial */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gold-primary/30 to-transparent" />

      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-2xl ${toneStyle.iconBg} ${toneStyle.iconColor} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-5 h-5" strokeWidth={1.75} />
        </div>
        {hint && (
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-on-surface-variant/60 font-sans">
            {hint}
          </span>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-1">
          <span className={`text-5xl font-serif ${toneStyle.numColor} tabular-nums leading-none`}>
            {display}
          </span>
          {suffix && (
            <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${toneStyle.iconColor} font-sans`}>
              {suffix}
            </span>
          )}
        </div>
        <p className="mt-2 text-sm font-medium text-on-surface-variant font-sans">
          {caption ?? label}
        </p>
      </div>

      {delta && (
        <div className="flex items-center gap-1.5 text-[11px] font-sans">
          <span
            className={`inline-flex items-center gap-0.5 font-semibold ${
              delta.value >= 0 ? 'text-primario-zen' : 'text-error'
            }`}
          >
            {delta.value >= 0 ? '↑' : '↓'} {Math.abs(delta.value)}%
          </span>
          {delta.label && (
            <span className="text-on-surface-variant/60">{delta.label}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
