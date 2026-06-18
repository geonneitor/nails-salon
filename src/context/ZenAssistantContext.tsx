'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type TourStep = {
  id: string;
  targetSelector: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click_target' | 'next'; // If 'click_target', it waits for the user to click the element. If 'next', it shows a next button.
};

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
    content: 'Navega por nuestro menú y selecciona el servicio que deseas.',
    position: 'top',
    action: 'click_target',
  },
  {
    id: 'step-3',
    targetSelector: '[data-tour="next-step-btn"]',
    title: 'Continuar',
    content: 'Una vez que hayas seleccionado tu ritual, presiona Elegir Fecha.',
    position: 'top',
    action: 'click_target',
  },
  {
    id: 'step-4',
    targetSelector: '[data-tour="calendar-slots"]',
    title: 'Elige tu Horario',
    content: 'Toca sobre un horario disponible para agendar en ese espacio.',
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
    action: 'next',
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
}

const ZenAssistantContext = createContext<ZenAssistantContextType | undefined>(undefined);

export function ZenAssistantProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const startTour = () => {
    setCurrentStepIndex(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsActive(false);
    }
  };

  const closeTour = () => {
    setIsActive(false);
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
