'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useProject } from '@/context/AppContext';
import { Clock, Users, Calendar as CalIcon } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

export function BusinessSettings() {
  const { activeProject } = useProject();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    max_employees: 1,
    opening_hour: '09:00',
    closing_hour: '20:00',
    working_days: [1, 2, 3, 4, 5],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      if (!activeProject?.id) return;
      try {
        const { data, error } = await supabase
          .from('business_settings')
          .select('*')
          .eq('project_id', activeProject.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;
        if (data) setSettings(data);
      } catch (e) {
        console.error('Error loading business settings:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [activeProject]);

  async function handleSave() {
    setSaving(true);
    try {
      let error;
      
      // Si settings tiene un id, significa que ya existe en DB -> UPDATE
      if ((settings as any).id) {
        const { error: updateError } = await supabase
          .from('business_settings')
          .update({
            max_employees: settings.max_employees,
            opening_hour: settings.opening_hour,
            closing_hour: settings.closing_hour,
            working_days: settings.working_days,
            updated_at: new Date().toISOString(),
          })
          .eq('id', (settings as any).id);
        error = updateError;
      } else {
        // Si no tiene id, es la primera vez que se guarda -> INSERT
        const { error: insertError } = await supabase
          .from('business_settings')
          .insert({
            project_id: activeProject?.id,
            max_employees: settings.max_employees,
            opening_hour: settings.opening_hour,
            closing_hour: settings.closing_hour,
            working_days: settings.working_days,
          });
        error = insertError;
      }

      if (error) throw error;
      // FIXED: toast.success en vez de alert()
      toast.success('Configuración guardada', 'Los cambios han sido aplicados correctamente.');
    } catch (e: any) {
      console.error('Error saving business settings:', e);
      // FIXED: toast.error en vez de alert(`Error: ${e.message}`)
      toast.error('Error al guardar', 'No fue posible guardar la configuración. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-primario-zen/40 italic text-sm">Cargando configuración...</div>;

  return (
    <div className="bg-fondo-zen border border-secundario-zen/50 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-primario-zen text-xl flex items-center gap-2">
          <CalIcon className="w-5 h-5" />
          Reglas de Negocio
        </h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primario-zen text-fondo-zen px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-opacity-90 transition-all disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-primario-zen/40 flex items-center gap-2">
            <Users className="w-3 h-3" />
            Capacidad Simultánea
          </label>
          <input
            type="number"
            value={settings.max_employees}
            onChange={(e) => setSettings({ ...settings, max_employees: parseInt(e.target.value) })}
            className="w-full bg-white/50 border border-secundario-zen/50 rounded-xl px-4 py-2 text-primario-zen focus:outline-none focus:ring-2 focus:ring-primario-zen/20 transition-all"
          />
          <p className="text-[10px] text-primario-zen/50 italic">Número máximo de citas que pueden coexistir en la misma hora.</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-primario-zen/40 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Hora de Apertura
          </label>
          <input
            type="time"
            value={settings.opening_hour}
            onChange={(e) => setSettings({ ...settings, opening_hour: e.target.value })}
            className="w-full bg-white/50 border border-secundario-zen/50 rounded-xl px-4 py-2 text-primario-zen focus:outline-none focus:ring-2 focus:ring-primario-zen/20 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-primario-zen/40 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Hora de Cierre
          </label>
          <input
            type="time"
            value={settings.closing_hour}
            onChange={(e) => setSettings({ ...settings, closing_hour: e.target.value })}
            className="w-full bg-white/50 border border-secundario-zen/50 rounded-xl px-4 py-2 text-primario-zen focus:outline-none focus:ring-2 focus:ring-primario-zen/20 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-primario-zen/40">
            Días de Trabajo
          </label>
          <div className="flex flex-wrap gap-2">
            {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map((day, index) => (
              <button
                key={day}
                onClick={() => {
                  const days = [...settings.working_days];
                  if (days.includes(index)) {
                    setSettings({ ...settings, working_days: days.filter(d => d !== index) });
                  } else {
                    setSettings({ ...settings, working_days: [...days, index].sort() });
                  }
                }}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                  settings.working_days.includes(index)
                    ? 'bg-primario-zen text-fondo-zen border-primario-zen'
                    : 'bg-transparent text-primario-zen/40 border-secundario-zen/50'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
