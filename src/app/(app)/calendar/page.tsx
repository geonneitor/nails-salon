import { CalendarView } from '@/components/calendar/CalendarView';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function CalendarPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center py-10 px-6 w-full">
        <div className="w-full max-w-none">
          <h1 className="text-primario-zen font-serif text-3xl mb-8 uppercase tracking-widest border-b border-secundario-zen/50 pb-4">
            Calendario de Citas
          </h1>
          <CalendarView />
        </div>
      </div>
    </DashboardLayout>
  );
}
