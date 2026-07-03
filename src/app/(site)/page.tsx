'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useAnimation, useMotionValue } from 'framer-motion';
import { ChevronDown, Instagram, MessageCircle, Music2, Calendar, Sparkles, Droplets, Leaf } from 'lucide-react';
import PublicNavbar from '@/components/home/PublicNavbar';
import { useZenAssistant } from '@/context/ZenAssistantContext';
import { LotusCharacter } from '@/components/tutorial/LotusCharacter';
import ZenManifesto from '@/components/home/ZenManifesto';
import FeaturedServices from '@/components/home/FeaturedServices';
import ZenGallery from '@/components/home/ZenGallery';
import SmartBookingFeature from '@/components/home/SmartBookingFeature';

function FAQAccordion({ faq }: { faq: {q: string, a: string} }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-outline-variant/30 py-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left focus:outline-none group"
      >
        <span className="font-serif text-lg md:text-xl text-on-surface group-hover:text-primary transition-colors pr-4">{faq.q}</span>
        <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-primary border-primary text-white' : 'border-outline-variant/50 text-primary group-hover:border-primary'}`}>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 1 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pt-4 text-on-surface-variant font-light text-sm md:text-base leading-relaxed whitespace-pre-line pb-2">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  const { startTour, isActive, hasCompletedTour, setContextMessage } = useZenAssistant();
  const [pulseCta, setPulseCta] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // Lógica de arrastre magnético para Lotito
  const controls = useAnimation();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [fabPos, setFabPos] = useState({ isLeft: true, bottom: 96 }); // bottom: 96px (aprox bottom-24)

  useEffect(() => {
    controls.start({ scale: 1, opacity: 1 });
  }, [controls]);

  const handleDragEnd = (e: any, info: any) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Determinar si soltamos más cerca de la izquierda o la derecha
    const isLeft = info.point.x < windowWidth / 2;
    
    // Calcular el nuevo bottom (sin salir de los márgenes superior/inferior)
    const newBottom = Math.min(
      windowHeight - 80, // No muy arriba
      Math.max(32, windowHeight - info.point.y - 32) // No muy abajo
    );

    // 1. Cambiar estado CSS para que salte al borde
    setFabPos({ isLeft, bottom: newBottom });
    
    // 2. Resetear las transformaciones de arrastre de inmediato
    x.set(0);
    y.set(0);

    // 3. Animación de "dash" (giro rápido) al acomodarse
    controls.start({
      rotate: isLeft ? [0, -360] : [0, 360],
      scale: [1, 0.8, 1.2, 1],
      transition: { duration: 0.5, type: "spring", stiffness: 300 }
    });
  };

  // Mensaje del Asistente Zen para la Landing Page
  useEffect(() => {
    if (!isActive) {
      setTourStep(0);
      return;
    }

    if (tourStep === 0) {
      setContextMessage({
        title: '¡Hola! Soy Lotito 🪷',
        content: 'Soy tu Asistente Zen. ¿En qué te puedo ayudar hoy?',
        isHappy: true,
        options: [
          {
            label: 'Quiero agendar mi cita',
            primary: true,
            onClick: () => setTourStep(1)
          },
          {
            label: 'Demos un recorrido',
            onClick: () => setTourStep(2)
          },
          {
            label: 'Tengo dudas (FAQ)',
            onClick: () => setTourStep(3)
          },
          {
            label: 'Contactar por WhatsApp',
            onClick: () => {
              window.open("https://wa.me/5211234567890?text=Hola,%20me%20gustaría%20más%20información", "_blank");
            }
          }
        ]
      });
    } else if (tourStep === 1) {
      setContextMessage({
        title: '¡Vamos a Agendar!',
        content: 'Da clic en el botón "Reserva tu Cita" aquí abajo para comenzar con tu ritual.',
        targetSelector: '[data-tour="agendar-btn"]',
        actionRequired: true
      });
    } else if (tourStep === 2) {
      const el = document.querySelector('[data-tour="manifesto"]');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      setContextMessage({
        title: 'Nuestra Filosofía',
        content: 'Elegimos la pausa. Zen es un refugio diseñado para que te relajes y disfrutes del momento presente.',
        targetSelector: '[data-tour="manifesto"] h2',
        options: [
          {
            label: 'Siguiente: El Menú',
            primary: true,
            onClick: () => setTourStep(21)
          }
        ]
      });
    } else if (tourStep === 21) {
      const el = document.querySelector('[data-tour="featured"]');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      setContextMessage({
        title: 'Servicios Destacados',
        content: 'Desde pedicuras botánicas inmersivas hasta uñas esculpidas con geles de alta gama. Lo mejor de lo mejor.',
        targetSelector: '[data-tour="featured"] h2',
        options: [
          {
            label: 'Siguiente: Tecnología',
            primary: true,
            onClick: () => setTourStep(22)
          }
        ]
      });
    } else if (tourStep === 22) {
      const el = document.querySelector('[data-tour="smart-booking"]');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      setContextMessage({
        title: 'Tu Agenda Inteligente',
        content: 'Olvídate de los mensajes largos. Agenda en segundos, ve la disponibilidad en tiempo real y recibe confirmación al instante.',
        targetSelector: '[data-tour="smart-booking"] h2',
        options: [
          {
            label: 'Siguiente: FAQ',
            primary: true,
            onClick: () => setTourStep(3)
          }
        ]
      });
    } else if (tourStep === 3) {
      const el = document.querySelector('[data-tour="faq"]');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });

      setContextMessage({
        title: 'Preguntas Frecuentes',
        content: 'Aquí puedes resolver tus dudas sobre la política de anticipo o cómo agendar. Si ya estás lista, ¡agenda abajo!',
        targetSelector: '[data-tour="faq"] h2',
        options: [
          {
            label: '¡Agendar ahora!',
            primary: true,
            onClick: () => setTourStep(1)
          }
        ]
      });
    }

    return () => setContextMessage(null);
  }, [isActive, tourStep, setContextMessage]);

  // Periodic pulse reminder on the sticky CTA when the tour is closed.
  // Drives attention to the highest-conversion button on the landing.
  // Pulses every 9s for 1.4s, only while the tour is inactive.
  useEffect(() => {
    if (isActive) return;
    let offTimer: ReturnType<typeof setTimeout> | null = null;
    const interval = setInterval(() => {
      if (offTimer) clearTimeout(offTimer);
      setPulseCta(true);
      offTimer = setTimeout(() => setPulseCta(false), 1400);
    }, 9000);
    return () => {
      clearInterval(interval);
      if (offTimer) clearTimeout(offTimer);
    };
  }, [isActive]);

  const faqs = [
    {
      q: '¿Cómo agendar mi cita paso a paso?',
      a: '¡Agendar es muy intuitivo y rápido!\n\n1. Da clic en "AGENDAR YA" para ir a nuestra agenda interactiva abajo.\n2. Elige el servicio de uñas o pedicura de tu preferencia.\n3. Selecciona el horario ideal.\n4. ¡Listo! Recibirás la confirmación de tu espacio.\n\nTambién puedes activar nuestro "Asistente Zen" tocando la flor de loto para un recorrido interactivo.'
    },
    {
      q: '¿Cómo funciona la política de anticipo?',
      a: 'Para garantizar tu espacio exclusivo y brindarte un servicio impecable, solicitamos un anticipo mínimo al momento de agendar.\n\nEste proceso es totalmente seguro y nos ayuda a mantener la agenda fluida para todas nuestras clientas.'
    },
    {
      q: '¿Ofrecen masajes de cuerpo completo?',
      a: 'No. Zen es un estudio de belleza especializado exclusivamente en el diseño y arte de uñas (Acrílico, Gel) y en nuestro exclusivo servicio de Pedicura Spa relajante para pies. Todo nuestro enfoque está en la perfección de tus manos y pies.'
    }
  ];

  const marqueeImages = [
    '/images/spa_hero.png',
    '/images/spa_pedicure_station.png',
    '/images/spa_detail.png',
    '/images/zen_salon_interior.png',
    '/images/nail_art_minimalist.png',
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-on-background font-sans transition-colors duration-500 pb-40 md:pb-12 relative">
      <PublicNavbar />

      {/* ── Hero Section ── */}
      <section className="relative w-full min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            src="/images/zen_waterfall_bg.png" 
            alt="Zen Waterfall" 
            className="w-full h-full object-cover"
          />
          {/* Overlays para garantizar legibilidad perfecta */}
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-black/60"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90"></div>
        </div>

        <motion.div 
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="relative z-10 flex flex-col items-center justify-center px-6 md:px-12 max-w-6xl mx-auto text-center md:text-left w-full"
        >
          <span className="text-xs md:text-sm uppercase tracking-[0.5em] font-bold text-primary drop-shadow-lg mb-8 block w-full text-center">
            Santuario de Uñas & Pedicura Spa
          </span>
          
          <h1 className="font-serif text-5xl sm:text-6xl md:text-8xl lg:text-[8rem] text-white leading-[0.9] mb-8 md:mb-12 drop-shadow-[0_10px_40px_rgba(0,0,0,0.9)] tracking-tight w-full flex flex-col items-center md:items-start">
            <span>El arte en tus manos.</span>
            <span className="italic text-primary/90 font-light md:ml-32 mt-2 md:mt-4 text-4xl sm:text-5xl md:text-7xl lg:text-[7rem]">La calma en tus pies.</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-3xl text-white/95 font-light mb-16 max-w-4xl drop-shadow-[0_5px_20px_rgba(0,0,0,0.9)] leading-[1.6] text-center md:text-left self-center md:self-start">
            Descubre un concepto de salón diferente. Nos especializamos en diseño de uñas impecable y pedicura botánica, fusionando la higiene clínica con una atmósfera de paz absoluta. <strong className="text-white font-normal">Sin prisas.</strong>
          </p>
          
          {/* Indicador de scroll */}
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="mt-16 opacity-60"
          >
            <div className="w-px h-24 bg-gradient-to-b from-primary to-transparent mx-auto"></div>
          </motion.div>
        </motion.div>
      </section>

      <ZenManifesto />

      {/* ── Infinite Carousel (Marquee) ── */}
      <section className="py-10 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
        
        <div className="flex w-[200%] animate-marquee gap-6 px-4">
          {[...marqueeImages, ...marqueeImages].map((src, i) => (
            <div key={i} className="relative w-[60vw] md:w-[400px] h-[300px] md:h-[400px] flex-none rounded-[2rem] overflow-hidden shadow-md">
              <img 
                src={src} 
                alt={`Zen Experience ${i}`}
                className="w-full h-full object-cover" 
              />
            </div>
          ))}
        </div>
      </section>

      <FeaturedServices />

      <ZenGallery />
      
      <SmartBookingFeature />

      {/* ── Manual / FAQ Section ── */}
      <section data-tour="faq" className="px-6 md:px-12 py-16 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="mb-10 text-center md:text-left">
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary mb-2 block">Guía Rápida</span>
            <h2 className="font-serif text-3xl md:text-4xl text-on-surface">Tu Visita Paso a Paso</h2>
          </div>
          
          <div className="flex flex-col">
            {faqs.map((faq, idx) => (
              <FAQAccordion key={idx} faq={faq} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="pt-16 pb-24 md:pb-12 px-6 text-center mt-10 bg-surface-container-lowest">
        <div className="flex justify-center gap-6 mb-8">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="https://wa.me/5211234567890?text=Hola,%20me%20gustaría%20más%20información" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors">
            <MessageCircle className="w-5 h-5" /> {/* Whatsapp */}
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors">
            <Music2 className="w-5 h-5" /> {/* TikTok */}
          </a>
        </div>
        
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-outline">
          © {new Date().getFullYear()} Zen Salón. Todos los derechos reservados.
        </p>
      </footer>

      {/* ── Floating Zen Assistant Button ──
          Full pill on first visit; minimized lotus only when tour was already completed.
          A small hover tooltip invites them to repeat the walkthrough. */}
      {!isActive && (
        <motion.button
          drag
          dragMomentum={false}
          style={{ 
            x, 
            y, 
            bottom: fabPos.bottom, 
            left: fabPos.isLeft ? '1.5rem' : 'auto', 
            right: fabPos.isLeft ? 'auto' : '1.5rem' 
          }}
          initial={{ scale: 1, opacity: 1 }}
          animate={controls}
          onDragEnd={handleDragEnd}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startTour}
          className={`fixed z-50 bg-surface-container-lowest border-2 border-primary/30 shadow-2xl p-2 rounded-full flex items-center text-primary hover:border-primary transition-colors group ${
            hasCompletedTour ? '' : 'gap-3 pr-5'
          }`}
          title={hasCompletedTour ? '¿Repetir recorrido?' : 'Iniciar Asistente Zen'}
          aria-label={hasCompletedTour ? '¿Repetir recorrido?' : 'Iniciar Asistente Zen'}
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20" />
            <LotusCharacter />
          </div>
          {!hasCompletedTour && (
            <span className="font-serif text-sm font-bold tracking-wide">
              Asistente Zen
            </span>
          )}
        </motion.button>
      )}

      {/* ── Sticky Booking Button (Global Design) ──
          The pulsing outer ring only animates when pulseCta is true (every ~9s). */}
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[300px]"
        >
          <Link
            href="/reserva"
            data-tour="agendar-btn"
            className="w-full relative group overflow-hidden bg-primary hover:bg-primary/90 text-on-primary shadow-[0_8px_30px_rgba(74,93,35,0.4)] hover:shadow-[0_12px_40px_rgba(74,93,35,0.5)] rounded-full px-6 py-3.5 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {/* Periodic attention pulse (outer ring) — only visible when pulseCta flips on */}
            {pulseCta && (
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-1 rounded-full ring-2 ring-primary/70 animate-ping"
              />
            )}

            {/* Brillo animado pasando de fondo */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <Calendar className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-sm uppercase tracking-wider text-center whitespace-nowrap">Reserva tu Cita</span>
          </Link>
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
