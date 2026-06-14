import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function EmptyDay() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
    >
      <div className="bg-surface-container-lowest/80 backdrop-blur-md border border-secundario-zen/40 p-8 rounded-[2rem] text-center flex flex-col items-center shadow-soft-shadow pointer-events-auto max-w-[280px]">
        <div className="w-16 h-16 rounded-full bg-gold-primary/10 flex items-center justify-center mb-6">
          <Sparkles className="w-8 h-8 text-gold-dark" strokeWidth={1.5} />
        </div>
        <h3 className="font-serif text-2xl text-primario-zen mb-3">Día Libre</h3>
        <p className="text-sm text-primario-zen/60 font-medium leading-relaxed">
          Ninguna cita programada aún. Tómate un respiro o revisa tu inventario.
        </p>
      </div>
    </motion.div>
  );
}
