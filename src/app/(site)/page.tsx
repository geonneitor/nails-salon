'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Instagram, MessageCircle, Music2, Flower2, Calendar } from 'lucide-react';
import PublicNavbar from '@/components/home/PublicNavbar';
import { useZenAssistant } from '@/context/ZenAssistantContext';

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
      a: '¡Agendar es muy intuitivo y rápido!\n\n1. Da clic en "AGENDAR YA" en la parte inferior.\n2. Elige el servicio de tu preferencia (ej. Pedicura Spa).\n3. Selecciona el horario ideal.\n4. ¡Listo! Recibirás la confirmación de tu espacio.\n\nTambién puedes activar nuestro "Asistente Zen" tocando la flor de loto para un recorrido interactivo.'
    },
    {
      q: '¿Cómo funciona la política de anticipo?',
      a: 'Para garantizar tu espacio exclusivo y brindarte un servicio impecable, solicitamos un anticipo mínimo al momento de agendar.\n\nEste proceso es totalmente seguro y nos ayuda a mantener la agenda fluida para todas nuestras clientas.'
    },
    {
      q: '¿Qué pasa si llego tarde o necesito cancelar?',
      a: 'Entendemos que el día a día puede ser impredecible. Cuentas con una tolerancia de gracia de 15 minutos.\n\nSi necesitas cancelar o reagendar tu ritual, te pedimos amablemente que nos notifiques con anticipación para que tu anticipo siga siendo válido y podamos ceder el espacio a otra clienta.'
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-on-background font-sans transition-colors duration-500 pb-40 md:pb-32 relative">
      <PublicNavbar />

      {/* ── Bento Gallery Section (Hero Replacement) ── */}
      <section className="px-4 md:px-12 pt-28 md:pt-40 pb-10 md:pb-16 max-w-[1400px] mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12"
        >
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-3 block">
              Bienvenida a la Calma
            </span>
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-on-surface leading-[1.1]">
              Relajación profunda,<br />
              belleza natural.
            </h1>
          </div>
          <Link 
            href="/reserva" 
            className="text-[10px] uppercase tracking-[0.15em] font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 mt-5 md:mt-0 pb-2 border-b border-transparent hover:border-primary"
          >
            VER EXPERIENCIAS 
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-6"
        >
          {/* Left Column: Tall image */}
          <div className="relative h-[280px] md:h-[600px] rounded-[2rem] overflow-hidden group shadow-sm">
            <img 
              src="/images/spa_hero.png" 
              alt="Ritual Pedicura Spa"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <h3 className="absolute bottom-6 left-6 md:bottom-8 md:left-8 text-white font-serif text-xl md:text-3xl drop-shadow-md">
              Ritual Pedicura Spa
            </h3>
          </div>

          {/* Right Column: Two small images vertically */}
          <div className="flex flex-col gap-4 md:gap-6 md:h-[600px]">
            <div className="relative h-[200px] md:flex-1 rounded-[2rem] overflow-hidden group shadow-sm">
              <img 
                src="/images/spa_detail.png" 
                alt="Detalle Botánico"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <h3 className="absolute bottom-4 left-5 md:bottom-6 md:left-6 text-white font-serif text-lg md:text-2xl drop-shadow-md">
                Esencia Botánica
              </h3>
            </div>
            
            <div className="relative h-[200px] md:flex-1 rounded-[2rem] overflow-hidden group shadow-sm bg-surface-variant">
              <img 
                src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop" 
                alt="Masaje Relajante"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <h3 className="absolute bottom-4 left-5 md:bottom-6 md:left-6 text-white font-serif text-lg md:text-2xl drop-shadow-md">
                Masaje Relajante
              </h3>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Philosophy (About Us) ── */}
      <section className="px-6 md:px-12 py-16 max-w-4xl mx-auto text-left relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-serif text-3xl md:text-4xl text-primary mb-6">Nuestra Esencia</h2>
          <p className="text-lg md:text-xl text-on-surface-variant font-light leading-relaxed mb-12">
            Cada masaje y tratamiento está diseñado a medida para nutrir tu cuerpo y mente. Inspirados en la estética zen y los elementos de la naturaleza, ofrecemos un refugio de paz donde puedes desconectar del mundo y reconectar contigo misma.
          </p>
        </motion.div>
      </section>

      {/* ── Signature Services ── */}
      <section className="px-6 md:px-12 py-12 relative overflow-hidden">
        <div className="absolute right-[-10%] top-0 w-[50vw] h-[50vw] bg-primary opacity-[0.03] dark:opacity-[0.1] rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl md:text-4xl text-on-surface mb-12 max-w-4xl mx-auto"
        >
          Tratamientos Especiales
        </motion.h2>

        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-8 pt-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:overflow-visible md:px-0 md:pb-0 md:pt-0">
          {[
            {
              title: 'Pedicura Spa Orgánica',
              desc: 'Relajación profunda a través de un ritual botánico con esencias naturales, diseñado para revitalizar pies cansados y mejorar la circulación.',
            },
            {
              title: 'Manicura Zen',
              desc: 'Una experiencia delicada que restaura la vitalidad natural de tus manos con masajes terapéuticos y un acabado impecable.',
            },
            {
              title: 'Terapia Armónica',
              desc: 'Tratamientos personalizados que alivian la tensión acumulada, dejando una sensación de ligereza y bienestar total.',
            }
          ].map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6, type: "spring" }}
              className="card-depth flex-none w-[85vw] md:w-[360px] snap-center p-8 rounded-3xl flex flex-col justify-between min-h-[260px] transition-transform duration-300 hover:-translate-y-2 cursor-pointer"
            >
              <div>
                <h3 className="font-serif text-2xl text-on-surface mb-4 leading-snug">{service.title}</h3>
                <div className="w-12 h-1 bg-primary/30 mb-6 rounded-full" />
                <p className="font-sans text-on-surface-variant text-sm md:text-base leading-relaxed">{service.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Manual / FAQ Section ── */}
      <section className="px-6 md:px-12 py-16 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="mb-10">
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary mb-2 block">Guía Rápida</span>
            <h2 className="font-serif text-3xl md:text-4xl text-on-surface">Tu Visita Paso a Paso</h2>
            <p className="text-on-surface-variant mt-4 font-light">Resolvimos las dudas más comunes para que agendar tu experiencia sea tan relajante como el servicio mismo.</p>
          </div>
          
          <div className="flex flex-col">
            {faqs.map((faq, idx) => (
              <FAQAccordion key={idx} faq={faq} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="pt-16 pb-24 px-6 text-center mt-10">
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
          className="fixed bottom-24 left-6 md:bottom-8 md:left-8 z-50 bg-surface-container-lowest border-2 border-primary/30 shadow-2xl p-3 rounded-full flex items-center gap-3 pr-5 text-primary hover:border-primary transition-colors group"
          title="Iniciar Asistente Zen"
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20" />
            <Flower2 className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
          </div>
          <span className="font-serif text-sm font-bold tracking-wide">
            Asistente Zen
          </span>
        </motion.button>
      )}

      {/* ── Sticky Booking Button ── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-background via-background/90 to-transparent z-40 pointer-events-none flex justify-center md:justify-end">
        <Link
          href="/reserva"
          data-tour="agendar-btn"
          className="pointer-events-auto bg-primary text-white w-full md:w-auto px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-opacity-90 hover:-translate-y-1 transition-all"
        >
          <Calendar className="w-4 h-4" />
          Agendar Ya
        </Link>
      </div>

    </div>
  );
}
