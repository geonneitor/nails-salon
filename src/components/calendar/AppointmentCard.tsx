import type { AppointmentStatus } from '@/types/supabase';
import type { AppointmentWithRelations } from '@/types/supabase';
import { format } from 'date-fns';

interface AppointmentCardProps {
  /** Cita base o simulada para la UI. */
  appointment: Partial<AppointmentWithRelations> & {
    id: string;
    start_time: string;
    status: AppointmentStatus;
    customer: { name: string };
  };
  onClick?: () => void;
}

// Paleta cerrada: solo tonos del Brand Board Zen.
const STATUS_INDICATOR: Record<AppointmentStatus, string> = {
  confirmed_advance: 'bg-primario-zen', // Olivo sólido = confirmado con anticipo
  pending_advance: 'bg-secundario-zen border border-primario-zen/40', // Beige-arena con borde = pendiente
  completed: 'bg-slate-200 border border-slate-300', // Gris neutro = finalizado
  free: 'bg-transparent border border-dashed border-primario-zen/60', // Borde punteado = gratis
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  confirmed_advance: 'Confirmado',
  pending_advance: 'Pendiente',
  completed: 'Finalizado',
  free: 'Gratis',
};

export function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  const timeFormatted = format(new Date(appointment.start_time), 'h:mm a');
  const dateFormatted = format(new Date(appointment.start_time), 'MMM d');
  const dotClass = STATUS_INDICATOR[appointment.status];
  const statusLabel = STATUS_LABEL[appointment.status];

  // Obtener nombre del servicio o resumen del ticket
  let serviceName = appointment.service?.name;
  if (!serviceName && appointment.ticket_details?.activeServices) {
    serviceName = appointment.ticket_details.activeServices
      .map((s) => {
        if (s === 'fullset') return 'Full Set';
        if (s === 'disenos') return 'Diseños';
        if (s === 'deco') return 'Deco';
        if (s === 'repo') return 'Repo';
        if (s === 'gel') return 'Gel Protec';
        if (s === 'mani') return 'Manicura';
        if (s === 'pedi') return 'Pedicura';
        return s;
      })
      .join(' + ');
  }
  if (!serviceName) serviceName = 'Servicio Personalizado';

  const price = appointment.total_price ?? appointment.service?.price ?? 0;

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col gap-3 rounded-2xl bg-fondo-zen p-5 cursor-pointer transition-all duration-300 shadow-sm border border-secundario-zen/60 hover:border-primario-zen/30"
    >
      {/* Encabezado: ZEN logo + Status */}
      <div className="flex justify-between items-start">
        <span className="font-serif text-primario-zen tracking-widest text-lg">ZEN</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-primario-zen/60 font-semibold">
            {statusLabel}
          </span>
          <span className={`w-2 h-2 rounded-full ${dotClass}`}></span>
        </div>
      </div>

      {/* Cuerpo: Servicio, Fecha, Cliente y Hora */}
      <div className="flex flex-col gap-1">
        <p className="text-primario-zen font-serif text-lg">
          {serviceName} - {dateFormatted}
        </p>
        <div className="flex justify-between items-end">
          <p className="text-primario-zen/70 text-sm">
            {appointment.customer?.name} - {timeFormatted}
          </p>
          {appointment.created_at && (
            <p className="text-[9px] text-primario-zen/40 font-sans italic">
              Creada: {format(new Date(appointment.created_at), 'd MMM, h:mm a')}
            </p>
          )}
        </div>
        <p className="font-semibold text-primario-zen mt-1.5 text-xs">
          ${price} MXN · {appointment.total_duration ?? appointment.service?.duration_minutes ?? 0} min
        </p>
      </div>

      {/* Footer / Acción */}
      <div className="mt-2">
        <button className="bg-primario-zen text-fondo-zen px-5 py-2 rounded-full uppercase tracking-widest text-[10px] font-semibold hover:bg-opacity-90 transition-all">
          Ver Detalle
        </button>
      </div>
    </div>
  );
}
