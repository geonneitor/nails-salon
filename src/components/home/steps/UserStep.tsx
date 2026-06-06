'use client';

import React from 'react';
import { motion } from 'framer-motion';

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
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-primario-zen font-serif text-3xl uppercase tracking-widest mb-3">
          Tu Identidad
        </h2>
        <p className="text-primario-zen/60 font-sans text-sm max-w-md mx-auto">
          Para personalizar tu experiencia, necesitamos conocerte un poco más.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-8 px-6">
        <div className="group relative">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-primario-zen/40 mb-2 ml-1 transition-colors group-focus-within:text-primario-zen">
            Nombre Completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-white/10 border-b border-white/40 text-primario-zen text-lg font-serif py-3 focus:outline-none focus:border-primario-zen transition-all placeholder:text-primario-zen/20"
            placeholder="Ej. Isabella Zen"
          />
        </div>

        <div className="group relative">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-primario-zen/40 mb-2 ml-1 transition-colors group-focus-within:text-primario-zen">
            Contacto (WhatsApp o Email)
          </label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            className="w-full bg-white/10 border-b border-white/40 text-primario-zen text-lg font-serif py-3 focus:outline-none focus:border-primario-zen transition-all placeholder:text-primario-zen/20"
            placeholder="Ej. +52 1 55 1234 5678"
          />
        </div>

        <div className="flex flex-col items-center gap-6 pt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-primario-zen text-fondo-zen py-4 rounded-full uppercase tracking-widest text-xs font-bold shadow-xl hover:shadow-primario-zen/20 transition-all"
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
  );
}
