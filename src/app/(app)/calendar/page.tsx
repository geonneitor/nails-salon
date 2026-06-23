import { CalendarView } from '@/components/calendar/CalendarView';

export default function CalendarPage() {
  return (
    <div className="flex flex-col py-2 px-2 md:py-4 md:px-4 w-full flex-1 min-h-0">
      <div className="w-full max-w-none flex flex-col flex-1 min-h-0">
        <div className="flex-1 min-h-0">
          <CalendarView />
        </div>
      </div>
    </div>
  );
}

