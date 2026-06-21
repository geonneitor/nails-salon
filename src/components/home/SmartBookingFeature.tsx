import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Smartphone, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useZenAssistant } from '@/context/ZenAssistantContext';
import { useEffect, useState } from 'react';

export default function SmartBookingFeature() {
  const { startTour } = useZenAssistant();
  
  // 3D Tilt Effect Setup
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Use spring for smoother return to center
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section data-tour="smart-booking" className="py-32 md:py-48 relative overflow-hidden bg-background z-10">
      {/* Abstract Background Lighting */}
      <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[1000px] h-[600px] md:h-[1000px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-20 items-center relative z-10">
        
        {/* Lado Izquierdo: Textos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary mb-6 block">Tecnología</span>
          <h2 className="font-serif text-5xl md:text-7xl text-on-surface mb-8 leading-[1.1]">
            Tu Agenda <br/> <span className="text-primary italic">Inteligente.</span>
          </h2>
          <p className="text-xl md:text-2xl text-on-surface-variant font-light mb-16 max-w-md leading-relaxed">
            Una experiencia de reserva diseñada para fluir como el agua. Sin fricciones, sin esperas por WhatsApp.
          </p>

          <div className="flex flex-col gap-10 mb-16">
            <div className="flex gap-6 items-start">
              <div className="w-14 h-14 rounded-full bg-surface-container-low border border-outline-variant/30 flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-serif text-3xl text-on-surface mb-2">Disponibilidad Inmediata</h4>
                <p className="text-on-surface-variant font-light text-lg">Accede a nuestros horarios libres en tiempo real y asegura tu espacio con total transparencia.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="w-14 h-14 rounded-full bg-surface-container-low border border-outline-variant/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-serif text-3xl text-on-surface mb-2">Lotito, tu Asistente</h4>
                <p className="text-on-surface-variant font-light text-lg">Un compañero digital que te guía paso a paso para que tu proceso sea perfecto.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={startTour}
            className="group flex items-center gap-6 text-sm font-bold uppercase tracking-widest text-on-surface hover:text-primary transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-[0_10px_30px_rgba(74,93,35,0.4)] group-hover:scale-110 transition-transform duration-500">
              <ArrowRight className="w-6 h-6" />
            </div>
            Probar Asistente
          </button>
        </motion.div>

        {/* Lado Derecho: 3D Glass Widget */}
        <div 
          className="flex items-center justify-center h-[600px] md:h-[700px] perspective-1000 relative"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ perspective: "1500px" }}
        >
          <motion.div
            style={{ 
              rotateX, 
              rotateY,
              transformStyle: "preserve-3d"
            }}
            className="relative w-full max-w-sm h-[500px] md:h-[600px]"
          >
            {/* Tarjeta Principal de Cristal (Glassmorphism UI) */}
            <div className="absolute inset-0 rounded-[3rem] bg-surface-container-lowest/40 backdrop-blur-3xl border border-white/20 shadow-[0_40px_80px_rgba(0,0,0,0.1)] flex flex-col p-8 overflow-hidden z-10">
               {/* Shine Effect */}
               <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>

               {/* UI Mockup Header */}
               <div className="flex justify-between items-center mb-12 relative z-10">
                  <div className="font-serif text-3xl text-on-surface">Agendar</div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-surface-variant/50"></div>
                    <div className="w-3 h-3 rounded-full bg-primary/50"></div>
                  </div>
               </div>

               {/* UI Mockup Content */}
               <div className="space-y-6 relative z-10">
                 {/* Skeleton Item */}
                 <div className="w-full h-20 rounded-2xl bg-background/50 border border-white/30 flex items-center px-5 gap-5 shadow-sm">
                   <div className="w-10 h-10 rounded-full bg-surface-variant/50"></div>
                   <div className="flex-1">
                     <div className="w-24 h-3 rounded-full bg-surface-variant/70 mb-2"></div>
                     <div className="w-16 h-2 rounded-full bg-surface-variant/40"></div>
                   </div>
                 </div>
                 
                 {/* Active Skeleton Item */}
                 <div className="w-full h-20 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center px-5 gap-5 shadow-md relative overflow-hidden">
                   <motion.div 
                     className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                     animate={{ x: ['-100%', '200%'] }}
                     transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                   />
                   <div className="w-10 h-10 rounded-full bg-primary/50"></div>
                   <div className="flex-1">
                     <div className="w-32 h-3 rounded-full bg-primary/70 mb-2"></div>
                     <div className="w-20 h-2 rounded-full bg-primary/40"></div>
                   </div>
                   <CheckCircle2 className="w-5 h-5 text-primary" />
                 </div>

                 {/* Skeleton Item */}
                 <div className="w-full h-20 rounded-2xl bg-background/50 border border-white/30 flex items-center px-5 gap-5 shadow-sm">
                   <div className="w-10 h-10 rounded-full bg-surface-variant/50"></div>
                   <div className="flex-1">
                     <div className="w-20 h-3 rounded-full bg-surface-variant/70 mb-2"></div>
                     <div className="w-12 h-2 rounded-full bg-surface-variant/40"></div>
                   </div>
                 </div>
               </div>

               {/* UI Mockup Bottom Button */}
               <div className="w-full h-16 rounded-[1.5rem] bg-primary flex items-center justify-center shadow-[0_10px_25px_rgba(74,93,35,0.3)] mt-auto relative z-10">
                 <div className="w-12 h-2 rounded-full bg-on-primary/50"></div>
               </div>
            </div>

            {/* Elemento 3D Flotante: Lotito Badge */}
            <motion.div 
              style={{ translateZ: "100px" }}
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -left-12 md:-left-20 top-24 bg-surface-container-lowest/80 backdrop-blur-xl rounded-3xl p-5 shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-white/30 flex items-center gap-5 z-20"
            >
              <span className="text-5xl drop-shadow-md">🪷</span>
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Lotito</span>
                <span className="block text-lg text-on-surface font-serif">¡Te ayudo!</span>
              </div>
            </motion.div>

            {/* Elemento 3D Flotante: Confirmación */}
            <motion.div 
              style={{ translateZ: "150px" }}
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute -right-8 md:-right-16 bottom-32 bg-primary/90 backdrop-blur-xl rounded-3xl p-6 shadow-[0_20px_50px_rgba(74,93,35,0.3)] border border-white/20 flex flex-col items-center justify-center w-32 h-32 z-30"
            >
              <div className="w-12 h-12 rounded-full bg-on-primary flex items-center justify-center mb-3 shadow-inner">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <span className="text-[10px] font-bold text-on-primary uppercase tracking-[0.2em]">Confirmado</span>
            </motion.div>

          </motion.div>
        </div>

      </div>
    </section>
  );
}
