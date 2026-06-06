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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden rounded-3xl border border-secundario-zen/50 bg-fondo-zen/80 backdrop-blur-sm transition-all duration-500 hover:border-accent-gold/40 ${className}`}
    >
      {/* Dynamic Gold Spotlight Effect */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle 150px at ${mousePos.x}px ${mousePos.y}px, rgba(212, 175, 55, 0.15), transparent)`,
        }}
      />

      {/* Interactive Glow Layer */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 opacity-0 hover:opacity-100"
        style={{
          background: `radial-gradient(circle 200px at ${mousePos.x}px ${mousePos.y}px, rgba(212, 175, 55, 0.08), transparent)`,
        }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
