import React from 'react';
import { motion } from 'framer-motion';

export function LotusCharacter({ className = "" }: { className?: string }) {
  return (
    <motion.div 
      className={`relative flex items-center justify-center ${className}`}
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hojas Base */}
        <path d="M50 85 C30 85, 10 70, 10 50 C30 65, 45 75, 50 85 Z" fill="#84cc16" opacity="0.6" />
        <path d="M50 85 C70 85, 90 70, 90 50 C70 65, 55 75, 50 85 Z" fill="#84cc16" opacity="0.6" />
        
        {/* Pétalos Laterales Inferiores */}
        <path d="M50 80 C20 70, 5 45, 15 25 C25 45, 40 60, 50 80 Z" fill="#a3e635" />
        <path d="M50 80 C80 70, 95 45, 85 25 C75 45, 60 60, 50 80 Z" fill="#a3e635" />
        
        {/* Pétalos Centrales */}
        <path d="M50 80 C30 60, 20 30, 35 15 C40 35, 45 55, 50 80 Z" fill="#bef264" />
        <path d="M50 80 C70 60, 80 30, 65 15 C60 35, 55 55, 50 80 Z" fill="#bef264" />
        
        {/* Pétalo Principal (Centro) donde irá la carita */}
        <path d="M50 80 C40 50, 35 20, 50 5 C65 20, 60 50, 50 80 Z" fill="#d9f99d" />

        {/* Carita (Ojos y Boca) en el pétalo principal */}
        <g transform="translate(42, 45)">
          {/* Ojo Izquierdo */}
          <motion.ellipse 
            cx="2" 
            cy="0" 
            rx="2" 
            ry="2.5" 
            fill="#3f6212" 
            animate={{ scaleY: [1, 0.1, 1, 1, 1, 1, 1, 1, 1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Ojo Derecho */}
          <motion.ellipse 
            cx="14" 
            cy="0" 
            rx="2" 
            ry="2.5" 
            fill="#3f6212" 
            animate={{ scaleY: [1, 0.1, 1, 1, 1, 1, 1, 1, 1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Sonrisa */}
          <path d="M 4 5 Q 8 9 12 5" stroke="#3f6212" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          
          {/* Chapitas (Blush) */}
          <ellipse cx="0" cy="3" rx="2" ry="1.5" fill="#fca5a5" opacity="0.5" />
          <ellipse cx="16" cy="3" rx="2" ry="1.5" fill="#fca5a5" opacity="0.5" />
        </g>
      </svg>
    </motion.div>
  );
}
