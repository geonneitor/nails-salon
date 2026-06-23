import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { bellEvents } from '@/lib/notifications/bellEvents';
import type {
  Appointment,
  AppointmentWithRelations,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
} from '@/types/supabase';

interface UseAppointmentsOptions {
  /**
   * ID del proyecto del que se quieren obtener citas.
   * Este prop tiene PRIORIDAD sobre cualquier `activeProject` del contexto.
   * Si se omite, el hook no realizará queries (retorna lista vacía).
   */
  projectId: string | null;
  /**
   * Filtra citas que INTERSECTAN este rango (no solo las que inician dentro).
   * Esto garantiza que citas que cruzan límites de día/semana aparezcan en
   * ambas vistas (ej. viernes 23:00 → sábado 01:00).
   */
  dateRange?: { from: string; to: string };
  /**
   * Filtra citas para un cliente específico.
   */
  customerId?: string | null;
}

interface UseAppointmentsReturn {
  appointments: AppointmentWithRelations[];
  isLoading: boolean;
  error: string | null;
  createAppointment: (payload: CreateAppointmentPayload) => Promise<Appointment | null>;
  updateAppointment: (id: string, payload: UpdateAppointmentPayload) => Promise<boolean>;
  checkEmployeeAvailability: (employeeId: string, start: Date, end: Date) => Promise<{ available: boolean; reason?: string }>;
  deleteAppointment: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useAppointments({
  projectId,
  dateRange,
  customerId,
}: UseAppointmentsOptions = { projectId: null }): UseAppointmentsReturn {
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Construye el query base con sus JOINs y filtro de intersección de rango.
   * Dependemos de los valores primitivos de dateRange para evitar bucles infinitos
   * si el objeto dateRange se recrea en el componente padre.
   */
  const buildQuery = useCallback(() => {
    if (!projectId) return null;

    let query = supabase
      .from('appointments')
      .select(`
        *,
        customer:customers ( id, name, phone ),
        employee:employees ( id, name )
      `)
      .eq('project_id', projectId)
      .order('start_time', { ascending: true });

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    if (dateRange?.from && dateRange?.to) {
      // Intersección: trae citas cuyo rango [start, end] solapa con [from, to].
      // Lógica: cita.inicio <= rango.fin  AND  cita.fin >= rango.inicio
      query = query
        .lte('start_time', dateRange.to)
        .gte('end_time', dateRange.from);
    }

    return query;
  }, [dateRange?.from, dateRange?.to, projectId, customerId]);

  const fetchAppointments = useCallback(async () => {
    if (!projectId) {
      setAppointments([]);
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
      setAppointments((data as AppointmentWithRelations[]) ?? []);
    }

    setIsLoading(false);
  }, [buildQuery, projectId]);

  // ----- Suscripción Realtime -----
  useEffect(() => {
    fetchAppointments();

    if (!projectId) return;

    const channelId = `appointments_${projectId}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          fetchAppointments();

          // Emitir evento de nueva cita SOLO en INSERT (no en UPDATE/DELETE).
          if (payload.eventType === 'INSERT' && payload.new) {
            const newRow = payload.new as Partial<AppointmentWithRelations> & {
              customer?: { name?: string };
            };
            bellEvents.emit({
              type: 'new_appointment',
              payload: {
                title: 'Nueva cita agendada',
                appointmentId: newRow.id,
                customerName:
                  (newRow.customer as any)?.name ??
                  (newRow as any).customer_name ??
                  undefined,
                url: '/calendar',
              },
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAppointments, projectId]);

  // ----- Mutaciones -----

  const checkEmployeeAvailability = useCallback(
    async (employeeId: string, start: Date, end: Date): Promise<{ available: boolean; reason?: string }> => {
      const startTime = start.toISOString();
      const endTime = end.toISOString();

      // 1. Check for overlapping appointments
      const { data: overlappingAppts, error: apptError } = await supabase
        .from('appointments')
        .select('id')
        .eq('employee_id', employeeId)
        .lt('start_time', endTime)
        .gt('end_time', startTime)
        .limit(1);

      if (apptError) return { available: false, reason: apptError.message };
      if (overlappingAppts && overlappingAppts.length > 0) {
        return { available: false, reason: 'La empleada ya tiene una cita agendada.' };
      }

      // 2. Check for overlapping time blocks
      const { data: overlappingBlocks, error: blockError } = await supabase
        .from('time_blocks')
        .select('id')
        .eq('employee_id', employeeId)
        .lt('start_time', endTime)
        .gt('end_time', startTime)
        .limit(1);

      if (blockError) return { available: false, reason: blockError.message };
      if (overlappingBlocks && overlappingBlocks.length > 0) {
        return { available: false, reason: 'La empleada tiene un bloqueo de horario.' };
      }

      return { available: true };
    },
    [projectId]
  );

  const createAppointment = useCallback(
    async (payload: CreateAppointmentPayload): Promise<Appointment | null> => {
      if (!projectId) {
        setError('No hay un proyecto activo seleccionado.');
        return null;
      }
      if (new Date(payload.start_time) >= new Date(payload.end_time)) {
        setError('El horario de inicio debe ser anterior al horario de fin.');
        return null;
      }

      // 1. Verificar traslape de citas en Supabase (toda la BD)
      const { data: overlappingAppts, error: apptError } = await supabase
        .from('appointments')
        .select('id')
        .eq('employee_id', payload.employee_id)
        .lt('start_time', payload.end_time)
        .gt('end_time', payload.start_time)
        .limit(1);

      if (apptError) {
        setError(apptError.message);
        return null;
      }

      if (overlappingAppts && overlappingAppts.length > 0) {
        setError('La empleada ya tiene una cita agendada en ese horario.');
        return null;
      }

      // 2. Verificar traslape de bloqueos de tiempo en Supabase (toda la BD)
      const { data: overlappingBlocks, error: blockError } = await supabase
        .from('time_blocks')
        .select('id')
        .eq('employee_id', payload.employee_id)
        .lt('start_time', payload.end_time)
        .gt('end_time', payload.start_time)
        .limit(1);

      if (blockError) {
        setError(blockError.message);
        return null;
      }

      if (overlappingBlocks && overlappingBlocks.length > 0) {
        setError('La empleada tiene un bloqueo de horario en ese rango.');
        return null;
      }

      const { data, error: insertError } = await supabase
        .from('appointments')
        .insert({ ...payload, project_id: projectId })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      return data as Appointment;
    },
    [projectId]
  );

  const updateAppointment = useCallback(
    async (id: string, payload: UpdateAppointmentPayload): Promise<boolean> => {
      if (!projectId) {
        setError('No hay un proyecto activo seleccionado.');
        return false;
      }
      const { error: updateError } = await supabase
        .from('appointments')
        .update(payload)
        .eq('id', id)
        .eq('project_id', projectId);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      return true;
    },
    [projectId]
  );

  const deleteAppointment = useCallback(
    async (id: string): Promise<boolean> => {
      if (!projectId) {
        setError('No hay un proyecto activo seleccionado.');
        return false;
      }
      const { error: deleteError } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)
        .eq('project_id', projectId);

      if (deleteError) {
        setError(deleteError.message);
        return false;
      }

      return true;
    },
    [projectId]
  );

  return {
    appointments,
    isLoading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    checkEmployeeAvailability,
    refetch: fetchAppointments,
  };
}
