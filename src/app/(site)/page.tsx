'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Instagram, MessageCircle, Music2 } from 'lucide-react';
import PublicNavbar from '@/components/home/PublicNavbar';

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
  const faqs = [
    {
      q: '¿Cómo agendar mi cita paso a paso?',
      a: '¡Agendar es muy intuitivo y rápido!\n\n1. Da clic en "Reserva tu Cita" en la parte inferior.\n2. Elige el servicio de tu preferencia (ej. Manicura Zen).\n3. Selecciona a tu artista favorita y el horario ideal.\n4. ¡Listo! Recibirás la confirmación de tu espacio.'
    },
    {
      q: '¿Cómo funciona la política de anticipo del 50%?',
      a: 'Para garantizar tu espacio exclusivo y brindarte un servicio impecable, solicitamos un anticipo del 50% del valor de tu servicio principal al momento de agendar.\n\nEste proceso es totalmente seguro y nos ayuda a mantener la agenda fluida para todas nuestras clientas. El 50% restante lo liquidas cómodamente el día de tu visita en el salón.'
    },
    {
      q: '¿Qué pasa si llego tarde o necesito cancelar?',
      a: 'Entendemos que el día a día puede ser impredecible. Cuentas con una tolerancia de gracia de 15 minutos.\n\nSi necesitas cancelar o reagendar tu ritual, te pedimos amablemente que nos notifiques con al menos 24 horas de anticipación para que tu anticipo siga siendo válido y podamos ceder el espacio a otra clienta.'
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-on-background font-sans transition-colors duration-500 pb-28 md:pb-32">
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
              Nuestra Colección
            </span>
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-on-surface leading-[1.1]">
              El arte del detalle,<br />
              elevado a la perfección.
            </h1>
          </div>
          <Link 
            href="/reserva" 
            className="text-[10px] uppercase tracking-[0.15em] font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 mt-5 md:mt-0 pb-2 border-b border-transparent hover:border-primary"
          >
            VER MENÚ COMPLETO 
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
              src="https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop" 
              alt="Manicura Ritual"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <h3 className="absolute bottom-6 left-6 md:bottom-8 md:left-8 text-white font-serif text-xl md:text-3xl drop-shadow-md">
              Manicura Ritual
            </h3>
          </div>

          {/* Right Column: Two small images vertically */}
          <div className="flex flex-col gap-4 md:gap-6 md:h-[600px]">
            <div className="relative h-[200px] md:flex-1 rounded-[2rem] overflow-hidden group shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop" 
                alt="Pedicura Zen"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <h3 className="absolute bottom-4 left-5 md:bottom-6 md:left-6 text-white font-serif text-lg md:text-2xl drop-shadow-md">
                Pedicura Zen
              </h3>
            </div>
            
            <div className="relative h-[200px] md:flex-1 rounded-[2rem] overflow-hidden group shadow-sm bg-surface-variant">
              <img 
                src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=800&auto=format&fit=crop" 
                alt="Arte & Diseño"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <h3 className="absolute bottom-4 left-5 md:bottom-6 md:left-6 text-white font-serif text-lg md:text-2xl drop-shadow-md">
                Arte & Diseño
              </h3>
            </div>
          </div>

          {/* Bottom Row: Wide image */}
          <div className="md:col-span-2 relative h-[200px] md:h-[350px] rounded-[2rem] overflow-hidden group shadow-sm">
            <img 
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1600&auto=format&fit=crop" 
              alt="Extensiones Acrílicas"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <h3 className="absolute bottom-5 left-5 md:bottom-8 md:left-8 text-white font-serif text-lg md:text-3xl drop-shadow-md">
              Extensiones Acrílicas
            </h3>
          </div>
        </motion.div>
      </section>

      {/* ── Philosophy (About Us) & Book Button ── */}
      <section className="px-6 md:px-12 py-16 max-w-4xl mx-auto text-left relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-serif text-3xl md:text-4xl text-primary mb-6">Nuestra Esencia</h2>
          <p className="text-lg md:text-xl text-on-surface-variant font-light leading-relaxed mb-12">
            Encuentra el equilibrio perfecto entre naturaleza y elegancia. Nuestros tratamientos orgánicos nutren tu cuerpo y alma, inspirados en la filosofía Zen para ofrecerte un momento de profunda relajación y conexión interior.
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
          Servicios Signature
        </motion.h2>

        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-8 pt-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:overflow-visible md:px-0 md:pb-0 md:pt-0">
          {[
            {
              title: 'Manicura Zen',
              desc: 'Una experiencia delicada y medicinal que restaura la vitalidad natural de tus uñas con acabados vibrantes y duraderos.',
            },
            {
              title: 'Ritual Pedicura Aroma',
              desc: 'Relajación profunda a través de un ritual botánico pintado a mano, diseñado para revitalizar pies cansados.',
            },
            {
              title: 'Tratamiento Armónico',
              desc: 'Suaviza, alisa y rejuvenece tus manos con infusiones orgánicas, dejando resultados visibles y duraderos.',
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
      <footer className="pt-16 pb-12 px-6 text-center mt-10">
        <div className="flex justify-center gap-6 mb-8">
          <a href="#" className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors">
            <MessageCircle className="w-5 h-5" /> {/* Whatsapp */}
          </a>
          <a href="#" className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors">
            <Music2 className="w-5 h-5" /> {/* TikTok */}
          </a>
        </div>
        
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-outline">
          © {new Date().getFullYear()} Zen Salón. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
