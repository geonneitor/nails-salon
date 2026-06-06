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
    const employeeData = { ...payload, project_id: activeProject.id };
    const { data, error: e } = await supabase
      .from('employees')
      .insert(employeeData)
      .select()
      .single();

    if (e) throw e;
    await fetchEmployees();
    return data;
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
