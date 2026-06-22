'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useProject } from '@/context/AppContext';
import { Clock, Users, Calendar as CalIcon } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { useBusinessSettings, type BusinessSettingsRecord } from '@/hooks/useBusinessSettings';

export function BusinessSettings() {
  const { activeProject } = useProject();
  const toast = useToast();
  const { settings: fetchedSettings, loading, setSettings: setFetchedSettings } = useBusinessSettings(activeProject?.id);

  const [settings, setSettings] = useState({
    max_employees: 1,
    opening_hour: '09:00',
    closing_hour: '20:00',
    working_days: [1, 2, 3, 4, 5],
    salon_name: '',
    salon_phone: '',
    salon_whatsapp: '',
    salon_address: '',
    salon_logo_url: '',
    advance_grace_period_hours: 2,
    bank_details: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (fetchedSettings) {
      setSettings(prev => ({ 
        ...prev, 
        ...fetchedSettings,
        salon_name: fetchedSettings.salon_name || '',
        salon_phone: fetchedSettings.salon_phone || '',
        salon_whatsapp: fetchedSettings.salon_whatsapp || '',
        salon_address: fetchedSettings.salon_address || '',
        salon_logo_url: fetchedSettings.salon_logo_url || '',
        bank_details: fetchedSettings.bank_details || ''
      }));
    }
  }, [fetchedSettings]);

  async function handleSave() {
    setSaving(true);
    try {
      if (!activeProject?.id) {
        throw new Error('No hay un proyecto activo seleccionado.');
      }

      // upsert por project_id elimina el branching INSERT/UPDATE y la
      // dependencia frágil en `(settings as any).id`. Requiere la
      // constraint UNIQUE(project_id) que añade la migración
      // 20260622000000_business_settings_unique_project.sql.
      //
      // `updated_at` se omite: la tabla no tiene esa columna (no aparece
      // en ningún migration ni en db_seed.js). Si el equipo la quiere
      // para auditoría, añadir otra migración con trigger BEFORE UPDATE.
      const { data, error } = await supabase
        .from('business_settings')
        .upsert(
          {
            project_id: activeProject.id,
            max_employees: Number.isFinite(settings.max_employees)
              ? settings.max_employees
              : 1,
            opening_hour: settings.opening_hour,
            closing_hour: settings.closing_hour,
            working_days: settings.working_days,
            salon_name: settings.salon_name || null,
            salon_phone: settings.salon_phone || null,
            salon_whatsapp: settings.salon_whatsapp || null,
            salon_address: settings.salon_address || null,
            salon_logo_url: settings.salon_logo_url || null,
            advance_grace_period_hours: Number.isFinite(
              settings.advance_grace_period_hours
            )
              ? settings.advance_grace_period_hours
              : 2,
            bank_details: settings.bank_details || null,
          },
          { onConflict: 'project_id' }
        )
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('La operación no afectó ninguna fila.');

      // Sincronizar el hook para que un remount u otro consumer vean
      // los datos frescos inmediatamente.
      if (typeof setFetchedSettings === 'function') {
        setFetchedSettings(data as BusinessSettingsRecord);
      }
      // Normaliza los campos nullable que la DB devuelve como `null`
      // (`salon_name`, `salon_phone`, etc.) al tipo `string` que espera
      // el estado local. Sin este fallback TS rechaza el setState porque
      // `null` no es asignable a `string`.
      const row = data as Partial<BusinessSettingsRecord>;
      setSettings((prev) => ({
        ...prev,
        ...row,
        salon_name: row.salon_name ?? '',
        salon_phone: row.salon_phone ?? '',
        salon_whatsapp: row.salon_whatsapp ?? '',
        salon_address: row.salon_address ?? '',
        salon_logo_url: row.salon_logo_url ?? '',
        bank_details: row.bank_details ?? '',
      }));

      toast.success(
        'Configuración guardada',
        'Los cambios han sido aplicados correctamente.'
      );
    } catch (e: any) {
      console.error('Error saving business settings:', e);
      toast.error(
        'Error al guardar',
        e?.message ?? 'No fue posible guardar la configuración. Intenta de nuevo.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-primario-zen/40 italic text-sm">Cargando configuración...</div>;

  if (!activeProject?.id) {
    return (
      <div className="bg-fondo-zen border border-secundario-zen/50 rounded-3xl p-6 shadow-sm">
        <p className="text-primario-zen/70 text-sm italic">
          Selecciona un proyecto activo en la parte superior para editar la configuración del negocio.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-fondo-zen border border-secundario-zen/50 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-primario-zen text-xl flex items-center gap-2">
          <CalIcon className="w-5 h-5" />
          Reglas de Negocio
        </h3>
        <button
          onClick={handleSave}
          disabled={saving || !activeProject?.id}
          className="bg-primario-zen text-fondo-zen px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-opacity-90 transition-all disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {/* Identidad del Salón */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-primario-zen/40">
            Nombre del Salón
          </label>
          <input
            type="text"
            placeholder="Ej: Zen Nails"
            value={settings.salon_name || ''}
            onChange={(e) => setSettings({ ...settings, salon_name: e.target.value })}
            className="w-full bg-white/50 border border-secundario-zen/50 rounded-xl px-4 py-2 text-primario-zen focus:outline-none focus:ring-2 focus:ring-primario-zen/20 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-primario-zen/40">
            Teléfono (Llamadas)
          </label>
          <input
            type="text"
            placeholder="Ej: 5512345678"
            value={settings.salon_phone || ''}
            onChange={(e) => setSettings({ ...settings, salon_phone: e.target.value })}
            className="w-full bg-white/50 border border-secundario-zen/50 rounded-xl px-4 py-2 text-primario-zen focus:outline-none focus:ring-2 focus:ring-primario-zen/20 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-primario-zen/40">
            WhatsApp
          </label>
          <input
            type="text"
            placeholder="Ej: 5512345678"
            value={settings.salon_whatsapp || ''}
            onChange={(e) => setSettings({ ...settings, salon_whatsapp: e.target.value })}
            className="w-full bg-white/50 border border-secundario-zen/50 rounded-xl px-4 py-2 text-primario-zen focus:outline-none focus:ring-2 focus:ring-primario-zen/20 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-primario-zen/40">
            Dirección
          </label>
          <input
            type="text"
            placeholder="Dirección del salón"
            value={settings.salon_address || ''}
            onChange={(e) => setSettings({ ...settings, salon_address: e.target.value })}
            className="w-full bg-white/50 border border-secundario-zen/50 rounded-xl px-4 py-2 text-primario-zen focus:outline-none focus:ring-2 focus:ring-primario-zen/20 transition-all"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-widest font-bold text-primario-zen/40">
            Logo URL
          </label>
          <input
            type="text"
            placeholder="https://..."
            value={settings.salon_logo_url || ''}
            onChange={(e) => setSettings({ ...settings, salon_logo_url: e.target.value })}
            className="w-full bg-white/50 border border-secundario-zen/50 rounded-xl px-4 py-2 text-primario-zen focus:outline-none focus:ring-2 focus:ring-primario-zen/20 transition-all"
          />
        </div>
      </div>

      {/* Reglas Operativas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-primario-zen/40 flex items-center gap-2">
            <Users className="w-3 h-3" />
            Capacidad Simultánea
          </label>
          <input
            type="number"
            value={settings.max_employees}
            onChange={(e) => setSettings({ ...settings, max_employees: parseInt(e.target.value, 10) || 1 })}
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

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-primario-zen/40 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Límite Anticipo (Horas)
          </label>
          <input
            type="number"
            value={settings.advance_grace_period_hours ?? 2}
            onChange={(e) => setSettings({ ...settings, advance_grace_period_hours: parseInt(e.target.value, 10) || 2 })}
            className="w-full bg-white/50 border border-secundario-zen/50 rounded-xl px-4 py-2 text-primario-zen focus:outline-none focus:ring-2 focus:ring-primario-zen/20 transition-all"
          />
          <p className="text-[10px] text-primario-zen/50 italic">Tiempo de gracia para enviar el comprobante.</p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-widest font-bold text-primario-zen/40">
            Datos Bancarios (Para Anticipos)
          </label>
          <textarea
            rows={4}
            placeholder="Banco: Tu Banco&#10;Cuenta: 0000000000&#10;CLABE: 000000000000000000&#10;Beneficiario: Tu Nombre"
            value={settings.bank_details || ''}
            onChange={(e) => setSettings({ ...settings, bank_details: e.target.value })}
            className="w-full bg-white/50 border border-secundario-zen/50 rounded-xl px-4 py-2 text-primario-zen focus:outline-none focus:ring-2 focus:ring-primario-zen/20 transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
}
