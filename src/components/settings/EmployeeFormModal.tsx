'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
  initialData?: any;
}

export function EmployeeFormModal({ isOpen, onClose, onSubmit, initialData }: EmployeeFormModalProps) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    password: '',
    role: initialData?.role || 'ONLY_BOOK',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error: any) {
      console.error('Error saving employee:', error);
      // FIXED: toast.error en vez de alert(error.message)
      toast.error('Error al guardar', 'No fue posible registrar la empleada. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-fondo-zen border border-secundario-zen/50 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-primario-zen text-2xl tracking-wide">
            {initialData ? 'Editar Empleada' : 'Nueva Empleada'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-secundario-zen/30 transition-colors">
            <X className="w-5 h-5 text-primario-zen/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
              Nombre completo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/50 border border-secundario-zen/50 rounded-xl px-4 py-3 text-primario-zen text-sm focus:outline-none focus:ring-2 focus:ring-primario-zen/30 transition-all"
              placeholder="Nombre de la empleada"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
              Correo electrónico
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white/50 border border-secundario-zen/50 rounded-xl px-4 py-3 text-primario-zen text-sm focus:outline-none focus:ring-2 focus:ring-primario-zen/30 transition-all"
              placeholder="email@ejemplo.com"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
              Rol / Permisos
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-white/50 border border-secundario-zen/50 rounded-xl px-4 py-3 text-primario-zen text-sm focus:outline-none focus:ring-2 focus:ring-primario-zen/30 transition-all appearance-none cursor-pointer"
            >
              <option value="ONLY_BOOK">Especialista (Acceso limitado)</option>
              <option value="TOTAL">Admin (Acceso Total)</option>
            </select>
          </div>

          {!initialData && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
                Contraseña Temporal
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white/50 border border-secundario-zen/50 rounded-xl px-4 py-3 text-primario-zen text-sm focus:outline-none focus:ring-2 focus:ring-primario-zen/30 transition-all"
                placeholder="Mínimo 6 caracteres"
                required={!initialData}
                minLength={6}
              />
              <p className="text-[10px] text-primario-zen/50 leading-relaxed font-medium mt-1">
                Se creará su cuenta de inmediato. Podrá iniciar sesión con este correo y contraseña.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primario-zen text-fondo-zen py-3 rounded-full uppercase tracking-widest text-xs font-semibold hover:bg-opacity-90 transition-all shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar Empleada' : 'Crear Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}
