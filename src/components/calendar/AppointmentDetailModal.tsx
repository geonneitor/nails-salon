'use client';

// ============================================================
// src/components/calendar/AppointmentDetailModal.tsx
// Modal de detalle de cita. Diseño Zen premium con glassmorphism.
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, User, Scissors, CreditCard, CheckCircle2, AlertCircle, Edit3, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AppointmentWithRelations, AppointmentStatus } from '@/types/supabase';
import { useAppointments } from '@/hooks/useAppointments';
import { useEmployees } from '@/hooks/useEmployees';

interface AppointmentDetailModalProps {
  appointment: AppointmentWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, status: AppointmentStatus) => void;
}

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; bg: string }> = {
  confirmed_advance: {
    label: 'Confirmado',
    color: 'text-primario-zen',
    bg: 'bg-primario-zen/10 border-primario-zen/30',
  },
  pending_advance: {
    label: 'Pendiente de Anticipo',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
  },
  completed: {
    label: 'Finalizado',
    color: 'text-slate-500',
    bg: 'bg-slate-100 border-slate-200',
  },
  free: {
    label: 'Sin anticipo',
    color: 'text-primario-zen/60',
    bg: 'bg-secundario-zen/30 border-secundario-zen',
  },
};

function DetailRow({
  icon,
  label,
  value,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 text-primario-zen/50">{icon}</div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-primario-zen/40 font-semibold mb-0.5">
            {label}
          </p>
          <p className="text-primario-zen text-sm font-medium">{value}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

export function AppointmentDetailModal({
  appointment,
  isOpen,
  onClose,
  onStatusChange,
}: AppointmentDetailModalProps) {
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);
  const { updateAppointment, error: updateError } = useAppointments();
  const { employees, isLoading: employeesLoading } = useEmployees();

  // Importante: El modal debe manejar el estado de apertura independientemente
  // de si el objeto appointment ha llegado ya o no para evitar saltos visuales.
  if (!isOpen) return null;
  if (!appointment) {
    return (
      <div className="fixed inset-0 z-[100] flex items-end justify-center md:items-center">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-primario-zen/20 backdrop-blur-sm"
        />
        <div className="relative w-full md:max-w-md bg-[#FDFBEE] rounded-t-3xl md:rounded-3xl p-8 shadow-2xl border border-secundario-zen/50">
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 text-primario-zen animate-spin" />
            <p className="text-primario-zen/60 text-sm font-medium">Cargando detalles...</p>
          </div>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.pending_advance;
  const startDate = new Date(appointment.start_time);
  const endDate = new Date(appointment.end_time);
  const duration = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

  // ... resto del código se mantiene igual ...


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

  const handleEmployeeChange = async (employeeId: string) => {
    const success = await updateAppointment(appointment.id, { employee_id: employeeId });
    if (success) {
      setIsEditingEmployee(false);
      onClose(); // Close to force refetch in parent
    }
  };

  const handleSendWhatsApp = () => {
    if (!appointment.customer.phone) {
      alert('El cliente no tiene un teléfono registrado.');
      return;
    }

    const phone = appointment.customer.phone.replace(/\D/g, '');
    const dateStr = format(startDate, "EEEE d 'de' MMMM", { locale: es });
    const timeStr = format(startDate, 'h:mm a');

    const message = `Hola ${appointment.customer.name}! ✨ Te recordamos tu cita en Zen Nail Salon el día ${dateStr} a las ${timeStr}. ¡Te esperamos! 💅`;
    const encodedMessage = encodeURIComponent(message);

    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  const renderTicketDetailsBreakdown = () => {
    const details = appointment.ticket_details;
    if (!details || !details.activeServices) return null;

    const lines: string[] = [];
    if (details.activeServices.includes('fullset') && details.fs_sistema) {
      lines.push(`Full Set: ${details.fs_sistema}, ${details.fs_forma || ''}, Largo ${details.fs_largo || ''} (Extra tonos: ${details.fs_tonos || 0})`);
    }
    if (details.activeServices.includes('disenos') && details.dis) {
      Object.entries(details.dis).forEach(([key, val]) => {
        if (val > 0) lines.push(`${key} ×${val} uñas`);
      });
      if (details.dis_tonos && details.dis_tonos > 0) lines.push(`Tonos extra diseños: ${details.dis_tonos}`);
    }
    if (details.activeServices.includes('deco') && details.deco) {
      Object.entries(details.deco).forEach(([key, val]) => {
        if (val > 0) lines.push(`${key} ×${val} uñas`);
      });
      if (details.deco_tonos && details.deco_tonos > 0) lines.push(`Tonos extra deco: ${details.deco_tonos}`);
    }
    if (details.activeServices.includes('repo') && details.repo) {
      Object.entries(details.repo).forEach(([key, val]) => {
        if (val > 0) lines.push(`Repo: ${key} ×${val}`);
      });
      if (details.repo_tonos && details.repo_tonos > 0) lines.push(`Tonos extra repo: ${details.repo_tonos}`);
    }
    if (details.activeServices.includes('gel') && details.gel) {
      lines.push(`Gel: ${details.gel} (Extra tonos: ${details.gel_tonos || 0})`);
    }
    if (details.activeServices.includes('mani') && details.mani) {
      lines.push(`Manicura: ${details.mani} (Extra tonos: ${details.mani_tonos || 0})`);
    }
    if (details.activeServices.includes('pedi') && details.pedi) {
      lines.push(`Pedicura: ${details.pedi} (Extra tonos: ${details.pedi_tonos || 0})`);
    }

    if (lines.length === 0) return null;

    return (
      <div className="mt-4 p-4 rounded-2xl bg-secundario-zen/20 border border-secundario-zen/50 text-xs text-primario-zen flex flex-col gap-1 font-sans">
        <p className="font-bold border-b border-secundario-zen/30 pb-1.5 mb-1.5 uppercase tracking-wider text-[10px] text-primario-zen/50">Desglose de Cotización</p>
        {lines.map((line, idx) => (
          <p key={idx} className="leading-tight">• {line}</p>
        ))}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center md:items-center">
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-primario-zen/20 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="relative w-full md:max-w-md bg-[#FDFBEE] rounded-t-3xl md:rounded-3xl shadow-2xl border border-secundario-zen/50 p-8 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primario-zen/40 font-semibold mb-1 font-sans">
                  {format(startDate, "EEEE, d 'de' MMMM yyyy", { locale: es })}
                </p>
                <h2 className="font-serif text-primario-zen text-2xl tracking-wide leading-tight">
                  {serviceName}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar detalle"
                className="p-2 rounded-full text-primario-zen/40 hover:text-primario-zen hover:bg-secundario-zen/40 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider mb-6 font-sans ${status.bg} ${status.color}`}>
              {appointment.status === 'confirmed_advance' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5" />
              )}
              {status.label}
            </div>

            {/* Details Grid */}
            <div className="flex flex-col gap-5 font-sans">
              <DetailRow
                icon={<User className="w-4 h-4" />}
                label="Cliente"
                value={appointment.customer.name}
              />
              {appointment.customer.phone && (
                <DetailRow
                  icon={<span className="text-xs font-bold">📞</span>}
                  label="Teléfono"
                  value={appointment.customer.phone}
                />
              )}
              <DetailRow
                icon={<Scissors className="w-4 h-4" />}
                label="Servicio"
                value={serviceName}
              />
              <DetailRow
                icon={<Clock className="w-4 h-4" />}
                label="Horario"
                value={`${format(startDate, 'h:mm a')} – ${format(endDate, 'h:mm a')} (${duration} min)`}
              />
              {!isEditingEmployee ? (
                <DetailRow
                  icon={<User className="w-4 h-4" />}
                  label="Empleado"
                  value={appointment.employee.name}
                  action={
                    <button
                      onClick={() => setIsEditingEmployee(true)}
                      className="p-1.5 rounded-full text-primario-zen/40 hover:text-primario-zen hover:bg-secundario-zen/40 transition-all"
                      title="Cambiar empleado"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  }
                />
              ) : (
                <div className="flex flex-col gap-2 p-3 rounded-2xl bg-secundario-zen/30 border border-secundario-zen/50">
                  <p className="text-[10px] uppercase tracking-widest text-primario-zen/50 font-bold mb-1">Cambiar Empleada</p>
                  <div className="flex flex-col gap-1">
                    {employeesLoading ? (
                      <p className="text-xs italic text-primario-zen/60">Cargando empleadas...</p>
                    ) : (
                      employees.map(emp => (
                        <button
                          key={emp.id}
                          onClick={() => handleEmployeeChange(emp.id)}
                          className={`text-left px-3 py-2 rounded-lg text-xs transition-all ${
                            emp.id === appointment.employee_id
                            ? 'bg-primario-zen text-fondo-zen font-bold'
                            : 'hover:bg-secundario-zen/50 text-primario-zen'
                          }`}
                        >
                          {emp.name}
                        </button>
                      ))
                    )}
                  </div>
                  <button
                    onClick={() => setIsEditingEmployee(false)}
                    className="mt-2 text-center text-[10px] uppercase tracking-widest text-primario-zen/40 hover:text-primario-zen transition-colors font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              <DetailRow
                icon={<CreditCard className="w-4 h-4" />}
                label="Total"
                value={`$${price} MXN`}
              />
            </div>

            {/* Render ticket breakdown if exists */}
            {renderTicketDetailsBreakdown()}

            {/* Error de actualización */}
            {updateError && (
              <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-sans mt-4">
                {updateError}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={handleSendWhatsApp}
                className="w-full bg-white text-primario-zen border border-primario-zen/30 py-3 rounded-full uppercase tracking-widest text-xs font-semibold hover:bg-primario-zen/5 transition-all shadow-sm flex items-center justify-center gap-2 font-sans"
              >
                Recordatorio WhatsApp
              </button>
              {onStatusChange && appointment.status !== 'confirmed_advance' && (
                <button
                  id={`confirm-appointment-${appointment.id}`}
                  onClick={() => onStatusChange(appointment.id, 'confirmed_advance')}
                  className="w-full bg-primario-zen text-fondo-zen py-3.5 rounded-full uppercase tracking-widest text-xs font-semibold hover:bg-opacity-90 transition-all shadow-sm font-sans"
                >
                  Confirmar Anticipo
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
