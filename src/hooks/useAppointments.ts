import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
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
 * Dos rangos se intersectan si: newStart < existEnd && newEnd > existStart.
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
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Construye el query base con sus JOINs y filtro de intersección de rango.
   * Sin proyectoId, retorna null y el caller debe manejar el estado vacío.
   */
  const buildQuery = useCallback(() => {
    if (!projectId) return null;

    let query = supabase
      .from('appointments')
      .select(`
        *,
        customer:customers ( id, name, phone ),
        employee:employees ( id, name ),
        service:services ( id, name, duration_minutes, price )
      `)
      .eq('project_id', projectId)
      .order('start_time', { ascending: true });

    if (dateRange) {
      // Intersección: trae citas cuyo rango [start, end] solapa con [from, to].
      // Lógica: cita.inicio <= rango.fin  AND  cita.fin >= rango.inicio
      query = query
        .lte('start_time', dateRange.to)
        .gte('end_time', dateRange.from);
    }

    return query;
  }, [dateRange, projectId]);

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

    const channel = supabase
      .channel(`appointments:project:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAppointments, projectId]);

  // ----- Mutaciones -----

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

      if (hasScheduleCollision(appointments, payload)) {
        setError(`El empleado ya tiene una cita en el rango seleccionado.`);
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
    [appointments, projectId]
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
