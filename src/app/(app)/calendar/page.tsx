import { CalendarView } from '@/components/calendar/CalendarView';

export default function CalendarPage() {
  return (
    <div className="flex flex-col py-10 px-6 w-full h-[calc(100vh-5rem)]">
      <div className="w-full max-w-none flex flex-col h-full">
        <h1 className="text-primario-zen font-serif text-3xl mb-8 uppercase tracking-widest border-b border-secundario-zen/50 pb-4 shrink-0">
          Calendario de Citas
        </h1>
        <div className="flex-1 min-h-0">
          <CalendarView />
        </div>
      </div>
    </div>
  );
}

