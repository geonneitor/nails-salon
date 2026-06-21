'use client';
// ============================================================
// src/components/customers/CustomerList.tsx
// Lista de clientas con búsqueda, edición y eliminación.
// ============================================================
import { useState } from 'react';
import { Search, Users, Pencil, Trash2 } from 'lucide-react';
import { CustomerDetailModal } from './CustomerDetailModal';
import { CustomerFormModal } from './CustomerFormModal';
import { useCustomers } from '@/hooks/useCustomers';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import type { Customer } from '@/types/supabase';
import { useApp } from '@/context/AppContext';
import { DataTable, Column } from '@/components/ui/DataTable';

export function CustomerList() {
  const { preferences } = useApp();
  const { customers, isLoading, error, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const isCompact = preferences?.density === 'compact';

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm)) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenCreateForm = () => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (customer: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm('¿Estás segura de eliminar a esta clienta?')) {
      deleteCustomer(id);
    }
  };

  const handleFormSubmit = async (payload: any) => {
    if (editingCustomer) {
      return await updateCustomer(editingCustomer.id, payload);
    } else {
      return await createCustomer(payload);
    }
  };

  const columns: Column<Customer>[] = [
    {
      header: 'Nombre',
      accessor: 'name',
      sortKey: 'name',
      className: 'font-semibold',
    },
    {
      header: 'Contacto',
      accessor: (row) => (
        <div className="flex flex-col text-xs text-primario-zen/70">
          {row.phone ? <span>{row.phone}</span> : <span className="opacity-50 italic">Sin teléfono</span>}
          {row.email && <span className="opacity-70">{row.email}</span>}
        </div>
      )
    },
    {
      header: 'Visitas Totales',
      accessor: 'visit_count',
      sortKey: 'visit_count',
      className: 'text-center'
    },
    {
      header: 'Acciones',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={(e) => handleOpenEditForm(row, e)} className="p-2 text-primario-zen/60 hover:text-primario-zen hover:bg-secundario-zen/20 rounded-full transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={(e) => handleDelete(row.id, e)} className="p-2 text-on-surface-variant/50 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

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
        <div className="flex flex-col gap-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredCustomers.length > 0 ? (
        <DataTable 
          data={filteredCustomers} 
          columns={columns} 
          onRowClick={(c) => setSelectedCustomer(c)} 
          itemsPerPage={8}
        />
      ) : searchTerm ? (
        <div className="text-center py-10 bg-secundario-zen/20 rounded-2xl border border-dashed border-secundario-zen/60">
          <p className="text-primario-zen/60 text-sm italic">
            No se encontraron clientas con esa búsqueda.
          </p>
        </div>
      ) : (
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
        onEdit={() => handleOpenEditForm(selectedCustomer!, { stopPropagation: () => {} } as any)}
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
