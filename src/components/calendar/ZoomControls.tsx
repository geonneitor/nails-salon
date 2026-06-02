'use client';

import { Minus, Plus } from 'lucide-react';
import { ZOOM_LEVELS, type ZoomLevel } from '@/hooks/useCalendarView';

interface ZoomControlsProps {
  value: ZoomLevel;
  onChange: (z: ZoomLevel) => void;
}

const ORDER: ZoomLevel[] = ['compact', 'comfortable', 'airy'];

/**
 * Controles minimalistas de zoom vertical.
 * Palanca entre `compact` (40px/h) · `comfortable` (64px/h) · `airy` (96px/h).
 * Solo íconos, sin texto: la altura se siente visualmente.
 */
export function ZoomControls({ value, onChange }: ZoomControlsProps) {
  const idx = ORDER.indexOf(value);
  const canDecrement = idx > 0;
  const canIncrement = idx < ORDER.length - 1;

  const handleDec = () => {
    if (canDecrement) onChange(ORDER[idx - 1]);
  };
  const handleInc = () => {
    if (canIncrement) onChange(ORDER[idx + 1]);
  };

  const label = `Zoom: ${ZOOM_LEVELS[value]}px por hora`;

  return (
    <div
      className="inline-flex items-center gap-1 bg-secundario-zen/40 rounded-full p-1"
      aria-label={label}
      title={label}
    >
      <button
        type="button"
        onClick={handleDec}
        disabled={!canDecrement}
        aria-label="Reducir altura de filas"
        className="p-1.5 rounded-full text-primario-zen/70 hover:text-primario-zen hover:bg-fondo-zen/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="text-[10px] uppercase tracking-widest text-primario-zen/50 font-semibold px-1.5 select-none">
        {value === 'compact' ? '−' : value === 'airy' ? '+' : '·'}
      </span>
      <button
        type="button"
        onClick={handleInc}
        disabled={!canIncrement}
        aria-label="Aumentar altura de filas"
        className="p-1.5 rounded-full text-primario-zen/70 hover:text-primario-zen hover:bg-fondo-zen/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
