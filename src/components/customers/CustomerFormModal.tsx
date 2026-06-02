'use client';

// ============================================================
// src/components/customers/CustomerFormModal.tsx
// Formulario premium para crear o editar una clienta.
// ============================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import type { Customer } from '@/types/supabase';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<unknown>;
  initialData?: Customer | null;
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

export function CustomerFormModal({ isOpen, onClose, onSubmit, initialData }: CustomerFormModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setPhone(initialData.phone || '');
        setEmail(initialData.email || '');
        setBirthday(initialData.birthday || '');
        setServiceNotes(initialData.service_notes || '');
      } else {
        setName('');
        setPhone('');
        setEmail('');
        setBirthday('');
        setServiceNotes('');
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    setSubmitting(true);
    const payload = {
      ...(initialData ? { id: initialData.id } : {}),
      name: name.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      birthday: birthday || null,
      service_notes: serviceNotes.trim() || null,
    };

    const result = await onSubmit(payload);
    setSubmitting(false);

    if (result) {
      onClose();
    } else {
      setError(initialData ? 'Hubo un problema al actualizar la clienta.' : 'Hubo un problema al registrar la clienta.');
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
            className="relative w-full md:max-w-md bg-fondo-zen rounded-t-3xl md:rounded-3xl shadow-2xl border border-secundario-zen/50 p-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primario-zen/40 font-semibold mb-1">
                  {initialData ? 'Edición' : 'Registro'}
                </p>
                <h2 className="font-serif text-primario-zen text-2xl tracking-wide">
                  {initialData ? 'Editar Clienta' : 'Nueva Clienta'}
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
              <Field label="Nombre Completo *">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Ej. Ana García"
                  required
                />
              </Field>

              <Field label="Teléfono">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="10 dígitos"
                />
              </Field>

              <Field label="Correo Electrónico">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="correo@ejemplo.com"
                />
              </Field>

              <Field label="Cumpleaños">
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="Notas o Preferencias">
                <textarea
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  className={`${INPUT_CLASS} min-h-[80px] resize-y`}
                  placeholder="Alergias, preferencias de color, etc."
                />
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
                  <><Loader2 className="w-4 h-4 animate-spin" /> {initialData ? 'Actualizando...' : 'Registrando...'}</>
                ) : (
                  initialData ? 'Guardar Cambios' : 'Registrar Clienta'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
