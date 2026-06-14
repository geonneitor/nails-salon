'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/ToastProvider';
import { ShieldAlert, Droplet, Edit3, X, Check } from 'lucide-react';
import type { Customer } from '@/types/supabase';

interface ClinicalCardProps {
  customer: Customer;
  onUpdated?: () => void;
}

export function ClinicalCard({ customer, onUpdated }: ClinicalCardProps) {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [allergies, setAllergies] = useState(customer.allergies || '');
  const [formulas, setFormulas] = useState(customer.color_formulas || '');

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          allergies: allergies.trim() || null,
          color_formulas: formulas.trim() || null,
        })
        .eq('id', customer.id);

      if (error) throw error;
      
      toast.success('Perfil actualizado', 'Los datos clínicos se guardaron correctamente.');
      setIsEditing(false);
      onUpdated?.();
    } catch (e: any) {
      console.error(e);
      toast.error('Error al guardar', 'No se pudieron actualizar los datos.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setAllergies(customer.allergies || '');
    setFormulas(customer.color_formulas || '');
    setIsEditing(false);
  };

  return (
    <div className="card-depth rounded-3xl p-6 md:p-8 bg-fondo-zen border border-secundario-zen/40 shadow-sm relative overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-primario-zen flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-gold-dark" />
          Ficha Clínica
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="w-8 h-8 rounded-full bg-secundario-zen/30 text-primario-zen flex items-center justify-center hover:bg-secundario-zen/60 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-6">
        {/* Alergias */}
        <div>
          <label className="text-[10px] uppercase tracking-[0.25em] font-bold text-primario-zen/50 flex items-center gap-2 mb-2">
            Alergias y Condiciones
          </label>
          {isEditing ? (
            <textarea
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Ej. Alergia al acrílico, piel sensible..."
              rows={3}
              className="w-full bg-surface-container-lowest border border-primario-zen/20 rounded-2xl p-4 text-sm text-primario-zen focus:outline-none focus:border-primario-zen focus:ring-1 focus:ring-primario-zen resize-none transition-all"
            />
          ) : (
            <div className={`p-4 rounded-2xl border ${customer.allergies ? 'bg-red-50/50 border-red-200/50 text-red-900/80 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-surface-container-lowest border-outline-variant/30 text-primario-zen/60 italic'} text-sm leading-relaxed min-h-[5rem]`}>
              {customer.allergies || 'Ninguna alergia registrada.'}
            </div>
          )}
        </div>

        {/* Fórmulas */}
        <div>
          <label className="text-[10px] uppercase tracking-[0.25em] font-bold text-primario-zen/50 flex items-center gap-2 mb-2">
            <Droplet className="w-3 h-3" />
            Fórmulas y Tonos
          </label>
          {isEditing ? (
            <textarea
              value={formulas}
              onChange={(e) => setFormulas(e.target.value)}
              placeholder="Ej. Tono base 45 con matiz dorado..."
              rows={4}
              className="w-full bg-surface-container-lowest border border-primario-zen/20 rounded-2xl p-4 text-sm text-primario-zen focus:outline-none focus:border-primario-zen focus:ring-1 focus:ring-primario-zen resize-none transition-all"
            />
          ) : (
            <div className={`p-4 rounded-2xl border ${customer.color_formulas ? 'bg-lavender-primary/5 border-lavender-primary/20 text-primario-zen/80' : 'bg-surface-container-lowest border-outline-variant/30 text-primario-zen/60 italic'} text-sm leading-relaxed min-h-[5rem]`}>
              {customer.color_formulas || 'No hay fórmulas guardadas.'}
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex items-center gap-3 mt-8 pt-4 border-t border-secundario-zen/40">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex-1 py-3 rounded-full border border-secundario-zen text-primario-zen text-xs font-bold uppercase tracking-widest hover:bg-secundario-zen/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" /> Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-full bg-primario-zen text-fondo-zen text-xs font-bold uppercase tracking-widest hover:bg-primario-zen/90 transition-all shadow-soft-shadow disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-fondo-zen border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <><Check className="w-4 h-4" /> Guardar</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
