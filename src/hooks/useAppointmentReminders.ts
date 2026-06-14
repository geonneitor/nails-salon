'use client';

// ============================================================
// useAppointmentReminders.ts
// Hook que trae los reminders asociados a una cita.
// Se subscribe a postgres_changes para que el badge aparezca
// en tiempo real cuando el cron los marque como 'sent'.
// ============================================================

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface AppointmentReminder {
  id: string;
  appointment_id: string;
  send_at: string;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  channel: string;
  message_template: string | null;
  recipient_phone: string | null;
  sent_at: string | null;
}

interface UseAppointmentRemindersOptions {
  appointmentId: string;
  projectId: string | null;
}

export function useAppointmentReminders({
  appointmentId,
  projectId,
}: UseAppointmentRemindersOptions) {
  const [reminders, setReminders] = useState<AppointmentReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setReminders([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from('appointment_reminders')
        .select(
          'id, appointment_id, send_at, status, channel, message_template, recipient_phone, sent_at'
        )
        .eq('appointment_id', appointmentId)
        .in('status', ['pending', 'sent'])
        .order('send_at', { ascending: true });
      if (!cancelled) {
        setReminders((data as AppointmentReminder[]) ?? []);
        setIsLoading(false);
      }
      if (error) console.warn('[reminders] load error:', error.message);
    }
    load();

    const channel = supabase
      .channel(`reminders-${appointmentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointment_reminders',
          filter: `appointment_id=eq.${appointmentId}`,
        },
        () => load()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [appointmentId, projectId]);

  return { reminders, isLoading };
}
