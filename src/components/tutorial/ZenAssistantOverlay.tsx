'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useZenAssistant } from '@/context/ZenAssistantContext';
import { X, ChevronRight } from 'lucide-react';
import { LotusCharacter } from '@/components/tutorial/LotusCharacter';

export function ZenAssistantOverlay() {
  const { isActive, currentStep, currentStepIndex, steps, closeTour, nextStep } = useZenAssistant();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isActive || !currentStep) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.querySelector(currentStep.targetSelector);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        // Element not found (maybe it's inside a modal that's animating in)
        // We'll retry a few times
        setTimeout(() => {
          const retryEl = document.querySelector(currentStep.targetSelector);
          if (retryEl) setTargetRect(retryEl.getBoundingClientRect());
        }, 300);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true); // true to capture scroll in any container

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [isActive, currentStep]);

  if (!isActive || !currentStep) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex">
      {/* 
        We use a highly elevated overlay but we don't want to block clicks to the target.
        So this main container is pointer-events-none.
        The cutout uses box-shadow on a div exactly over the target.
      */}
      <AnimatePresence>
        {targetRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute rounded-xl pointer-events-none transition-all duration-300 ease-out"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
            }}
          >
            {/* The pulsing ring around the target */}
            <div className="absolute inset-0 border-2 border-primary rounded-xl animate-ping opacity-50" />
            <div className="absolute inset-0 border-2 border-primary rounded-xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Tooltip Box */}
      <AnimatePresence>
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bg-surface-container-lowest border border-primary/30 p-5 rounded-2xl shadow-2xl max-w-xs pointer-events-auto"
            style={{
              // Position it below or above depending on the space
              ...(currentStep.position === 'top' 
                  ? { bottom: window.innerHeight - targetRect.top + 20 } 
                  : { top: targetRect.bottom + 20 }),
              // Center horizontally relative to target, bounded by screen width
              left: Math.max(16, Math.min(window.innerWidth - 320 - 16, targetRect.left + (targetRect.width / 2) - 160)),
            }}
          >
            <button
              onClick={closeTour}
              className="absolute top-3 right-3 text-on-surface-variant hover:text-on-surface"
              aria-label="Cerrar asistente"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex gap-3 mb-3 items-center text-primary relative pt-4">
              <div className="absolute -top-10 -left-6 shrink-0 scale-150 origin-bottom-left animate-[bounce_3s_infinite]">
                <LotusCharacter />
              </div>
              <h4 className="font-serif font-bold text-lg leading-none mt-1 ml-12">{currentStep.title}</h4>
            </div>
            <p className="text-sm text-on-surface-variant font-light mb-4">
              {currentStep.content}
            </p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] text-primary/60 font-semibold uppercase tracking-widest">
                Paso {currentStepIndex + 1} de {steps.length}
              </span>
              {currentStep.action === 'click_target' ? (
                <div className="text-[10px] text-primary font-bold uppercase tracking-widest flex items-center gap-1 animate-pulse">
                  Toca el área resaltada <ChevronRight className="w-3 h-3" />
                </div>
              ) : (
                <button
                  onClick={nextStep}
                  className="bg-primary text-on-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-opacity-90"
                >
                  Siguiente
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
