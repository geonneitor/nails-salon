'use client';

/**
 * EmptyState.tsx
 * ─────────────────────────────────────────────────────────────
 * Componente reutilizable de estado vacío para listas y vistas.
 * Se muestra cuando no hay datos disponibles (primer uso o lista vacía).
 *
 * Props:
 *   icon        — componente Lucide (sin instanciar: { icon: Users })
 *   title       — título principal (serif)
 *   description — texto explicativo (sans, subtono)
 *   action      — botón CTA opcional { label, onClick }
 */

import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-3xl border border-dashed border-outline-variant/50 bg-surface-container-lowest"
    >
      {/* Icono en cápsula con halo dorado */}
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-primary/5 blur-xl scale-150 pointer-events-none" />
        <div className="relative w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
          <Icon className="w-7 h-7 text-on-surface-variant/40" strokeWidth={1.5} />
        </div>
      </div>

      {/* Texto */}
      <h3 className="font-serif text-xl text-on-surface mb-2 leading-snug">{title}</h3>
      <p className="font-sans text-sm text-on-surface-variant leading-relaxed max-w-xs">{description}</p>

      {/* CTA opcional */}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-6 px-6 py-3 rounded-full bg-primary text-on-primary font-sans text-sm font-semibold shadow-sm hover:opacity-90 active:scale-[0.97] transition-all"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
