'use client';

// ============================================================
// src/components/services/ServiceFormModal.tsx
// Panel de configuración de servicio — UX inspirada en DIKIDI
// ============================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Clock, Coffee, Wifi, Plus } from 'lucide-react';
import type { ServiceVariant, ServiceCategory } from '@/types/supabase';
import { useToast } from '@/components/ui/ToastProvider';

// ── Opciones de duración ──────────────────────────────────────
const DURATION_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hr', value: 60 },
  { label: '1h 30m', value: 90 },
  { label: '2 hr', value: 120 },
  { label: '2h 30m', value: 150 },
  { label: '3 hr', value: 180 },
];

const BREAK_OPTIONS = [
  { label: 'No', value: 0 },
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
];

/** Formatea minutos → string legible: 60 → "1 hr", 90 → "1h 30m" */
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h} hr`;
}

// ── Toggle reutilizable ───────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primario-zen/40 ${
        checked ? 'bg-green-500' : 'bg-secundario-zen/40'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
          checked ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// ── Chip selector inline ──────────────────────────────────────
function ChipPicker<T extends number>({
  options,
  value,
  onChange,
  helperText,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
  helperText?: string;
}) {
  return (
    <div className="px-4 py-3 flex flex-wrap gap-2 bg-secundario-zen/5 border-t border-secundario-zen/20">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            value === opt.value
              ? 'bg-primario-zen text-fondo-zen shadow-sm'
              : 'bg-secundario-zen/30 text-primario-zen/70 hover:bg-secundario-zen/50'
          }`}
        >
          {opt.label}
        </button>
      ))}
      {helperText && (
        <p className="w-full text-[10px] text-primario-zen/35 mt-1 leading-relaxed">
          {helperText}
        </p>
      )}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────
export interface ServiceFormModalSavePayload {
  name: string;
  base_price: number;
  base_duration_minutes: number;
  is_active: boolean;
}

export interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** null = modo creación, ServiceVariant = modo edición */
  variant?: ServiceVariant | null;
  /** Categoría padre del servicio */
  category: ServiceCategory;
  /**
   * Callback al guardar. Debe retornar true si la operación fue exitosa.
   * @param payload Datos del servicio a guardar
   */
  onSave: (payload: ServiceFormModalSavePayload) => Promise<boolean>;
}

// ── Componente principal ──────────────────────────────────────
export function ServiceFormModal({
  isOpen,
  onClose,
  variant,
  category,
  onSave,
}: ServiceFormModalProps) {
  const toast = useToast();

  const [name, setName] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [breakMinutes, setBreakMinutes] = useState<number>(0); // UI-only (Opción A)
  const [availableOnline, setAvailableOnline] = useState(true);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [showBreakPicker, setShowBreakPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Poblar campos al abrir
  useEffect(() => {
    if (!isOpen) return;
    if (variant) {
      setName(variant.name);
      const free = variant.base_price === 0;
      setIsFree(free);
      setPrice(free ? '' : variant.base_price.toString());
      setDuration(variant.base_duration_minutes || 60);
      setAvailableOnline(variant.is_active);
    } else {
      setName('');
      setIsFree(false);
      setPrice('');
      setDuration(60);
      setAvailableOnline(true);
    }
    setBreakMinutes(0);
    setShowDurationPicker(false);
    setShowBreakPicker(false);
  }, [isOpen, variant]);

  const handleSave = async () => {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    const ok = await onSave({
      name: name.trim(),
      base_price: isFree ? 0 : parseFloat(price) || 0,
      base_duration_minutes: duration,
      is_active: availableOnline,
    });
    setSubmitting(false);
    if (ok) {
      toast.success(
        variant ? 'Servicio actualizado' : 'Servicio creado',
        variant ? 'Los cambios fueron guardados.' : 'El servicio fue agregado al catálogo.'
      );
      onClose();
    } else {
      toast.error('Error al guardar', 'Intenta de nuevo.');
    }
  };

  const toggleDurationPicker = () => {
    setShowDurationPicker(p => !p);
    setShowBreakPicker(false);
  };

  const toggleBreakPicker = () => {
    setShowBreakPicker(p => !p);
    setShowDurationPicker(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            key="sfm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Sheet / Modal */}
          <motion.div
            key="sfm-panel"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="relative w-full md:max-w-md bg-surface-container-lowest rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
          >
            {/* ── Header iOS ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-secundario-zen/20 bg-surface-container-lowest shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="text-sm font-medium text-primario-zen/50 hover:text-primario-zen transition-colors w-20 text-left"
              >
                Cancelar
              </button>
              <span className="text-sm font-semibold text-primario-zen tracking-wide">
                Servicio
              </span>
              <button
                type="button"
                onClick={handleSave}
                disabled={!name.trim() || submitting}
                className="text-sm font-semibold text-primario-zen disabled:opacity-30 transition-opacity w-20 text-right"
              >
                {submitting ? '...' : 'Guardar'}
              </button>
            </div>

            {/* ── Scroll body ── */}
            <div className="overflow-y-auto overscroll-contain flex-1">
              <div className="p-5 flex flex-col gap-5 pb-10">

                {/* NOMBRE DEL SERVICIO */}
                <section>
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/40 mb-2 px-1">
                    Nombre del servicio
                  </p>
                  <div className="bg-secundario-zen/10 rounded-2xl overflow-hidden border border-secundario-zen/30">
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Nombre del servicio"
                      autoFocus
                      className="w-full bg-transparent px-4 py-3.5 text-sm text-primario-zen placeholder:text-primario-zen/30 focus:outline-none border-b border-secundario-zen/20"
                    />
                    {/* Categoría (display-only) */}
                    <div className="flex items-center justify-between px-4 py-3.5">
                      <span className="text-sm text-primario-zen/50">{category.name}</span>
                      <ChevronRight className="w-4 h-4 text-primario-zen/25" />
                    </div>
                  </div>
                </section>

                {/* COSTO */}
                <section>
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/40 mb-2 px-1">
                    Costo
                  </p>
                  <div className="bg-secundario-zen/10 rounded-2xl overflow-hidden border border-secundario-zen/30">
                    {/* Fila Gratis */}
                    <div className="flex items-center justify-between px-4 py-3.5 border-b border-secundario-zen/20">
                      <span className="text-sm font-medium text-primario-zen">Gratis</span>
                      <Toggle checked={isFree} onChange={setIsFree} />
                    </div>
                    {/* Fila precio */}
                    <div
                      className={`flex items-center gap-3 px-4 py-3.5 transition-opacity duration-200 ${
                        isFree ? 'opacity-30 pointer-events-none select-none' : 'opacity-100'
                      }`}
                    >
                      <span className="text-xs font-semibold text-primario-zen/50 bg-secundario-zen/40 px-2 py-0.5 rounded-md shrink-0">
                        desde
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder="0.00"
                        disabled={isFree}
                        className="flex-1 bg-transparent text-sm text-primario-zen placeholder:text-primario-zen/30 focus:outline-none"
                      />
                      <span className="text-sm font-semibold text-primario-zen/50 shrink-0">MX$</span>
                    </div>
                  </div>
                </section>

                {/* DURACIÓN + DESCANSO */}
                <div className="bg-secundario-zen/10 rounded-2xl overflow-hidden border border-secundario-zen/30">
                  {/* Duración */}
                  <button
                    type="button"
                    onClick={toggleDurationPicker}
                    className="w-full flex items-center justify-between px-4 py-3.5 border-b border-secundario-zen/20 hover:bg-secundario-zen/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-primario-zen/40" />
                      <span className="text-sm font-medium text-primario-zen">Duración</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--accent-gold, #b59a5b)' }}>
                      {formatDuration(duration)}
                    </span>
                  </button>
                  {showDurationPicker && (
                    <ChipPicker
                      options={DURATION_OPTIONS}
                      value={duration}
                      onChange={v => { setDuration(v); setShowDurationPicker(false); }}
                    />
                  )}

                  {/* Descanso */}
                  <button
                    type="button"
                    onClick={toggleBreakPicker}
                    className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-secundario-zen/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Coffee className="w-4 h-4 text-primario-zen/40" />
                      <span className="text-sm font-medium text-primario-zen">Descanso después de la cita</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--accent-gold, #b59a5b)' }}>
                      {breakMinutes === 0 ? 'No' : `${breakMinutes} min`}
                    </span>
                  </button>
                  {showBreakPicker && (
                    <ChipPicker
                      options={BREAK_OPTIONS}
                      value={breakMinutes}
                      onChange={v => { setBreakMinutes(v); setShowBreakPicker(false); }}
                      helperText="El descanso se sumará a la duración de la cita"
                    />
                  )}
                </div>

                {/* STAFF — placeholder visual */}
                <section>
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/40 mb-2 px-1">
                    Staff
                  </p>
                  <div className="bg-secundario-zen/10 rounded-2xl overflow-hidden border border-secundario-zen/30">
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secundario-zen/20 transition-colors"
                    >
                      <span className="w-7 h-7 rounded-full bg-primario-zen flex items-center justify-center shrink-0">
                        <Plus className="w-3.5 h-3.5 text-fondo-zen" />
                      </span>
                      <span className="text-sm text-primario-zen/60">Añadir empleada</span>
                      <ChevronRight className="w-4 h-4 text-primario-zen/25 ml-auto" />
                    </button>
                  </div>
                </section>

                {/* DISPONIBLE EN LÍNEA */}
                <section>
                  <div className="bg-secundario-zen/10 rounded-2xl overflow-hidden border border-secundario-zen/30">
                    <div className="flex items-center justify-between px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Wifi className="w-4 h-4 text-primario-zen/40" />
                        <span className="text-sm font-medium text-primario-zen">Disponible en línea</span>
                      </div>
                      <Toggle checked={availableOnline} onChange={setAvailableOnline} />
                    </div>
                    <p className="px-4 pb-4 text-[11px] text-primario-zen/35 leading-relaxed">
                      El enlace a la reserva en línea estará disponible al guardar el servicio
                    </p>
                  </div>
                </section>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
