// ============================================================
// src/hooks/useCustomers.ts
// Fetch de clientas con MOCK-AUTH integrado para DEMO en Netlify
// ============================================================
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Customer } from '@/types/supabase';
import { useApp } from '@/context/AppContext';

export function useCustomers() {
  const { activeProject } = useApp();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);

      if (!activeProject) {
        setIsLoading(false);
        return;
      }

      const { data, error: e } = await supabase
        .from('customers')
        .select('*')
        .eq('project_id', activeProject.id)
        .order('name', { ascending: true });

      if (e) {
        setError(e.message);
      } else {
        setCustomers((data as Customer[]) ?? []);
      }
      setIsLoading(false);
    };

    fetchCustomers();
  }, [activeProject]);

  const createCustomer = async (payload: Omit<Customer, 'id' | 'created_at' | 'visit_count' | 'project_id'>) => {
    if (!activeProject) {
      setError('No hay un proyecto activo seleccionado.');
      return null;
    }
    const { data, error: e } = await supabase
      .from('customers')
      .insert({ ...payload, project_id: activeProject.id, visit_count: 0 })
      .select()
      .single();

    if (e) {
      setError(e.message);
      return null;
    }

    setCustomers((prev) =>
      [...prev, data as Customer].sort((a, b) => a.name.localeCompare(b.name))
    );
    return data as Customer;
  };

  const updateCustomer = async (id: string, payload: Partial<Omit<Customer, 'id' | 'created_at' | 'visit_count' | 'project_id'>>) => {
    if (!activeProject) {
      setError('No hay un proyecto activo seleccionado.');
      return null;
    }
    const { data, error: e } = await supabase
      .from('customers')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (e) {
      setError(e.message);
      return null;
    }

    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? (data as Customer) : c))
    );
    return data as Customer;
  };

  const deleteCustomer = async (id: string) => {
    if (!activeProject) return false;
    const { error: e } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (e) {
      setError(e.message);
      return false;
    }

    setCustomers((prev) => prev.filter((c) => c.id !== id));
    return true;
  };

  return { customers, isLoading, error, createCustomer, updateCustomer, deleteCustomer };
}