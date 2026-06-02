// ============================================================
// src/hooks/useCustomers.ts
// CRUD de clientas con contrato explícito (projectId prop tiene prioridad).
// Mismo patrón que useAppointments / useTimeBlocks.
// ============================================================
'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Customer } from '@/types/supabase';
import { useApp } from '@/context/AppContext';

export type CreateCustomerInput = Omit<
  Customer,
  'id' | 'created_at' | 'visit_count' | 'project_id'
>;
export type UpdateCustomerInput = Partial<CreateCustomerInput>;

interface UseCustomersOptions {
  /**
   * ID del proyecto del que se quieren obtener/operar clientas.
   * Si se omite, el hook usa `activeProject` del contexto como fallback.
   */
  projectId?: string | null;
}

interface UseCustomersReturn {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  createCustomer: (payload: CreateCustomerInput) => Promise<Customer | null>;
  updateCustomer: (id: string, payload: UpdateCustomerInput) => Promise<Customer | null>;
  deleteCustomer: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useCustomers(options: UseCustomersOptions = {}): UseCustomersReturn {
  const { activeProject } = useApp();
  const projectId = options.projectId ?? activeProject?.id ?? null;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    if (!projectId) {
      setCustomers([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);

    const { data, error: e } = await supabase
      .from('customers')
      .select('*')
      .eq('project_id', projectId)
      .order('name', { ascending: true });

    if (e) {
      setError(e.message);
    } else {
      setCustomers((data as Customer[]) ?? []);
    }
    setIsLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchCustomers();

    if (!projectId) return;

    const channel = supabase
      .channel(`customers:project:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
          filter: `project_id=eq.${projectId}`,
        },
        () => fetchCustomers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCustomers, projectId]);

  const createCustomer = useCallback(
    async (payload: CreateCustomerInput): Promise<Customer | null> => {
      if (!projectId) {
        setError('No hay un proyecto activo seleccionado.');
        return null;
      }
      const { data, error: e } = await supabase
        .from('customers')
        .insert({ ...payload, project_id: projectId, visit_count: 0 })
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
    },
    [projectId]
  );

  const updateCustomer = useCallback(
    async (id: string, payload: UpdateCustomerInput): Promise<Customer | null> => {
      if (!projectId) {
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
    },
    [projectId]
  );

  const deleteCustomer = useCallback(
    async (id: string): Promise<boolean> => {
      if (!projectId) return false;
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
    },
    [projectId]
  );

  return { customers, isLoading, error, createCustomer, updateCustomer, deleteCustomer, refetch: fetchCustomers };
}
