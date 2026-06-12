// ============================================================
// src/hooks/useEmployees.ts
// Gestión completa de empleados del proyecto activo.
// ============================================================
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Employee } from '@/types/supabase';
import { useApp } from '@/context/AppContext';

export function useEmployees() {
  const { activeProject } = useApp();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    if (!activeProject) return;
    setIsLoading(true);
    const { data, error: e } = await supabase
      .from('employees')
      .select('*')
      .eq('project_id', activeProject.id)
      .order('name', { ascending: true });

    if (e) setError(e.message);
    else setEmployees((data as Employee[]) ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, [activeProject]);

  const createEmployee = async (payload: Partial<Employee>) => {
    if (!activeProject) throw new Error('No hay proyecto activo');
    
    // Llamar a la API interna segura para crear el usuario en Auth y enviar la invitación
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: payload.email,
        name: payload.name,
        role: payload.role,
        projectId: activeProject.id,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al invitar empleada.');
    }

    await fetchEmployees();
    return result.employee;
  };

  const updateEmployee = async (id: string, payload: Partial<Employee>) => {
    const { error: e } = await supabase
      .from('employees')
      .update(payload)
      .eq('id', id);

    if (e) throw e;
    await fetchEmployees();
  };

  const deleteEmployee = async (id: string) => {
    const { error: e } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (e) throw e;
    await fetchEmployees();
  };

  return {
    employees,
    isLoading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    refetch: fetchEmployees
  };
}
