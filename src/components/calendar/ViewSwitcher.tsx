'use client';

import { motion } from 'framer-motion';
import type { CalendarViewMode } from '@/hooks/useCalendarView';

interface ViewSwitcherProps {
  value: CalendarViewMode;
  onChange: (v: CalendarViewMode) => void;
}

const OPTIONS: { value: CalendarViewMode; label: string }[] = [
  { value: 'day', label: 'Día' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
];

/**
 * Segmented control minimalista para alternar entre Día/Semana/Mes.
 * Paleta cerrada: solo `fondo-zen`, `primario-zen` y `secundario-zen`.
 */
export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label="Vista del calendario"
      className="relative inline-flex items-center bg-secundario-zen/40 rounded-full p-1 text-xs font-semibold"
    >
      {OPTIONS.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 px-4 py-1.5 rounded-full transition-colors ${
              opt.value === 'week' ? 'hidden md:inline-flex' : 'inline-flex'
            } ${
              isActive ? 'text-fondo-zen' : 'text-primario-zen/60 hover:text-primario-zen'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="view-switcher-pill"
                className="absolute inset-0 bg-primario-zen rounded-full -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
