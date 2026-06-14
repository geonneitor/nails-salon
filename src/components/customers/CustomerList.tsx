'use client';
// ============================================================
// src/components/customers/CustomerList.tsx
// Lista de clientas con búsqueda, edición y eliminación.
// ============================================================
import { useState } from 'react';
import { Search, Users } from 'lucide-react';
import { CustomerCard } from './CustomerCard';
import { CustomerDetailModal } from './CustomerDetailModal';
import { CustomerFormModal } from './CustomerFormModal';
import { useCustomers } from '@/hooks/useCustomers';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import type { Customer } from '@/types/supabase';
import { useApp } from '@/context/AppContext';

export function CustomerList() {
  const { preferences } = useApp();
  const { customers, isLoading, error, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'visits'>('visits');

  const isCompact = preferences?.density === 'compact';

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm)) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => {
    if (sortBy === 'visits') {
      return (b.visit_count || 0) - (a.visit_count || 0);
    }
    return a.name.localeCompare(b.name);
  });

  const handleOpenCreateForm = () => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (payload: any) => {
    if (editingCustomer) {
      return await updateCustomer(editingCustomer.id, payload);
    } else {
      return await createCustomer(payload);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-primario-zen/40" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest border border-secundario-zen/50 rounded-2xl text-primario-zen text-sm focus:outline-none focus:ring-2 focus:ring-primario-zen/30 transition-all shadow-sm"
          />
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'visits')}
          className="bg-surface-container-lowest border border-secundario-zen/50 rounded-2xl px-4 py-3 text-primario-zen text-sm focus:outline-none focus:ring-2 focus:ring-primario-zen/30 transition-all shadow-sm hidden md:block"
        >
          <option value="visits">Más visitas</option>
          <option value="name">Alfabético</option>
        </select>

        {/* FIXED: copy unificado → "+ Nueva Clienta" */}
        <button
          onClick={handleOpenCreateForm}
          className="bg-primario-zen text-fondo-zen px-6 py-3 rounded-2xl uppercase tracking-widest text-xs font-semibold hover:bg-opacity-90 transition-all shadow-sm whitespace-nowrap"
        >
          + Nueva Clienta
        </button>
      </div>

      {error && (
        <div className="text-center py-8 bg-red-50 rounded-2xl border border-red-200">
          <p className="text-red-700 text-sm">Ocurrió un error al cargar las clientas. Intenta de nuevo.</p>
        </div>
      )}

      {isLoading ? (
        /* Skeleton en lugar de spinner Loader2 */
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${isCompact ? 'gap-2' : 'gap-4'}`}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredCustomers.length > 0 ? (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${isCompact ? 'gap-2' : 'gap-4'}`}>
          {filteredCustomers.map(customer => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onClick={() => setSelectedCustomer(customer)}
            />
          ))}
        </div>
      ) : searchTerm ? (
        /* Sin resultados de búsqueda */
        <div className="text-center py-10 bg-secundario-zen/20 rounded-2xl border border-dashed border-secundario-zen/60">
          <p className="text-primario-zen/60 text-sm italic">
            No se encontraron clientas con esa búsqueda.
          </p>
        </div>
      ) : (
        /* Empty state de primer uso */
        <EmptyState
          icon={Users}
          title="Agrega tu primera clienta"
          description="Empieza registrando a tus clientas para gestionar sus citas y preferencias desde un solo lugar."
          action={{ label: '+ Nueva Clienta', onClick: handleOpenCreateForm }}
        />
      )}

      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onEdit={() => handleOpenEditForm(selectedCustomer!)}
        onDelete={() => deleteCustomer(selectedCustomer!.id)}
      />

      <CustomerFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingCustomer}
      />
    </div>
  );
}
