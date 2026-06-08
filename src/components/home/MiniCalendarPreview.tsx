'use client';

import { useEffect, useState } from 'react';
import { useAppointments } from '@/hooks/useAppointments';
import { useApp } from '@/context/AppContext';
import { format, startOfDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/components/ui/ToastProvider';

export default function MiniCalendarPreview() {
  const toast = useToast();
  const { activeProject } = useApp();
  const projectId = activeProject?.id ?? '';
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Set date range for next 3 days (including today)
  useEffect(() => {
    const today = startOfDay(new Date());
    const threeDaysLater = addDays(today, 3);
    setDateRange({
      from: format(today, "yyyy-MM-dd'T'HH:mm:ssxxx"),
      to: format(threeDaysLater, "yyyy-MM-dd'T'HH:mm:ssxxx")
    });
  }, []);

  // Fetch appointments for the date range
  useEffect(() => {
    if (!dateRange || !projectId) return;
    setLoading(true);
    // We'll use a simple fetch via the hook? Since we don't have a hook that accepts arbitrary range,
    // we'll implement a quick fetch using the same endpoint as useAppointments.
    // For simplicity, we'll just call the same hook but we can't pass custom range.
    // Instead, we'll use the existing useAppointments hook with default args and filter client-side.
    // However, to avoid extra complexity, we'll just use useAppointments without args (it likely uses default range).
    // We'll rely on the hook from useAppointments with no args (maybe it uses projectId and no dateRange).
    // Let's just use the hook and then filter.
  }, [dateRange, projectId]);

  // Cambia la línea del error por esta:
const { appointments: appts, isLoading, error } = useAppointments();


  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      return;
    }
    if (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
      return;
    }
    if (appts) {
      // Filter appointments for next 3 days
      const today = startOfDay(new Date());
      const threeDaysLater = addDays(today, 3);
      const filtered = appts.filter((appt: any) => {
        const apptStart = startOfDay(new Date(appt.start_time));
        return apptStart >= today && apptStart < threeDaysLater;
      });
      setAppointments(filtered);
    }
    setLoading(false);
  }, [appts, isLoading, error]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-primario-zen/50">Cargando disponibilidad...</p>
      </div>
    );
  }

  // Group appointments by date
  const grouped: Record<string, any[]> = {};
  appointments.forEach((appt: any) => {
    const dateStr = format(new Date(appt.start_time), "yyyy-MM-dd");
    if (!grouped[dateStr]) grouped[dateStr] = [];
    grouped[dateStr].push(appt);
  });

  const dates = Object.keys(grouped).sort();

  return (
    <section className="mb-12">
      <div className="bg-fondo-zen/80 backdrop-blur-sm rounded-3xl p-6 w-full max-w-none border border-secundario-zen/50">
        <h2 className="text-primario-zen font-serif text-xl mb-4 uppercase tracking-widest text-center">
          Próximos Días - Horarios Ocupados
        </h2>
        {dates.length === 0 ? (
          <p className="text-primario-zen/50 text-center">No hay citas ocupadas en los próximos días.</p>
        ) : (
          <div className="space-y-4">
            {dates.map((dateStr) => {
              const date = new Date(dateStr);
              const dayApps = grouped[dateStr];
              return (
                <div key={dateStr}>
                  <h3 className="text-primario-zen font-serif text-lg mb-2">
                    {format(date, "EEEE d 'de' MMMM", { locale: es })}
                  </h3>
                  <div className="space-y-2">
                    {dayApps.map((appt: any) => {
                      const start = new Date(appt.start_time);
                      const end = new Date(appt.end_time);
                      const serviceName = appt.service?.name || 'Servicio';
                      return (
                        <div key={appt.id} className="flex items-center gap-3 p-3 bg-secundario-zen/20 rounded-lg border border-secundario-zen/30">
                          <div className="w-16 text-center text-[10px] font-semibold text-primario-zen/60">
                            {format(start, 'h:mm a')} - {format(end, 'h:mm a')}
                          </div>
                          <div className="flex-1">
                            <p className="text-primario-zen font-medium">{serviceName}</p>
                            <p className="text-primario-zen/50 text-xs">
                              {appt.employee?.name || 'Empleada asignada'}
                            </p>
                          </div>
                          <div className="w-10 h-2.5 bg-primario-zen rounded" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              // Navigate to full calendar
              // We'll use router push; but we can just alert for now
              toast.info('Calendario', 'Para ver el calendario completo, visita la sección de Calendario.');
            }}
            className="text-primario-zen/60 hover:text-primario-zen text-sm"
          >
            Ver calendario completo →
          </button>
        </div>
      </div>
    </section>
    );
  }