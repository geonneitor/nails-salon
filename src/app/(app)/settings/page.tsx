'use client';

import { EmployeeList } from '@/components/settings/EmployeeList';
import { ProjectList } from '@/components/settings/ProjectList';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { BusinessSettings } from '@/components/settings/BusinessSettings';
import { CustomerList } from '@/components/customers/CustomerList';
import { ServiceList } from '@/components/services/ServiceList';
import { ManualOperativo } from '@/components/settings/ManualOperativo';
import { LayoutGrid, Users, Heart, Clock, Palette, BookOpen } from 'lucide-react';
import { useState } from 'react';

export default function AjustesPage() {
  const [activeTab, setActiveTab] = useState('negocio');

  const tabs = [
    { id: 'negocio', label: 'Negocio', icon: Clock, component: <BusinessSettings /> },
    { id: 'equipo', label: 'Equipo', icon: Users, component: <EmployeeList /> },
    { id: 'clientas', label: 'Clientela', icon: Heart, component: <CustomerList /> },
    { id: 'servicios', label: 'Servicios', icon: LayoutGrid, component: <ServiceList /> },
    { id: 'estetica', label: 'Estética', icon: Palette, component: <AppearanceSettings /> },
    { id: 'manual', label: 'Manual Operativo', icon: BookOpen, component: <ManualOperativo /> },
  ];

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="flex flex-col items-center py-10 px-6 w-full">
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-end mb-8 border-b border-secundario-zen/50 pb-4">
          <h1 className="text-primario-zen font-serif text-3xl uppercase tracking-widest">
            Panel de Administración
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Navegación Lateral de Ajustes */}
          <div className="md:w-64 flex flex-col gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primario-zen text-fondo-zen shadow-md'
                    : 'bg-white/50 text-primario-zen/60 hover:bg-secundario-zen/30'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}

            <div className="mt-10 p-4 bg-secundario-zen/20 rounded-2xl border border-dashed border-secundario-zen/40">
              <p className="text-primario-zen/40 text-[10px] uppercase tracking-widest font-bold mb-2">Proyecto Actual</p>
              <ProjectList />
            </div>
          </div>

          {/* Contenido del Tab Activo */}
          <div className="flex-1 bg-fondo-zen/50 rounded-3xl p-6 md:p-8 border border-secundario-zen/50 shadow-sm min-h-[600px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primario-zen/10 rounded-lg">
                <currentTab.icon className="w-5 h-5 text-primario-zen" />
              </div>
              <h2 className="font-serif text-primario-zen text-2xl tracking-wide">
                {currentTab.label}
              </h2>
            </div>
            {currentTab.component}
          </div>
        </div>
      </div>
    </div>
  );
}

