import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface BusinessSettingsRecord {
  id: string;
  project_id: string;
  max_employees: number;
  opening_hour: string;
  closing_hour: string;
  working_days: number[];
  salon_name: string | null;
  salon_phone: string | null;
  salon_whatsapp: string | null;
  salon_address: string | null;
  salon_logo_url: string | null;
  advance_grace_period_hours: number;
  cancel_grace_period_hours: number;
  bank_details: string | null;
}

export function useBusinessSettings(projectId?: string | null) {
  const [settings, setSettings] = useState<BusinessSettingsRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      if (!projectId) {
        setSettings(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from('business_settings')
          .select('*')
          .eq('project_id', projectId)
          .maybeSingle();

        if (err && err.code !== 'PGRST116') throw err;
        setSettings(data as BusinessSettingsRecord | null);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [projectId]);

  return { settings, loading, error, setSettings };
}
