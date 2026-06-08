'use client';

import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Palette, Maximize, Minimize, Layout, Calendar } from 'lucide-react';
import type { ThemeType, DensityType, CalendarViewType } from '@/types/supabase';

export function AppearanceSettings() {
  const { preferences, updatePreference } = useApp();

  //  SOLUCIÓN AL CANDADO: Si no hay preferencias aún, creamos un objeto espejo temporal
  // para que la interfaz NUNCA desaparezca y la app no se rompa.
  const safePreferences = preferences || {
    theme: 'zen-light' as ThemeType,
    density: 'comfortable' as DensityType,
    sidebar_collapsed: false,
    default_view: 'month' as CalendarViewType
  };

  // 📝 CORRECCIÓN DE IDS: Asegúrate de que estos IDs coincidan letra por letra
  // con los selectores [data-theme='...'] de tu globals.css
  const themes: { id: ThemeType; label: string; color: string }[] = [
    { id: 'zen-light', label: 'Zen Light', color: '#F7F5F0' }, // Mapeado a [data-theme='zen-light']
    { id: 'zen-dark', label: 'Zen Dark', color: '#1A1C18' },   // Mapeado a [data-theme='zen-dark']
    { id: 'high-contrast', label: 'Contraste Alto', color: '#FFFFFF' },
  ];

  const densities: { id: DensityType; label: string }[] = [
    { id: 'comfortable', label: 'Espaciado' },
    { id: 'compact', label: 'Compacto' },
  ];

  const views: { id: CalendarViewType; label: string }[] = [
    { id: 'day', label: 'Día' },
    { id: 'week', label: 'Semana' },
    { id: 'month', label: 'Mes' },
  ];

  return (
    <div className="pt-10 border-t border-secundario-zen/50 flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-primario-zen" />
          <h3 className="font-serif text-primario-zen text-xl">Apariencia</h3>
        </div>
        <p className="text-primario-zen/60 text-sm mb-6">
          Personaliza el entorno visual de tu estudio para adaptarlo a tu ritmo de trabajo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tema Visual */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/40">
              Tema de Color
            </label>
            <div className="flex gap-3">
              {[
                { id: 'zen-light', label: 'Boutique (Claro)', color: '#F7F5F0' },
                { id: 'zen-dark', label: 'Nocturno (Oscuro)', color: '#1A1C18' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => updatePreference?.({ theme: t.id as any })}
                  className={`group relative w-10 h-10 rounded-full transition-all duration-300 ${
                    safePreferences.theme === t.id
                      ? 'ring-2 ring-primario-zen ring-offset-2'
                      : 'hover:scale-110 shadow-sm'
                  }`}
                  title={t.label}
                >
                  <div
                    className="w-full h-full rounded-full border border-secundario-zen/50 shadow-inner"
                    style={{ backgroundColor: t.color }}
                  />
                  {safePreferences.theme === t.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-primario-zen rounded-full shadow-sm" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Densidad de Información */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/40">
              Densidad de Interfaz
            </label>
            <div className="flex flex-wrap gap-2">
              {densities.map((d) => (
                <button
                  key={d.id}
                  onClick={() => updatePreference?.({ density: d.id })}
                  className={`px-4 py-2 rounded-xl text-xs transition-all border ${
                    safePreferences.density === d.id
                      ? 'bg-primario-zen text-fondo-zen border-primario-zen'
                      : 'bg-fondo-zen text-primario-zen border-secundario-zen/60 hover:bg-secundario-zen/30'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sidebar Toggle */}
        <div className="flex flex-col gap-3">
          <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/40">
            Panel de Navegación
          </label>
          <button
            onClick={() => updatePreference?.({ sidebar_collapsed: !safePreferences.sidebar_collapsed })}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all border ${
              safePreferences.sidebar_collapsed
                ? 'bg-primario-zen text-fondo-zen border-primario-zen'
                : 'bg-fondo-zen text-primario-zen border-secundario-zen/60 hover:bg-secundario-zen/30'
            }`}
          >
            {safePreferences.sidebar_collapsed ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            <span>{safePreferences.sidebar_collapsed ? 'Expandir Sidebar' : 'Colapsar Sidebar'}</span>
          </button>
        </div>

        {/* Vista Predeterminada */}
        <div className="flex flex-col gap-3">
          <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/40">
            Vista Inicial del Calendario
          </label>
          <div className="flex flex-wrap gap-2">
            {views.map((v) => (
              <button
                key={v.id}
                onClick={() => updatePreference?.({ default_view: v.id })}
                className={`flex-1 min-w-[80px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs transition-all border ${
                  safePreferences.default_view === v.id
                    ? 'bg-primario-zen text-fondo-zen border-primario-zen'
                    : 'bg-fondo-zen text-primario-zen border-secundario-zen/60 hover:bg-secundario-zen/30'
                }`}
              >
                <Calendar className="w-3 h-3" />
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}