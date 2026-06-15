// ============================================================
// src/hooks/useCustomers.ts
// CRUD de clientas con contrato explícito (projectId prop tiene prioridad).
// Mismo patrón que useAppointments / useTimeBlocks.
// ============================================================
'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Customer, CustomerGallery } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';
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
  fetchGallery: (customerId: string) => Promise<CustomerGallery[]>;
  uploadPhoto: (customerId: string, file: File, notes?: string) => Promise<CustomerGallery | null>;
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

    const channelId = `customers_${projectId}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
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
        .eq('project_id', projectId)
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
        .eq('id', id)
        .eq('project_id', projectId);

      if (e) {
        setError(e.message);
        return false;
      }

      setCustomers((prev) => prev.filter((c) => c.id !== id));
      return true;
    },
    [projectId]
  );

  const fetchGallery = useCallback(async (customerId: string): Promise<CustomerGallery[]> => {
    const { data, error: e } = await supabase
      .from('customer_gallery')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (e) {
      console.error('Error fetching gallery:', e.message);
      return [];
    }
    return data as CustomerGallery[];
  }, []);

  const uploadPhoto = useCallback(async (customerId: string, file: File, notes?: string): Promise<CustomerGallery | null> => {
    if (!projectId) return null;
    
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen válida.');
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB.');
      return null;
    }

    const safeExt = file.type.split('/')[1] ?? 'bin';
    const fileName = `${projectId}/${customerId}/${uuidv4()}.${safeExt}`;
    
    // Upload file to bucket
    const { error: uploadError } = await supabase.storage
      .from('customer-gallery')
      .upload(fileName, file);

    if (uploadError) {
      setError(uploadError.message);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('customer-gallery')
      .getPublicUrl(fileName);

    // Save to DB
    const { data, error: dbError } = await supabase
      .from('customer_gallery')
      .insert({
        customer_id: customerId,
        image_url: publicUrl,
        notes: notes || null
      })
      .select()
      .single();

    if (dbError) {
      setError(dbError.message);
      return null;
    }

    return data as CustomerGallery;
  }, [projectId]);

  return { customers, isLoading, error, createCustomer, updateCustomer, deleteCustomer, refetch: fetchCustomers, fetchGallery, uploadPhoto };
}
