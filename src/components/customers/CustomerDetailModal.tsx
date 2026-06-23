'use client';
// ============================================================
// src/components/customers/CustomerDetailModal.tsx
// Modal de detalle de clienta (CRM).
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, Calendar, ClipboardList, Camera, Plus, Loader2, Image as ImageIcon } from 'lucide-react';
import type { Customer, CustomerGallery, AppointmentWithRelations } from '@/types/supabase';
import { format } from 'date-fns';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useCustomers } from '@/hooks/useCustomers';
import { supabase } from '@/lib/supabaseClient';

interface CustomerDetailModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
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

export function CustomerDetailModal({ customer, isOpen, onClose, onEdit, onDelete }: CustomerDetailModalProps) {
  const confirm = useConfirm();
  const { fetchGallery, uploadPhoto } = useCustomers();
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'receipts'>('info');

  const [gallery, setGallery] = useState<CustomerGallery[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (isOpen && customer && activeTab === 'receipts') {
      fetchGallery(customer.id).then(setGallery);
    }
    if (isOpen && customer && activeTab === 'history') {
      setLoadingHistory(true);
      supabase.from('appointments')
        .select('*, customer:customers(id, name, phone, service_notes), employee:employees(id, name)')
        .eq('customer_id', customer.id)
        .order('start_time', { ascending: false })
        .then(({ data }) => {
          if (data) setAppointments(data as any[]);
          setLoadingHistory(false);
        });
    }
  }, [isOpen, customer, activeTab, fetchGallery]);

  if (!customer) return null;

  const handleDelete = async () => {
    const ok = await confirm({
      title: '¿Eliminar clienta?',
      message: `Se eliminará a "${customer.name}" y todos sus datos. Esta acción no se puede deshacer.`,
      confirmLabel: 'Sí, eliminar',
      danger: true,
    });
    if (!ok) return;
    onDelete?.();
    onClose();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const newPhoto = await uploadPhoto(customer.id, file);
    if (newPhoto) {
      setGallery(prev => [newPhoto, ...prev]);
    }
    setIsUploading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center md:items-center">
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-primario-zen/20 backdrop-blur-sm"
          />
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="relative w-full md:max-w-2xl bg-surface-container-lowest rounded-t-3xl md:rounded-3xl shadow-2xl border border-secundario-zen/50 p-8 max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-start mb-6 shrink-0">
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

            <div className="flex border-b border-secundario-zen/40 mb-5 shrink-0">
              {(['info', 'history', 'receipts'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 pb-3 text-[10px] uppercase tracking-widest font-semibold transition-all ${
                    activeTab === tab
                      ? 'text-primario-zen border-b-2 border-primario-zen'
                      : 'text-primario-zen/40 hover:text-primario-zen/70'
                  }`}
                >
                  {tab === 'info' ? 'Ficha Clínica' : tab === 'history' ? 'Historial' : 'Comprobantes'}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-5 min-h-[300px]">
              {activeTab === 'info' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-4 bg-secundario-zen/10 p-4 rounded-2xl">
                    {customer.phone && <DetailRow icon={<Phone className="w-4 h-4" />} label="Teléfono" value={customer.phone} />}
                    {customer.email && <DetailRow icon={<Mail className="w-4 h-4" />} label="Correo" value={customer.email} />}
                    {customer.birthday && <DetailRow icon={<Calendar className="w-4 h-4" />} label="Cumpleaños" value={format(new Date(customer.birthday), 'd MMMM yyyy')} />}
                    <DetailRow icon={<User className="w-4 h-4" />} label="Cliente desde" value={format(new Date(customer.created_at), 'MMM yyyy')} />
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-primario-zen/60 border-b border-secundario-zen/40 pb-2">Datos Clínicos</h3>
                    <DetailRow icon={<ClipboardList className="w-4 h-4" />} label="Alergias o Sensibilidades" value={customer.allergies || 'Sin registros de alergias.'} />
                    <DetailRow icon={<ClipboardList className="w-4 h-4" />} label="Fórmulas de Color" value={customer.color_formulas || 'Sin fórmulas registradas.'} />
                    {customer.service_notes && <DetailRow icon={<ClipboardList className="w-4 h-4" />} label="Notas Generales" value={customer.service_notes} />}
                  </div>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                  {loadingHistory ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primario-zen/50" /></div>
                  ) : appointments.length === 0 ? (
                    <p className="text-center text-sm text-primario-zen/50 py-10">No hay citas registradas.</p>
                  ) : (
                    appointments.map(app => (
                      <div key={app.id} className="bg-white/60 border border-secundario-zen/50 rounded-2xl p-4 shadow-sm flex justify-between items-center">
                        <div>
                          <p className="text-xs font-semibold uppercase text-primario-zen/60 mb-1">{format(new Date(app.start_time), 'dd MMM yyyy - h:mm a')}</p>
                          <p className="text-sm font-medium text-primario-zen">
                            {app.ticket_details?.activeServices?.join(' + ') || 'Servicio General'}
                          </p>
                          <p className="text-[10px] text-primario-zen/40 uppercase mt-1">Especialista: {app.employee?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primario-zen">${app.total_price}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${app.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-secundario-zen/30 text-primario-zen'}`}>
                            {app.status === 'completed' ? 'Completado' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === 'receipts' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-primario-zen/60">Comprobantes de Pago</h3>
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-2 bg-primario-zen/10 text-primario-zen px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-primario-zen/20 transition-colors disabled:opacity-50"
                    >
                      {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                      Subir Comprobante
                    </button>
                  </div>
                  
                  {gallery.length === 0 && !isUploading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-primario-zen/40 border-2 border-dashed border-secundario-zen/50 rounded-2xl">
                      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">Sin comprobantes</p>
                      <p className="text-xs mt-1">Sube capturas de transferencias o recibos.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {isUploading && (
                        <div className="aspect-square bg-secundario-zen/20 rounded-2xl flex items-center justify-center animate-pulse">
                          <Loader2 className="w-6 h-6 animate-spin text-primario-zen/50" />
                        </div>
                      )}
                      {gallery.map(img => (
                        <div key={img.id} className="aspect-square rounded-2xl overflow-hidden bg-secundario-zen/10 relative group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.image_url} alt="Gallery" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-secundario-zen/40 shrink-0">
              <button
                onClick={() => {
                  onEdit?.();
                  onClose();
                }}
                className="flex-1 bg-primario-zen text-fondo-zen py-3 rounded-2xl uppercase tracking-widest text-xs font-semibold hover:bg-opacity-90 transition-all shadow-sm"
              >
                Editar Ficha
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-3 rounded-2xl border border-outline-variant text-on-surface-variant uppercase tracking-widest text-xs font-semibold hover:bg-error/10 hover:text-error hover:border-error/30 transition-all"
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
