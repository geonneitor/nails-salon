import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { TimeBlock, TimeBlockWithEmployee } from '@/types/supabase';

interface UseTimeBlocksOptions {
  /**
   * ID del proyecto del que se quieren obtener bloqueos.
   * Este prop tiene PRIORIDAD. Sin él, el hook retorna lista vacía.
   */
  projectId: string | null;
  /**
   * Filtra bloqueos que INTERSECTAN este rango.
   */
  dateRange?: { from: string; to: string };
}

interface UseTimeBlocksReturn {
  timeBlocks: TimeBlockWithEmployee[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook que carga los bloqueos de horario (`time_blocks`) del proyecto activo,
 * con suscripción Realtime. Mismo contrato explícito que `useAppointments`.
 */
export function useTimeBlocks({
  projectId,
  dateRange,
}: UseTimeBlocksOptions = { projectId: null }): UseTimeBlocksReturn {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlockWithEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildQuery = useCallback(() => {
    if (!projectId) return null;

    let query = supabase
      .from('time_blocks')
      .select(`
        *,
        employee:employees ( id, name )
      `)
      .eq('project_id', projectId)
      .order('start_time', { ascending: true });

    if (dateRange) {
      query = query
        .lte('start_time', dateRange.to)
        .gte('end_time', dateRange.from);
    }

    return query;
  }, [dateRange, projectId]);

  const fetchTimeBlocks = useCallback(async () => {
    if (!projectId) {
      setTimeBlocks([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const query = buildQuery();
    if (!query) {
      setError('No hay un proyecto activo seleccionado.');
      setIsLoading(false);
      return;
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setTimeBlocks((data as TimeBlockWithEmployee[]) ?? []);
    }

    setIsLoading(false);
  }, [buildQuery, projectId]);

  useEffect(() => {
    fetchTimeBlocks();

    if (!projectId) return;

    const channel = supabase
      .channel(`time_blocks:project:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_blocks',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          fetchTimeBlocks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTimeBlocks, projectId]);

  return {
    timeBlocks,
    isLoading,
    error,
    refetch: fetchTimeBlocks,
  };
}
