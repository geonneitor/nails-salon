'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Sparkle } from 'lucide-react';

export default function UserStep({ data, onSelect, onBack }: {
  data: any,
  onSelect: (name: string, contact: string) => void,
  onBack: () => void
}) {
  const [name, setName] = React.useState(data.name);
  const [contact, setContact] = React.useState(data.contact);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelect(name, contact);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 bg-primario-zen/8 px-4 py-1.5 rounded-full mb-3">
          <Sparkle className="w-3.5 h-3.5 text-primario-zen/60" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-primario-zen/60">
            Paso 3 · Tus Datos
          </span>
        </div>
        <h2 className="text-primario-zen font-serif text-3xl mb-2">
          Tu Identidad
        </h2>
        <p className="text-primario-zen/50 font-sans text-sm max-w-sm mx-auto leading-relaxed">
          Ingresa tus datos de contacto para sincronizar tu cita y enviarte tu comprobante.
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full bg-surface-container-lowest/70 border border-outline-variant/30 rounded-3xl p-6 sm:p-8 shadow-sm backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Nombre Completo */}
          <div className="relative flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-primario-zen/55 ml-1">
              Nombre Completo
            </label>
            <div className="relative flex items-center group">
              <User className="absolute left-4 w-4 h-4 text-primario-zen/30 group-focus-within:text-primario-zen transition-colors" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest/80 border border-outline-variant/40 rounded-2xl text-primario-zen font-serif text-sm focus:outline-none focus:border-primario-zen/60 focus:ring-4 focus:ring-primario-zen/5 transition-all placeholder:text-primario-zen/25"
                placeholder="Ej. Isabella Zen"
              />
            </div>
          </div>

          {/* Contacto (WhatsApp o Celular) */}
          <div className="relative flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-primario-zen/55 ml-1">
              Contacto (WhatsApp o Celular)
            </label>
            <div className="relative flex items-center group">
              <Phone className="absolute left-4 w-4 h-4 text-primario-zen/30 group-focus-within:text-primario-zen transition-colors" />
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest/80 border border-outline-variant/40 rounded-2xl text-primario-zen font-serif text-sm focus:outline-none focus:border-primario-zen/60 focus:ring-4 focus:ring-primario-zen/5 transition-all placeholder:text-primario-zen/25"
                placeholder="Ej. +52 1 55 1234 5678"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-4 mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-primario-zen text-fondo-zen py-4 rounded-full uppercase tracking-widest text-xs font-bold shadow-md hover:bg-primario-zen/90 hover:shadow-lg transition-all"
            >
              Continuar al Resumen
            </motion.button>

            <button
              type="button"
              onClick={onBack}
              className="text-primario-zen/40 hover:text-primario-zen text-[10px] uppercase tracking-widest font-bold transition-colors"
            >
              ← Regresar al horario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
