'use client';
// ============================================================
// src/components/settings/EmployeeList.tsx
// Gestión completa de empleadas en la configuración.
// ============================================================
import { useState } from 'react';
import { User, Shield, Mail, Plus, Pencil, Trash2 } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { format } from 'date-fns';
import { EmployeeFormModal } from './EmployeeFormModal';
import type { Employee } from '@/types/supabase';

export function EmployeeList() {
  const { employees, isLoading, error, createEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const handleOpenCreate = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setIsFormOpen(true);
  };

  const handleSubmit = async (payload: any) => {
    if (editingEmployee) {
      await updateEmployee(editingEmployee.id, payload);
    } else {
      await createEmployee(payload);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-serif text-primario-zen text-2xl tracking-wide">Equipo de Trabajo</h2>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-primario-zen text-fondo-zen px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-sm"
        >
          <Plus className="w-3 h-3" />
          Añadir Empleada
        </button>
      </div>

      {error && (
        <div className="text-center py-4 bg-red-50 rounded-xl border border-red-200">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-24 bg-secundario-zen/20 rounded-2xl w-full"></div>
          <div className="h-24 bg-secundario-zen/20 rounded-2xl w-full"></div>
        </div>
      ) : employees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {employees.map(emp => (
            <div key={emp.id} className="flex flex-col gap-3 rounded-2xl bg-[#FDFBEE] p-5 shadow-sm border border-secundario-zen/40 group">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="bg-primario-zen/10 p-2 rounded-full">
                    <User className="w-5 h-5 text-primario-zen" />
                  </div>
                  <h3 className="font-serif text-primario-zen text-lg tracking-wide">
                    {emp.name}
                  </h3>
                </div>
                <span className="bg-secundario-zen/30 text-primario-zen/70 text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {emp.role === 'TOTAL' ? 'Admin' : 'Especialista'}
                </span>
              </div>

              {emp.email && (
                <p className="text-primario-zen/70 text-sm flex items-center gap-2 mt-2">
                  <Mail className="w-3.5 h-3.5" />
                  {emp.email}
                </p>
              )}

              <div className="mt-2 pt-3 border-t border-secundario-zen/30 flex justify-between items-center">
                <p className="text-primario-zen/50 text-[10px] uppercase tracking-widest font-semibold">
                  Se unió en {format(new Date(emp.created_at), 'MMMM yyyy')}
                </p>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(emp)}
                    className="p-2 rounded-full bg-white border border-secundario-zen/50 text-primario-zen/60 hover:text-primario-zen transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteEmployee(emp.id)}
                    className="p-2 rounded-full bg-white border border-secundario-zen/50 text-red-400 hover:text-red-600 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-secundario-zen/20 rounded-2xl border border-dashed border-secundario-zen/60">
          <p className="text-primario-zen/60 text-sm italic">
            No hay empleadas registradas en el proyecto.
          </p>
        </div>
      )}

      <EmployeeFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingEmployee}
      />
    </div>
  );
}
