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
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import type { Employee } from '@/types/supabase';
import { DataTable, Column } from '@/components/ui/DataTable';

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

  const handleDelete = (id: string) => {
    if (confirm('¿Estás segura de eliminar a esta empleada?')) {
      deleteEmployee(id);
    }
  };

  // === ONBOARDING SIMULADO ===
  const simulateWelcomeEmail = (email: string, name: string) => {
    // Aquí iría la lógica real con Resend o Supabase Edge Functions
    console.log(`[ONBOARDING] Simulando envío de email de bienvenida a ${name} (${email})...`);
    // Toast Notification podría ir aquí si usáramos useToast
  };

  const handleSubmit = async (payload: any) => {
    if (editingEmployee) {
      await updateEmployee(editingEmployee.id, payload);
    } else {
      await createEmployee(payload);
      if (payload.email) {
        simulateWelcomeEmail(payload.email, payload.name);
      }
    }
  };

  const columns: Column<Employee>[] = [
    {
      header: 'Nombre',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="bg-primario-zen/10 p-2 rounded-full">
            <User className="w-4 h-4 text-primario-zen" />
          </div>
          <span className="font-semibold">{row.name}</span>
        </div>
      ),
      sortKey: 'name'
    },
    {
      header: 'Contacto',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-xs text-primario-zen/70">
          <Mail className="w-3.5 h-3.5" />
          {row.email || <span className="italic opacity-50">Sin correo</span>}
        </div>
      )
    },
    {
      header: 'Rol',
      accessor: (row) => (
        <span className="bg-secundario-zen/30 text-primario-zen/70 text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-semibold inline-flex items-center gap-1">
          <Shield className="w-3 h-3" />
          {row.role === 'TOTAL' ? 'Admin' : 'Especialista'}
        </span>
      ),
      sortKey: 'role'
    },
    {
      header: 'Ingreso',
      accessor: (row) => (
        <span className="text-xs text-primario-zen/70">
          {format(new Date(row.created_at), 'MMM yyyy')}
        </span>
      ),
      sortKey: 'created_at'
    },
    {
      header: 'Acciones',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => handleOpenEdit(row)} className="p-2 text-primario-zen/60 hover:text-primario-zen hover:bg-secundario-zen/20 rounded-full transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(row.id)} className="p-2 text-on-surface-variant/50 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

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
          <p className="text-red-700 text-sm">Ocurrió un error al cargar el equipo. Intenta de nuevo.</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : employees.length > 0 ? (
        <DataTable
          data={employees}
          columns={columns}
          itemsPerPage={5}
        />
      ) : (
        <EmptyState
          icon={User}
          title="Agrega tu equipo"
          description="Registra a las empleadas del salón para asignarles citas y gestionar disponibilidad. Al registrarlas, recibirán un correo automático de bienvenida."
          action={{ label: '+ Añadir Empleada', onClick: handleOpenCreate }}
        />
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
