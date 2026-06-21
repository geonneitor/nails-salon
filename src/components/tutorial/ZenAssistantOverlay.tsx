'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useZenAssistant } from '@/context/ZenAssistantContext';
import { X, Sparkles } from 'lucide-react';
import { LotusCharacter } from '@/components/tutorial/LotusCharacter';

export function ZenAssistantOverlay() {
  const { isActive, message, closeTour } = useZenAssistant();
  const [targetPos, setTargetPos] = useState<{ top: number; left: number; right: number; bottom: number } | null>(null);
  const [displayedContent, setDisplayedContent] = useState("");
  const audioPlayedRef = useRef(false);

  // Typewriter effect
  useEffect(() => {
    if (!message?.content) {
      setDisplayedContent("");
      return;
    }
    
    setDisplayedContent("");
    let i = 0;
    
    const interval = setInterval(() => {
      i += 2; // Speed up by typing 2 chars at a time
      setDisplayedContent(message.content.substring(0, i));
      if (i >= message.content.length) {
        clearInterval(interval);
      }
    }, 25);
    
    return () => clearInterval(interval);
  }, [message?.content]);

  // Zen Sound effect on first active
  useEffect(() => {
    if (isActive && message && !audioPlayedRef.current) {
      audioPlayedRef.current = true;
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        // Bell sound profile
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 1.5);
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.05); // Soft attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.0); // Long decay
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 2.0);
      } catch (e) {
        // Browser might block audio if no prior interaction
      }
    } else if (!isActive) {
      audioPlayedRef.current = false;
    }
  }, [isActive, message]);

  useEffect(() => {
    if (!isActive || !message?.targetSelector) {
      setTargetPos(null);
      return;
    }

    const updatePos = () => {
      const el = document.querySelector(message.targetSelector!);
      if (el) {
        setTargetPos(el.getBoundingClientRect());
      } else {
        setTargetPos(null);
      }
    };

    updatePos();
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    
    const observer = new MutationObserver(updatePos);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
      observer.disconnect();
    };
  }, [isActive, message?.targetSelector]);

  // If the assistant is not active or there's no message, we don't render it
  if (!isActive || !message) return null;

  let positionStyles: React.CSSProperties = {
    bottom: '1.5rem',
    right: '1.5rem',
  };

  if (targetPos) {
    const actualOverlayWidth = Math.min(352, window.innerWidth - 48); // max-w-[22rem] o 100vw-3rem
    const overlayHeight = 220; // height buffer
    const spaceRight = window.innerWidth - targetPos.right;
    const spaceLeft = targetPos.left;
    const spaceTop = targetPos.top;
    
    // En móviles casi nunca hay espacio a los lados, así que caerá en los else if (arriba o abajo)
    if (spaceRight > actualOverlayWidth + 20) {
      positionStyles = {
        top: Math.min(Math.max(20, targetPos.top - 20), window.innerHeight - overlayHeight - 20),
        left: targetPos.right + 20,
      };
    } else if (spaceLeft > actualOverlayWidth + 20) {
      positionStyles = {
        top: Math.min(Math.max(20, targetPos.top - 20), window.innerHeight - overlayHeight - 20),
        right: window.innerWidth - targetPos.left + 20,
      };
    } else if (spaceTop > overlayHeight + 20) {
      // Posición arriba (Mobile friendly)
      let calcBottom = window.innerHeight - targetPos.top + 20;
      if (calcBottom > window.innerHeight - overlayHeight - 20) {
        calcBottom = window.innerHeight - overlayHeight - 20;
      }
      positionStyles = {
        bottom: calcBottom,
        // Math.max(32, ...) garantiza que la cabeza de Lotito (-left-6) no se corte en el borde izquierdo de la pantalla
        left: Math.min(Math.max(32, targetPos.left + (targetPos.right - targetPos.left)/2 - actualOverlayWidth/2), window.innerWidth - actualOverlayWidth - 20),
      };
    } else {
      // Posición abajo (Mobile friendly)
      let calcTop = targetPos.bottom + 20;
      if (calcTop > window.innerHeight - overlayHeight - 20) {
        calcTop = window.innerHeight - overlayHeight - 20;
      }
      positionStyles = {
        top: calcTop,
        left: Math.min(Math.max(32, targetPos.left + (targetPos.right - targetPos.left)/2 - actualOverlayWidth/2), window.innerWidth - actualOverlayWidth - 20),
      };
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          layout
          drag
          dragMomentum={false}
          key={message.title + message.content}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 250, damping: 25 }}
          style={{ position: 'absolute', ...positionStyles }}
          className="pointer-events-auto w-[min(22rem,calc(100vw-3rem))] origin-center"
        >
          {/* Personaje Lotito asomándose sutilmente */}
          <div className="absolute -top-12 -left-6 shrink-0 scale-[1.3] origin-bottom-left z-20 drop-shadow-xl">
            <LotusCharacter isHappy={message.isHappy} />
          </div>

          {/* Contenedor principal estilo Glassmorphism */}
          <div className="relative backdrop-blur-3xl bg-surface-container-lowest/90 border border-primary/20 dark:border-primary/10 p-5 rounded-3xl shadow-2xl overflow-hidden mt-8">
            
            {/* Ambient glow inside the glass box */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            
            <button
              onClick={closeTour}
              className="absolute top-3 right-3 text-on-surface-variant hover:text-on-surface transition-colors bg-surface-variant/30 hover:bg-surface-variant/50 p-1.5 rounded-full z-10"
              aria-label="Cerrar asistente"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex gap-4 mb-2 items-center relative pt-1">
              <h4 className="font-serif font-bold text-lg text-primary dark:text-primary-container leading-tight ml-12 drop-shadow-sm flex items-center gap-2">
                {message.title}
              </h4>
            </div>
            
            <p className="text-[14px] text-on-surface-variant font-medium leading-relaxed mb-4 ml-1 min-h-[42px]">
              {displayedContent}
              {displayedContent.length < message.content.length && (
                <motion.span 
                  animate={{ opacity: [1, 0] }} 
                  transition={{ repeat: Infinity, duration: 0.6 }}
                  className="inline-block w-1.5 h-3.5 bg-primary ml-1 align-middle"
                />
              )}
            </p>
            
            {message.tip && displayedContent.length === message.content.length && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-primary-dark dark:text-primary-light italic font-semibold px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 shadow-inner flex gap-2 items-start mb-4"
              >
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{message.tip}</span>
              </motion.div>
            )}

            {/* Opciones (Botones de acción) */}
            {message.options && message.options.length > 0 && displayedContent.length === message.content.length && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 mt-2"
              >
                {message.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={opt.onClick}
                    className={`text-sm font-semibold rounded-xl py-2.5 px-4 transition-all duration-200 w-full text-center ${
                      opt.primary 
                        ? 'bg-primary text-on-primary hover:bg-primary/90 shadow-sm hover:shadow-md hover:-translate-y-0.5' 
                        : 'bg-surface-variant/30 text-primary border border-primary/20 hover:bg-primary/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}

            {message.actionRequired && !message.options && (
              <div className="mt-4 flex justify-end">
                <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
