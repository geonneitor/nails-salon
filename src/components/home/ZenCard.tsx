'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ZenCardProps {
  children: ReactNode;
  className?: string;
}

export default function ZenCard({ children, className = '' }: ZenCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -3, scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-3xl border border-secundario-zen/50 bg-fondo-zen/80 backdrop-blur-sm transition-colors duration-500 hover:border-accent-gold/35 ${className}`}
    >
      {/* Dynamic spotlight */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle 180px at ${mousePos.x}px ${mousePos.y}px, rgba(212, 175, 55, 0.13), transparent)`,
        }}
      />

      {/* Edge glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 z-0 rounded-3xl transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          boxShadow: '0 0 0 1px rgba(212,175,55,0.2) inset',
        }}
      />

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
