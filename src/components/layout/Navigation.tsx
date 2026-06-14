'use client';

import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navigation() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Si ya estamos en la página de reserva, ocultamos el botón flotante para no estorbar
  if (pathname === '/reserva') return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0, x: '-50%' }}
        animate={{ y: 0, opacity: 1, x: '-50%' }}
        exit={{ y: 100, opacity: 0, x: '-50%' }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="fixed bottom-8 left-1/2 z-50 w-full max-w-[280px]"
      >
        <button 
          onClick={() => router.push('/reserva')}
          className="w-full relative group overflow-hidden bg-primary hover:bg-primary/90 text-on-primary shadow-[0_8px_30px_rgba(212,175,55,0.3)] hover:shadow-[0_12px_40px_rgba(212,175,55,0.4)] rounded-full px-8 py-4 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3"
        >
          {/* Brillo animado pasando de fondo */}
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-current/10 to-transparent" />
          
          <Calendar className="w-5 h-5" />
          <span className="font-semibold text-sm uppercase tracking-widest">Reserva tu Cita</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
