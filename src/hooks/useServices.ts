// ============================================================
// src/hooks/useServices.ts
// Fetch de servicios del proyecto activo.
// ============================================================
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Service } from '@/types/supabase';
import { useApp } from '@/context/AppContext';

export function useServices() {
  const { activeProject } = useApp();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProject) {
      setIsLoading(false);
      return;
    }

    supabase
      .from('services')
      .select('*')
      .eq('project_id', activeProject.id)
      .order('name', { ascending: true })
      .then(({ data, error: e }) => {
        if (e) setError(e.message);
        else setServices((data as Service[]) ?? []);
        setIsLoading(false);
      });
  }, [activeProject]);

  const createService = async (payload: Omit<Service, 'id' | 'created_at' | 'project_id'>) => {
    if (!activeProject) return null;
    const { data, error: e } = await supabase
      .from('services')
      .insert({ ...payload, project_id: activeProject.id })
      .select()
      .single();
    if (e) { setError(e.message); return null; }
    setServices((prev) => [...prev, data as Service].sort((a, b) => a.name.localeCompare(b.name)));
    return data as Service;
  };

  return { services, isLoading, error, createService };
}
