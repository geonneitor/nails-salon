// ============================================================
// src/hooks/useEmployees.ts
// Fetch de empleados del proyecto activo.
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

  useEffect(() => {
    if (!activeProject) {
      setIsLoading(false);
      return;
    }

    supabase
      .from('employees')
      .select('*')
      .eq('project_id', activeProject.id)
      .order('name', { ascending: true })
      .then(({ data, error: e }) => {
        if (e) setError(e.message);
        else setEmployees((data as Employee[]) ?? []);
        setIsLoading(false);
      });
  }, [activeProject]);

  return { employees, isLoading, error };
}
