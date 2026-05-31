'use client';

// ============================================================
// src/components/services/ServiceFormModal.tsx
// Formulario premium para crear o editar un servicio.
// ============================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import type { Service } from '@/types/supabase';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<unknown>;
  initialData?: Service | null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
        {label}
      </label>
      {children}
    </div>
  );
}

const INPUT_CLASS =
  'w-full bg-secundario-zen/20 border border-secundario-zen/60 text-primario-zen text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primario-zen/30 transition-all placeholder:text-primario-zen/30';

export function ServiceFormModal({ isOpen, onClose, onSubmit, initialData }: ServiceFormModalProps) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('60');
  const [price, setPrice] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setDuration(initialData.duration_minutes.toString());
        setPrice(initialData.price.toString());
      } else {
        setName('');
        setDuration('60');
        setPrice('');
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !duration || !price) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    setSubmitting(true);
    const payload = {
      ...(initialData ? { id: initialData.id } : {}),
      name: name.trim(),
      duration_minutes: parseInt(duration, 10),
      price: parseFloat(price),
    };

    const result = await onSubmit(payload);
    setSubmitting(false);

    if (result) {
      onClose();
    } else {
      setError(initialData ? 'Hubo un problema al actualizar el servicio.' : 'Hubo un problema al registrar el servicio.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <motion.div
            key="cb-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-primario-zen/20 backdrop-blur-sm"
          />

          <motion.div
            key="cb-panel"
            initial={{ opacity: 0, y: 50, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="relative w-full md:max-w-md bg-[#FDFBEE] rounded-t-3xl md:rounded-3xl shadow-2xl border border-secundario-zen/50 p-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primario-zen/40 font-semibold mb-1">
                  {initialData ? 'Edición' : 'Catálogo'}
                </p>
                <h2 className="font-serif text-primario-zen text-2xl tracking-wide">
                  {initialData ? 'Editar Servicio' : 'Nuevo Servicio'}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar formulario"
                className="p-2 rounded-full text-primario-zen/40 hover:text-primario-zen hover:bg-secundario-zen/40 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Field label="Nombre del Servicio *">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Ej. Manicure Gel"
                  required
                />
              </Field>

              <Field label="Duración (minutos) *">
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className={INPUT_CLASS}
                  required
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min (1 hora)</option>
                  <option value="90">90 min (1 hora 30 min)</option>
                  <option value="120">120 min (2 horas)</option>
                  <option value="150">150 min (2 horas 30 min)</option>
                  <option value="180">180 min (3 horas)</option>
                </select>
              </Field>

              <Field label="Precio ($) *">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-primario-zen/40 font-medium">$</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`${INPUT_CLASS} pl-8`}
                    placeholder="0.00"
                    required
                  />
                </div>
              </Field>

              {error && (
                <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primario-zen text-fondo-zen py-3.5 rounded-full uppercase tracking-widest text-xs font-semibold hover:bg-opacity-90 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                ) : (
                  initialData ? 'Guardar Cambios' : 'Guardar Servicio'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
