'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookingFlow } from '@/hooks/useBookingFlow';
import { useToast } from '@/components/ui/ToastProvider';
import ServiceStep from './steps/ServiceStep';
import TimeStep from './steps/TimeStep';
import UserStep from './steps/UserStep';
import ConfirmStep from './steps/ConfirmStep';
import { Sparkles, Clock, User, CheckCircle } from 'lucide-react';

export type BookingStep = 'SERVICES' | 'TIME' | 'USER' | 'CONFIRM';

const STEPS: { id: BookingStep; label: string; icon: typeof Sparkles }[] = [
  { id: 'SERVICES', label: 'Servicio',  icon: Sparkles },
  { id: 'TIME',     label: 'Fecha',     icon: Clock },
  { id: 'USER',     label: 'Datos',     icon: User },
  { id: 'CONFIRM',  label: 'Confirma',  icon: CheckCircle },
];

interface JourneyState {
  ticketDetails: {
    activeServices: string[];
    totalPrice: number;
    totalDuration: number;
  } | null;
  date: Date;
  timeSlot: { label: string; h: number; m: number };
  name: string;
  contact: string;
}

export default function ZenBookingJourney() {
  const toast = useToast();
  const { submitBooking } = useBookingFlow();
  const [currentStep, setCurrentStep] = useState<BookingStep>('SERVICES');
  const [formData, setFormData] = useState<JourneyState>({
    ticketDetails: null,
    date: new Date(),
    timeSlot: { label: '10:00 a.m.', h: 10, m: 0 },
    name: '',
    contact: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const stepOrder: BookingStep[] = ['SERVICES', 'TIME', 'USER', 'CONFIRM'];
  const currentIndex = stepOrder.indexOf(currentStep);

  const next = () => {
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const updateData = (data: Partial<JourneyState>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await submitBooking(formData);
      setIsSuccess(true);
      toast.success('Solicitud recibida', '¡Te contactaremos para confirmar tu cita!');
    } catch (e: any) {
      setSubmitError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Pantalla de éxito ───────────────────────────────────────
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto"
      >
        <div className="w-20 h-20 rounded-full bg-primario-zen/10 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-primario-zen" strokeWidth={1.5} />
        </div>
        <h2 className="font-serif text-3xl text-primario-zen mb-3">¡Solicitud enviada!</h2>
        <p className="text-primario-zen/60 font-sans text-sm leading-relaxed mb-8">
          Recibimos tu solicitud. En breve te enviaremos el enlace de pago del anticipo para confirmar tu lugar.
        </p>
        <a
          href="/"
          className="px-8 py-3 rounded-full bg-primario-zen text-fondo-zen font-sans text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-all"
        >
          Volver al inicio
        </a>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* ── Stepper visual ─────────────────────────────────── */}
      <div className="flex items-start justify-center gap-0 mb-12 px-4">
        {STEPS.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isDone = stepOrder.indexOf(step.id) < currentIndex;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-2 min-w-[56px]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                    isDone
                      ? 'bg-primario-zen border-primario-zen'
                      : isActive
                      ? 'bg-fondo-zen border-primario-zen shadow-[0_0_0_4px_rgba(52,70,35,0.12)]'
                      : 'bg-fondo-zen border-secundario-zen/40'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isDone ? 'text-fondo-zen' : isActive ? 'text-primario-zen' : 'text-primario-zen/30'
                    }`}
                    strokeWidth={2}
                  />
                </div>
                <span
                  className={`text-[10px] uppercase tracking-widest font-semibold transition-colors ${
                    isActive ? 'text-primario-zen' : isDone ? 'text-primario-zen/60' : 'text-primario-zen/30'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Conector animado */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 mt-5 mx-1">
                  <div className="h-px bg-secundario-zen/40 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-primario-zen"
                      initial={{ width: '0%' }}
                      animate={{ width: isDone ? '100%' : '0%' }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Contenido del paso activo ───────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -16, filter: 'blur(8px)' }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="w-full"
        >
          {currentStep === 'SERVICES' && (
            <ServiceStep
              data={formData}
              onSelect={(ticketDetails: any) => {
                updateData({ ticketDetails });
                next();
              }}
            />
          )}
          {currentStep === 'TIME' && (
            <TimeStep
              data={formData}
              onSelect={(date, slot) => {
                updateData({ date, timeSlot: slot });
                next();
              }}
              onBack={prev}
            />
          )}
          {currentStep === 'USER' && (
            <UserStep
              data={formData}
              onSelect={(name, contact) => {
                updateData({ name, contact });
                next();
              }}
              onBack={prev}
            />
          )}
          {currentStep === 'CONFIRM' && (
            <ConfirmStep
              data={formData}
              onConfirm={handleConfirm}
              onBack={prev}
              isSubmitting={isSubmitting}
              error={submitError}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
