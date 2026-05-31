'use client';
// ============================================================
// src/components/customers/CustomerList.tsx
// Lista de clientas con búsqueda, edición y eliminación.
// ============================================================
import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { CustomerCard } from './CustomerCard';
import { CustomerDetailModal } from './CustomerDetailModal';
import { CustomerFormModal } from './CustomerFormModal';
import { useCustomers } from '@/hooks/useCustomers';
import type { Customer } from '@/types/supabase';

export function CustomerList() {
  const { customers, isLoading, error, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm)) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            className="w-full pl-11 pr-4 py-3 bg-[#FDFBEE] border border-secundario-zen/50 rounded-2xl text-primario-zen text-sm focus:outline-none focus:ring-2 focus:ring-primario-zen/30 transition-all shadow-sm"
          />
        </div>
        <button
          onClick={handleOpenCreateForm}
          className="bg-primario-zen text-fondo-zen px-6 py-3 rounded-2xl uppercase tracking-widest text-xs font-semibold hover:bg-opacity-90 transition-all shadow-sm whitespace-nowrap"
        >
          + Nueva
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
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map(customer => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onClick={() => setSelectedCustomer(customer)}
              />
            ))
          ) : (
             <div className="col-span-full text-center py-10 bg-secundario-zen/20 rounded-2xl border border-dashed border-secundario-zen/60">
              <p className="text-primario-zen/60 text-sm italic">
                {searchTerm ? 'No se encontraron clientas con esa búsqueda.' : 'No hay clientas registradas aún.'}
              </p>
            </div>
          )}
        </div>
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
