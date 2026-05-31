'use client';
// ============================================================
// src/components/customers/CustomerDetailModal.tsx
// Modal de detalle de clienta.
// ============================================================
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, Calendar, ClipboardList } from 'lucide-react';
import type { Customer } from '@/types/supabase';
import { format } from 'date-fns';

interface CustomerDetailModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-0.5 text-primario-zen/50">{icon}</div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-primario-zen/40 font-semibold mb-0.5">
          {label}
        </p>
        <p className="text-primario-zen text-sm font-medium whitespace-pre-wrap">{value}</p>
      </div>
    </div>
  );
}

export function CustomerDetailModal({ customer, isOpen, onClose }: CustomerDetailModalProps) {
  if (!customer) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-primario-zen/20 backdrop-blur-sm z-40"
          />
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md w-full bg-[#FDFBEE] rounded-t-3xl md:rounded-3xl shadow-2xl border border-secundario-zen/50 z-50 p-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-serif text-primario-zen text-2xl tracking-wide">
                  {customer.name}
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-primario-zen/40 font-semibold mt-1">
                  {customer.visit_count} Visitas Totales
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-primario-zen/40 hover:text-primario-zen hover:bg-secundario-zen/40 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {customer.phone && (
                <DetailRow icon={<Phone className="w-4 h-4" />} label="Teléfono" value={customer.phone} />
              )}
              {customer.email && (
                <DetailRow icon={<Mail className="w-4 h-4" />} label="Correo" value={customer.email} />
              )}
              {customer.birthday && (
                <DetailRow 
                  icon={<Calendar className="w-4 h-4" />} 
                  label="Cumpleaños" 
                  value={format(new Date(customer.birthday), 'd MMMM yyyy')} 
                />
              )}
              {customer.service_notes && (
                <DetailRow icon={<ClipboardList className="w-4 h-4" />} label="Notas Médicas / Servicio" value={customer.service_notes} />
              )}
              <DetailRow icon={<User className="w-4 h-4" />} label="Cliente desde" value={format(new Date(customer.created_at), 'MMM yyyy')} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
