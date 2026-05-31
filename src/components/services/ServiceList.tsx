'use client';
// ============================================================
// src/components/services/ServiceList.tsx
// Lista de servicios del proyecto con CRUD completo.
// ============================================================
import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { ServiceCard } from './ServiceCard';
import { ServiceFormModal } from './ServiceFormModal';
import { useServices } from '@/hooks/useServices';
import type { Service } from '@/types/supabase';

export function ServiceList() {
  const { services, isLoading, error, createService, updateService, deleteService } = useServices();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenCreateForm = () => {
    setEditingService(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (payload: any) => {
    if (editingService) {
      return await updateService(editingService.id, payload);
    } else {
      return await createService(payload);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-end">
        <button
          onClick={handleOpenCreateForm}
          className="bg-primario-zen text-fondo-zen px-6 py-3 rounded-2xl uppercase tracking-widest text-xs font-semibold hover:bg-opacity-90 transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nuevo Servicio
        </button>
      </div>

      {error && (
        <div className="text-center py-8 bg-red-50 rounded-2xl border border-red-200">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primario-zen/50" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.length > 0 ? (
            services.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={() => handleOpenEditForm(service)}
                onDelete={() => deleteService(service.id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10 bg-secundario-zen/20 rounded-2xl border border-dashed border-secundario-zen/60">
              <p className="text-primario-zen/60 text-sm italic">
                No hay servicios registrados aún.
              </p>
            </div>
          )}
        </div>
      )}

      <ServiceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingService}
      />
    </div>
  );
}
