'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type TourStep = {
  id: string;
  targetSelector: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click_target' | 'next'; // If 'click_target', it waits for the user to click the element. If 'next', it shows a next button.
  tip?: string; // Optional upsell/suggestion shown below the main content
};

const TOUR_COMPLETED_KEY = 'zen-tour-completed';

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-1',
    targetSelector: '[data-tour="agendar-btn"]',
    title: '¡Comencemos!',
    content: 'Toca aquí para ir a nuestra agenda. ¡Es muy rápido!',
    position: 'top',
    action: 'click_target',
  },
  {
    id: 'step-2',
    targetSelector: '[data-tour="service-menu"]',
    title: 'Elige tu Experiencia',
    content: 'Tómate tu tiempo. Puedes explorar y seleccionar más de un ritual. Cuando termines, presiona Siguiente aquí abajo.',
    position: 'top',
    action: 'next',
    tip: '💡 Tip: combina Manicura Gel + Diseño artístico para un acabado único.',
  },
  {
    id: 'step-3',
    targetSelector: '[data-tour="next-step-btn"]',
    title: 'Continuar',
    content: 'Ahora presiona Elegir Fecha para ir al calendario.',
    position: 'top',
    action: 'click_target',
  },
  {
    id: 'step-4',
    targetSelector: '[data-tour="calendar-slots"]',
    title: 'Elige tu Horario',
    content: 'Toca sobre un horario disponible para apartarlo. ¡Sin prisas!',
    position: 'top',
    action: 'click_target',
  },
  {
    id: 'step-5',
    targetSelector: '[data-tour="completar-datos-btn"]',
    title: 'Completar Datos',
    content: 'Ya aseguraste el horario. Ahora toca aquí para ir al último paso.',
    position: 'top',
    action: 'click_target',
  },
  {
    id: 'step-6',
    targetSelector: '[data-tour="confirm-btn"]',
    title: 'Confirmar Cita',
    content: 'Llena tus datos y presiona Continuar a Pago para guardar tu lugar.',
    position: 'top',
    action: 'click_target',
  },
];

interface ZenAssistantContextType {
  isActive: boolean;
  currentStepIndex: number;
  steps: TourStep[];
  startTour: () => void;
  nextStep: () => void;
  closeTour: () => void;
  currentStep: TourStep | null;
  hasCompletedTour: boolean;
  resetTour: () => void;
}

const ZenAssistantContext = createContext<ZenAssistantContextType | undefined>(undefined);

export function ZenAssistantProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Read persisted state from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const completed = localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
      setHasCompletedTour(completed);
    } catch {
      // localStorage unavailable (private mode, etc.) — default to false
    } finally {
      setHydrated(true);
    }
  }, []);

  const startTour = () => {
    setCurrentStepIndex(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsActive(false);
      // Mark as completed only when the user finishes the final step
      try {
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
      } catch {
        // ignore
      }
      setHasCompletedTour(true);
    }
  };

  const closeTour = () => {
    setIsActive(false);
    // Closing early also counts as "completed" so we don't pester the user
    try {
      localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
    } catch {
      // ignore
    }
    setHasCompletedTour(true);
  };

  const resetTour = () => {
    try {
      localStorage.removeItem(TOUR_COMPLETED_KEY);
    } catch {
      // ignore
    }
    setHasCompletedTour(false);
  };

  // Wait for the modal or element to appear if it's a click_target
  useEffect(() => {
    if (!isActive) return;

    const step = TOUR_STEPS[currentStepIndex];
    if (step.action === 'click_target') {
      const handleGlobalClick = (e: MouseEvent) => {
        const target = document.querySelector(step.targetSelector);
        if (target && target.contains(e.target as Node)) {
          // They clicked the target! Move to next step after a short delay
          setTimeout(() => {
            nextStep();
          }, 400);
        }
      };

      document.addEventListener('click', handleGlobalClick, { capture: true });
      return () => document.removeEventListener('click', handleGlobalClick, { capture: true });
    }
  }, [isActive, currentStepIndex]);

  const value = {
    isActive,
    currentStepIndex,
    steps: TOUR_STEPS,
    startTour,
    nextStep,
    closeTour,
    currentStep: isActive ? TOUR_STEPS[currentStepIndex] : null,
    hasCompletedTour: hydrated ? hasCompletedTour : false,
    resetTour,
  };

  return (
    <ZenAssistantContext.Provider value={value}>
      {children}
    </ZenAssistantContext.Provider>
  );
}

export function useZenAssistant() {
  const context = useContext(ZenAssistantContext);
  if (!context) {
    throw new Error('useZenAssistant must be used within a ZenAssistantProvider');
  }
  return context;
}
