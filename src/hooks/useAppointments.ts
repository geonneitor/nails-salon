import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type {
  Appointment,
  AppointmentWithRelations,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
} from '@/types/supabase';
import { useApp } from '@/context/AppContext';

interface UseAppointmentsOptions {
  /** ID del proyecto activo (Opcional en la demo, usará el mock internamente). */
  projectId: string | null;
  /**
   * Filtra citas de un rango de fechas (ISO strings).
   * Ej: { from: '2026-06-01T00:00:00Z', to: '2026-06-07T23:59:59Z' }
   */
  dateRange?: { from: string; to: string };
}

interface UseAppointmentsReturn {
  appointments: AppointmentWithRelations[];
  isLoading: boolean;
  error: string | null;
  createAppointment: (payload: CreateAppointmentPayload) => Promise<Appointment | null>;
  updateAppointment: (id: string, payload: UpdateAppointmentPayload) => Promise<boolean>;
  refetch: () => Promise<void>;
}

// ----- Helper: detección de colisiones de horario -----

/**
 * Verifica si el slot propuesto colisiona con alguna cita existente del mismo empleado.
 */
function hasScheduleCollision(
  existing: Pick<Appointment, 'employee_id' | 'start_time' | 'end_time'>[],
  incoming: Pick<CreateAppointmentPayload, 'employee_id' | 'start_time' | 'end_time'>
): boolean {
  const newStart = new Date(incoming.start_time).getTime();
  const newEnd = new Date(incoming.end_time).getTime();

  return existing.some((appt) => {
    if (appt.employee_id !== incoming.employee_id) return false;
    const existStart = new Date(appt.start_time).getTime();
    const existEnd = new Date(appt.end_time).getTime();
    return newStart < existEnd && newEnd > existStart;
  });
}

// ----- Hook principal -----

export function useAppointments({
  projectId,
  dateRange,
}: UseAppointmentsOptions = { projectId: null }): UseAppointmentsReturn {
  const { activeProject } = useApp();
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveProjectId = activeProject?.id || projectId;

  /** Construye el query base con sus JOINs */
  const buildQuery = useCallback(() => {
    if (!effectiveProjectId) return null;

    let query = supabase
      .from('appointments')
      .select(`
        *,
        customer:customers ( id, name, phone ),
        employee:employees ( id, name ),
        service:services ( id, name, duration_minutes, price )
      `)
      .eq('project_id', effectiveProjectId)
      .order('start_time', { ascending: true });

    if (dateRange) {
      query = query
        .gte('start_time', dateRange.from)
        .lte('start_time', dateRange.to);
    }

    return query;
  }, [dateRange, effectiveProjectId]);

  const fetchAppointments = useCallback(async () => {
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
  }, [buildQuery]);

  // ----- Suscripción Realtime -----
  useEffect(() => {
    fetchAppointments();

    if (!effectiveProjectId) return;

    const channel = supabase
      .channel(`appointments:project:${effectiveProjectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `project_id=eq.${effectiveProjectId}`,
        },
        () => {
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAppointments, effectiveProjectId]);

  // ----- Mutaciones -----

  const createAppointment = useCallback(
    async (payload: CreateAppointmentPayload): Promise<Appointment | null> => {
      if (!effectiveProjectId) {
        setError('No hay un proyecto activo seleccionado.');
        return null;
      }
      if (new Date(payload.start_time) >= new Date(payload.end_time)) {
        setError('El horario de inicio debe ser anterior al horario de fin.');
        return null;
      }

      if (hasScheduleCollision(appointments, payload)) {
        setError(
          `El empleado ya tiene una cita en el rango seleccionado.`
        );
        return null;
      }

      const { data, error: insertError } = await supabase
        .from('appointments')
        .insert({ ...payload, project_id: effectiveProjectId })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      return data as Appointment;
    },
    [appointments, effectiveProjectId]
  );

  const updateAppointment = useCallback(
    async (id: string, payload: UpdateAppointmentPayload): Promise<boolean> => {
      const { error: updateError } = await supabase
        .from('appointments')
        .update(payload)
        .eq('id', id);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      return true;
    },
    []
  );

  return {
    appointments,
    isLoading,
    error,
    createAppointment,
    updateAppointment,
    refetch: fetchAppointments,
  };
}