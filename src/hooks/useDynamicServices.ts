'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { ServiceCategory, ServiceVariant, ServiceModifier } from '@/types/supabase';
import { useApp } from '@/context/AppContext';

export interface DynamicServicesData {
  categories: ServiceCategory[];
  variants: ServiceVariant[];
  modifiers: ServiceModifier[];
}

export function useDynamicServices() {
  const { activeProject } = useApp();
  const [data, setData] = useState<DynamicServicesData>({ categories: [], variants: [], modifiers: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    const projectId = activeProject?.id || process.env.NEXT_PUBLIC_PROJECT_ID;

    setIsLoading(true);
    
    try {
      let catQuery = supabase.from('service_categories').select('*').order('display_order');
      if (projectId) {
        catQuery = catQuery.eq('project_id', projectId);
      }

      const [catRes, varRes, modRes] = await Promise.all([
        catQuery,
        supabase.from('service_variants').select('*').order('display_order'),
        supabase.from('service_modifiers').select('*').order('display_order')
      ]);

      if (catRes.error) throw catRes.error;
      if (varRes.error) throw varRes.error;
      if (modRes.error) throw modRes.error;

      const categories = catRes.data as ServiceCategory[];
      const catIds = categories.map(c => c.id);

      const variants = (varRes.data as ServiceVariant[]).filter(v => catIds.includes(v.category_id));
      const modifiers = (modRes.data as ServiceModifier[]).filter(m => catIds.includes(m.category_id));

      setData({ categories, variants, modifiers });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeProject]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const updateVariantPrice = async (id: string, price: number) => {
    const { error: e } = await supabase.from('service_variants').update({ base_price: price }).eq('id', id);
    if (e) throw e;
    await fetchServices();
  };

  const updateModifierPrice = async (id: string, price: number) => {
    const { error: e } = await supabase.from('service_modifiers').update({ price_delta: price }).eq('id', id);
    if (e) throw e;
    await fetchServices();
  };

  const toggleCategoryActive = async (id: string, isActive: boolean) => {
    const { error: e } = await supabase.from('service_categories').update({ is_active: isActive }).eq('id', id);
    if (e) throw e;
    await fetchServices();
  };

  const toggleVariantActive = async (id: string, isActive: boolean) => {
    const { error: e } = await supabase.from('service_variants').update({ is_active: isActive }).eq('id', id);
    if (e) throw e;
    await fetchServices();
  };

  const toggleModifierActive = async (id: string, isActive: boolean) => {
    const { error: e } = await supabase.from('service_modifiers').update({ is_active: isActive }).eq('id', id);
    if (e) throw e;
    await fetchServices();
  };

  return {
    ...data,
    isLoading,
    error,
    refetch: fetchServices,
    updateVariantPrice,
    updateModifierPrice,
    toggleCategoryActive,
    toggleVariantActive,
    toggleModifierActive
  };
}
