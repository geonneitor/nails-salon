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

  const updateService = async (id: string, payload: Partial<Omit<Service, 'id' | 'created_at' | 'project_id'>>) => {
    if (!activeProject) {
      setError('No hay un proyecto activo seleccionado.');
      return null;
    }
    const { data, error: e } = await supabase
      .from('services')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (e) {
      setError(e.message);
      return null;
    }

    setServices((prev) =>
      prev.map((s) => (s.id === id ? (data as Service) : s))
    );
    return data as Service;
  };

  const deleteService = async (id: string) => {
    if (!activeProject) return false;
    const { error: e } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (e) {
      setError(e.message);
      return false;
    }

    setServices((prev) => prev.filter((s) => s.id !== id));
    return true;
  };

  return { services, isLoading, error, createService, updateService, deleteService };
}
