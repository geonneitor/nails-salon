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

export function useDynamicServices(explicitProjectId?: string) {
  const { activeProject } = useApp();
  const [data, setData] = useState<DynamicServicesData>({ categories: [], variants: [], modifiers: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    const projectId = explicitProjectId || activeProject?.id || process.env.NEXT_PUBLIC_PROJECT_ID || '489e898d-3b2a-4775-b784-93a0e1a473e0';

    setIsLoading(true);
    
    try {
      let catQuery = supabase.from('service_categories').select('*').order('display_order');
      if (projectId) {
        catQuery = catQuery.eq('project_id', projectId);
      }

      // 1. Primero obtenemos las categorías del proyecto
      const catRes = await catQuery;
      if (catRes.error) throw catRes.error;

      const categories = catRes.data as ServiceCategory[];
      const catIds = categories.map(c => c.id);

      // 2. Luego filtramos variants y modifiers SOLO de esas categorías
      //    Esto garantiza que ORDER BY display_order aplique solo al proyecto correcto
      //    y evita mezclar datos de otros proyectos en la BD.
      const [varRes, modRes] = await Promise.all([
        catIds.length > 0
          ? supabase.from('service_variants').select('*').in('category_id', catIds).order('display_order')
          : Promise.resolve({ data: [], error: null }),
        catIds.length > 0
          ? supabase.from('service_modifiers').select('*').in('category_id', catIds).order('display_order')
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (varRes.error) throw varRes.error;
      if (modRes.error) throw modRes.error;

      const variants = varRes.data as ServiceVariant[];
      const modifiers = modRes.data as ServiceModifier[];

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

  // --- CATEGORIES CRUD ---
  const createCategory = async (name: string, selection_type: 'single' | 'multiple') => {
    const projectId = explicitProjectId || activeProject?.id || process.env.NEXT_PUBLIC_PROJECT_ID;
    if (!projectId) throw new Error('No project_id available');
    
    // Calcula el max display_order
    const currentMax = data.categories.length > 0 ? Math.max(...data.categories.map(c => c.display_order)) : 0;
    
    const { error: e } = await supabase.from('service_categories').insert({
      project_id: projectId,
      name,
      selection_type,
      display_order: currentMax + 1
    });
    if (e) throw e;
    await fetchServices();
  };

  const updateCategory = async (id: string, updates: Partial<Omit<ServiceCategory, 'id' | 'project_id' | 'created_at'>>) => {
    const { error: e } = await supabase.from('service_categories').update(updates).eq('id', id);
    if (e) throw e;
    await fetchServices();
  };

  const deleteCategory = async (id: string) => {
    const { error: e } = await supabase.from('service_categories').delete().eq('id', id);
    if (e) throw e;
    await fetchServices();
  };

  // --- VARIANTS CRUD ---
  const createVariant = async (category_id: string, name: string, base_price: number) => {
    const catVariants = data.variants.filter(v => v.category_id === category_id);
    const currentMax = catVariants.length > 0 ? Math.max(...catVariants.map(v => v.display_order)) : 0;
    
    const { error: e } = await supabase.from('service_variants').insert({
      category_id,
      name,
      base_price,
      display_order: currentMax + 1
    });
    if (e) throw e;
    await fetchServices();
  };

  const updateVariant = async (id: string, updates: Partial<Omit<ServiceVariant, 'id' | 'category_id' | 'created_at'>>) => {
    const { error: e } = await supabase.from('service_variants').update(updates).eq('id', id);
    if (e) throw e;
    await fetchServices();
  };

  const deleteVariant = async (id: string) => {
    const { error: e } = await supabase.from('service_variants').delete().eq('id', id);
    if (e) throw e;
    await fetchServices();
  };

  // --- MODIFIERS CRUD ---
  const createModifier = async (category_id: string, name: string, price_delta: number, modifier_type: 'checkbox' | 'quantity') => {
    const catMods = data.modifiers.filter(m => m.category_id === category_id);
    const currentMax = catMods.length > 0 ? Math.max(...catMods.map(m => m.display_order)) : 0;

    const { error: e } = await supabase.from('service_modifiers').insert({
      category_id,
      name,
      price_delta,
      modifier_type,
      display_order: currentMax + 1
    });
    if (e) throw e;
    await fetchServices();
  };

  const updateModifier = async (id: string, updates: Partial<Omit<ServiceModifier, 'id' | 'category_id' | 'created_at'>>) => {
    const { error: e } = await supabase.from('service_modifiers').update(updates).eq('id', id);
    if (e) throw e;
    await fetchServices();
  };

  const deleteModifier = async (id: string) => {
    const { error: e } = await supabase.from('service_modifiers').delete().eq('id', id);
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
    toggleModifierActive,
    createCategory,
    updateCategory,
    deleteCategory,
    createVariant,
    updateVariant,
    deleteVariant,
    createModifier,
    updateModifier,
    deleteModifier
  };
}
