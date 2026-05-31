'use client';
// ============================================================
// src/components/settings/EmployeeList.tsx
// Lista de empleados en la configuración.
// ============================================================
import { User, Shield, Mail } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { format } from 'date-fns';

export function EmployeeList() {
  const { employees, isLoading, error } = useEmployees();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-serif text-primario-zen text-2xl tracking-wide mb-2">Empleadas Registradas</h2>
      
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
            <div key={emp.id} className="flex flex-col gap-3 rounded-2xl bg-[#FDFBEE] p-5 shadow-sm border border-secundario-zen/40">
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
              
              <div className="mt-2 pt-3 border-t border-secundario-zen/30">
                <p className="text-primario-zen/50 text-[10px] uppercase tracking-widest font-semibold">
                  Se unió en {format(new Date(emp.created_at), 'MMMM yyyy')}
                </p>
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
    </div>
  );
}
