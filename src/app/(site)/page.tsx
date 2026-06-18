'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Instagram, MessageCircle, Music2, Calendar, Sparkles, Droplets, Leaf } from 'lucide-react';
import PublicNavbar from '@/components/home/PublicNavbar';
import { useZenAssistant } from '@/context/ZenAssistantContext';
import { LotusCharacter } from '@/components/tutorial/LotusCharacter';

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
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
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
  const { startTour, isActive } = useZenAssistant();

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
      <section className="px-4 md:px-12 pt-28 md:pt-40 pb-10 md:pb-16 max-w-[1400px] mx-auto relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center max-w-4xl mx-auto"
        >
          <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-primary mb-4 block">
            Santuario de Uñas & Pedicura Spa
          </span>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-on-surface leading-[1.1] mb-6">
            El arte en tus manos.<br />
            La calma en tus pies.
          </h1>
          <p className="text-lg text-on-surface-variant font-light mb-10 max-w-2xl mx-auto">
            Descubre un concepto de salón diferente. Nos especializamos en diseño de uñas impecable y pedicura botánica, fusionando la higiene clínica con una atmósfera de paz absoluta. Sin prisas.
          </p>
        </motion.div>
      </section>

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

      {/* ── Why Zen? ── */}
      <section className="px-6 md:px-12 py-20 max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-3xl md:text-5xl text-on-surface mb-6">¿Por qué Zen es diferente?</h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            No somos un spa de masajes corporales ni un salón de belleza ruidoso. Somos un santuario de especialidad enfocado en los detalles.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Sparkles className="w-8 h-8 text-primary" />,
              title: "Higiene Intransigente",
              desc: "Esterilización de grado médico. Cada herramienta está sellada y los limadores son 100% desechables por clienta."
            },
            {
              icon: <Leaf className="w-8 h-8 text-primary" />,
              title: "Productos Premium",
              desc: "Utilizamos geles de alta pigmentación y productos botánicos orgánicos libres de toxinas dañinas."
            },
            {
              icon: <Droplets className="w-8 h-8 text-primary" />,
              title: "Tiempos sin Prisas",
              desc: "Tu cita está bloqueada exclusivamente para ti. No trabajamos contra reloj, trabajamos por la perfección."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-depth p-8 rounded-3xl text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-surface-variant flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="font-serif text-2xl text-on-surface mb-4">{feature.title}</h3>
              <p className="font-sans text-on-surface-variant">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Beneficios de los Rituales ── */}
      <section className="px-4 md:px-12 py-16 relative bg-surface-container-low rounded-t-[3rem] mt-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary mb-2 block">Bienestar Holístico</span>
            <h2 className="font-serif text-3xl md:text-5xl text-on-surface mb-4">Beneficios de Nuestros Rituales</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">Más allá de la estética, cada servicio está diseñado para aportarte beneficios terapéuticos y un momento de auténtica desconexión.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-sm border border-outline-variant/30 flex flex-col items-start text-left">
              <h3 className="font-serif text-2xl text-on-surface mb-3">Pedicura Spa Botánica</h3>
              <ul className="space-y-3 font-light text-on-surface-variant">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /> <strong>Mejora la Circulación:</strong> Los baños calientes y exfoliaciones estimulan el flujo sanguíneo, aliviando la pesadez.</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /> <strong>Prevención Clínica:</strong> Mantenemos la salud de las uñas y detectamos a tiempo problemas como uñas encarnadas o sequedad extrema.</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /> <strong>Exfoliación Profunda:</strong> Elimina células muertas, previniendo durezas y dejando la piel suave y renovada.</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /> <strong>Alivio del Estrés:</strong> El contacto con el agua tibia y las esencias botánicas actúan como aromaterapia relajante.</li>
              </ul>
            </div>
            <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-sm border border-outline-variant/30 flex flex-col items-start text-left">
              <h3 className="font-serif text-2xl text-on-surface mb-3">Manicura Zen y Uñas</h3>
              <ul className="space-y-3 font-light text-on-surface-variant">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /> <strong>Salud Cuticular:</strong> Hidratación y remoción cuidadosa de cutículas que evitan infecciones y padrastros.</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /> <strong>Fortalecimiento:</strong> Aplicación de bases nutritivas y geles de alta gama que protegen tus uñas naturales del quiebre.</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /> <strong>Arte que Empodera:</strong> Diseños minimalistas y elegantes que elevan tu autoestima y reflejan tu personalidad.</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /> <strong>Masaje Focalizado:</strong> El masaje final de manos alivia la tensión de las articulaciones provocada por dispositivos y trabajo de escritorio.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Manual / FAQ Section ── */}
      <section className="px-6 md:px-12 py-16 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
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

      {/* ── Floating Zen Assistant Button ── */}
      {!isActive && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startTour}
          className="fixed bottom-24 left-6 md:bottom-8 md:left-8 z-50 bg-surface-container-lowest border-2 border-primary/30 shadow-2xl p-2 rounded-full flex items-center gap-3 pr-5 text-primary hover:border-primary transition-colors group"
          title="Iniciar Asistente Zen"
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20" />
            <LotusCharacter />
          </div>
          <span className="font-serif text-sm font-bold tracking-wide">
            Asistente Zen
          </span>
        </motion.button>
      )}

      {/* ── Sticky Booking Button (Global Design) ── */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[300px]"
        >
          <Link
            href="/reserva"
            data-tour="agendar-btn"
            className="w-full relative group overflow-hidden bg-primary hover:bg-primary/90 text-on-primary shadow-[0_8px_30px_rgba(74,93,35,0.4)] hover:shadow-[0_12px_40px_rgba(74,93,35,0.5)] rounded-full px-6 py-3.5 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2"
          >
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
