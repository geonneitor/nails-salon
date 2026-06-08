'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookingFlow } from '@/hooks/useBookingFlow';
import { useToast } from '@/components/ui/ToastProvider';
import ServiceStep from './steps/ServiceStep';
import TimeStep from './steps/TimeStep';
import UserStep from './steps/UserStep';
import ConfirmStep from './steps/ConfirmStep';

export type BookingStep = 'SERVICES' | 'TIME' | 'USER' | 'CONFIRM';

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

const cubicBezier = "cubic-bezier(0.4, 0, 0.2, 1)";
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

  const next = () => {
    const stepOrder: BookingStep[] = ['SERVICES', 'TIME', 'USER', 'CONFIRM'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const prev = () => {
    const stepOrder: BookingStep[] = ['SERVICES', 'TIME', 'USER', 'CONFIRM'];
    const currentIndex = stepOrder.indexOf(currentStep);
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
      toast.success('Solicitud Recibida', '¡Tu solicitud ha sido recibida! Pronto recibirás el link de pago.');
    } catch (e: any) {
      setSubmitError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto min-h-[600px] flex flex-col items-center">
      {/* Progress Indicator - Sophisticated Dot Line */}
      <div className="flex items-center justify-center gap-4 mb-12 relative">
        <div className="absolute h-px bg-primario-zen/20 w-full top-1/2 -z-10" />
        {(['SERVICES', 'TIME', 'USER', 'CONFIRM'] as BookingStep[]).map((step, idx) => (
          <div
            key={step}
            className={`w-2 h-2 rounded-full transition-all duration-700 ${
              currentStep === step ? 'bg-primario-zen scale-150 shadow-[0_0_8px_var(--accent-gold)]' : 'bg-primario-zen/30'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="w-full"
        >
          {currentStep === 'SERVICES' && <ServiceStep data={formData} onSelect={(ticketDetails: any) => { updateData({ ticketDetails }); next(); }} />}
          {currentStep === 'TIME' && <TimeStep data={formData} onSelect={(date, slot) => { updateData({ date, timeSlot: slot }); next(); }} onBack={prev} />}
          {currentStep === 'USER' && <UserStep data={formData} onSelect={(name, contact) => { updateData({ name, contact }); next(); }} onBack={prev} />}
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