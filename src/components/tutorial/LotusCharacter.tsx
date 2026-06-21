import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function LotusCharacter({ className = "", isHappy = false }: { className?: string, isHappy?: boolean }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [sparkles, setSparkles] = useState<{id: number, x: number, y: number}[]>([]);

  const handleTap = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    
    // Generar partículas mágicas
    const newSparkles = Array.from({length: 4}).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 80 - 40,
      y: Math.random() * 80 - 40
    }));
    setSparkles(newSparkles);
    
    // Detener giro
    setTimeout(() => {
      setIsSpinning(false);
    }, 800);

    // Limpiar partículas un poco después
    setTimeout(() => {
      setSparkles([]);
    }, 1500);
  };

  return (
    <motion.div 
      className={`relative flex items-center justify-center cursor-pointer ${className}`}
      animate={isSpinning ? { rotate: 360, scale: 1.15, y: -10 } : { y: [0, -6, 0], rotate: 0, scale: 1 }}
      transition={isSpinning ? { duration: 0.6, type: 'spring' } : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      onClick={handleTap}
      title="¡Hazme cosquillas!"
    >
      <AnimatePresence>
        {sparkles.map(s => (
          <motion.div
            key={s.id}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
            animate={{ opacity: 0, scale: 1.5, x: s.x, y: s.y }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute text-yellow-300 pointer-events-none z-50 text-xl"
          >
            ✨
          </motion.div>
        ))}
      </AnimatePresence>

      <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
        <defs>
          <filter id="lotusGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g filter="url(#lotusGlow)">
          {/* Resplandor trasero */}
          <circle cx="50" cy="50" r="35" fill="#bef264" opacity="0.15" />

          {/* Hojas Base */}
          <path d="M50 85 C30 85, 10 70, 10 50 C30 65, 45 75, 50 85 Z" fill="#65a30d" opacity="0.8" />
          <path d="M50 85 C70 85, 90 70, 90 50 C70 65, 55 75, 50 85 Z" fill="#65a30d" opacity="0.8" />
          
          {/* Pétalos Laterales Inferiores */}
          <path d="M50 80 C20 70, 5 45, 15 25 C25 45, 40 60, 50 80 Z" fill="#84cc16" />
          <path d="M50 80 C80 70, 95 45, 85 25 C75 45, 60 60, 50 80 Z" fill="#84cc16" />
          
          {/* Pétalos Centrales */}
          <path d="M50 80 C30 60, 20 30, 35 15 C40 35, 45 55, 50 80 Z" fill="#a3e635" />
          <path d="M50 80 C70 60, 80 30, 65 15 C60 35, 55 55, 50 80 Z" fill="#a3e635" />
          
          {/* Pétalo Principal (Centro) donde irá la carita */}
          <path d="M50 80 C40 50, 35 20, 50 5 C65 20, 60 50, 50 80 Z" fill="#d9f99d" />

          {/* Carita (Ojos y Boca) en el pétalo principal */}
          <g transform="translate(42, 45)">
            {/* Ojo Izquierdo */}
            <motion.ellipse 
              cx="2" 
              cy="0" 
              rx="2.5" 
              ry="3" 
              fill="#166534" 
              animate={{ scaleY: [1, 0.1, 1, 1, 1, 1, 1, 1, 1, 1] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Ojo Derecho */}
            <motion.ellipse 
              cx="14" 
              cy="0" 
              rx="2.5" 
              ry="3" 
              fill="#166534" 
              animate={{ scaleY: [1, 0.1, 1, 1, 1, 1, 1, 1, 1, 1] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Sonrisa Dinámica */}
            {isSpinning || isHappy ? (
              <path d="M 1 5 Q 8 13 15 5" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            ) : (
              <path d="M 3 6 Q 8 10 13 6" stroke="#166534" strokeWidth="2" strokeLinecap="round" fill="none" />
            )}
            
            {/* Chapitas (Blush) */}
            <motion.ellipse 
              cx="-1" cy="4" rx="2.5" ry="1.5" fill="#fca5a5" 
              initial={{ opacity: 0.6, scale: 1 }}
              animate={isSpinning ? { opacity: 0.9, scale: 1.5 } : { opacity: 0.6, scale: 1 }}
            />
            <motion.ellipse 
              cx="17" cy="4" rx="2.5" ry="1.5" fill="#fca5a5" 
              initial={{ opacity: 0.6, scale: 1 }}
              animate={isSpinning ? { opacity: 0.9, scale: 1.5 } : { opacity: 0.6, scale: 1 }}
            />
          </g>
        </g>
      </svg>
    </motion.div>
  );
}
