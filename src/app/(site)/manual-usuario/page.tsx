'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Shield, 
  Heart, 
  Scissors, 
  Clock, 
  ArrowRight,
  ChevronDown, 
  User, 
  Phone, 
  CreditCard, 
  AlertCircle, 
  ChevronLeft,
  BookOpen
} from 'lucide-react';

const CATEGORY_DETAILS = [
  {
    num: '1',
    title: 'Selección y Personalización',
    desc: 'Elige tu ritual base favorito de las categorías Bento (Full Set de Acrílico, Gel de Protección, Manicura o Pedicura Spa). Una vez seleccionado, personalízalo:',
    items: [
      { bold: 'Elige la Base:', text: ' Selecciona el servicio base que prefieras (ej. punta de diseño, extensión, cuidado básico).' },
      { bold: 'Adiciona Diseños (Opcional):', text: ' Agrega decoraciones, arte a mano alzada o reposiciones. Puedes aumentar la cantidad usando los controles de + y - de forma táctil.' }
    ]
  },
  {
    num: '2',
    title: 'Selección de Fecha y Hora',
    desc: 'Encuentra tu momento de desconexión en nuestra agenda en tiempo real:',
    items: [
      { bold: 'Elige el Día:', text: ' Desliza lateralmente la barra de las próximas 2 semanas y toca el día que prefieras.' },
      { bold: 'Elige el Horario:', text: ' Toca uno de los horarios disponibles en la grilla. El botón inferior te mostrará exactamente la hora seleccionada para continuar.' }
    ]
  },
  {
    num: '3',
    title: 'Ingresa tu Identidad',
    desc: 'Para agendar y sincronizar tu cita correctamente:',
    items: [
      { bold: 'Nombre Completo:', text: ' Escribe tu nombre tal cual deseas que figure en tu registro.' },
      { bold: 'Número de WhatsApp:', text: ' Es indispensable para enviarte tu confirmación y el enlace seguro de pago del anticipo.' }
    ]
  },
  {
    num: '4',
    title: 'Confirmación de Reserva',
    desc: 'Revisa la tarjeta resumen digital que detalla el costo estimado total, la duración y la fecha. Tras hacer clic en Confirmar Reserva, tu solicitud quedará guardada en estado pendiente y pasarás a realizar el depósito de garantía.',
    items: []
  }
];

const FAQS = [
  {
    q: '¿Puedo cambiar la hora o el día de mi cita?',
    a: 'Sí. Puedes reprogramar tu cita sin costo alguno con un mínimo de 24 horas de anticipación. Si cancelas o reprogramas con menos tiempo, el anticipo de garantía se aplicará como tarifa de cancelación. Contáctanos directamente vía WhatsApp para gestionar el cambio.'
  },
  {
    q: '¿Qué ocurre si llego tarde a mi cita?',
    a: 'Ofrecemos una tolerancia de cortesía de 10 minutos. Pasado este tiempo, para evitar retrasar las citas de las clientas subsecuentes, nos veremos en la necesidad de reducir la complejidad de tu servicio (ej. omitir ciertos diseños) o reprogramar la cita bajo la penalización del anticipo.'
  },
  {
    q: '¿Cómo realizo el pago del 50% restante?',
    a: 'El 50% restante del valor total de tu ritual se liquida directamente en el salón al término de tu servicio. Aceptamos efectivo, transferencias electrónicas y pagos con tarjeta de débito o crédito.'
  },
  {
    q: '¿Por qué no puedo reservar para el mismo día?',
    a: 'Para garantizar que los espacios, insumos y artistas estén debidamente preparados para recibirte, el sistema de agendamiento en línea requiere un mínimo de 12 horas de antelación. Si deseas consultar disponibilidad inmediata, te invitamos a enviarnos un mensaje de WhatsApp directamente.'
  }
];

export default function ManualUsuarioPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(prev => (prev === idx ? null : idx));
  };

  return (
    <div className="min-h-screen bg-fondo-zen flex flex-col">
      {/* ── Barra de navegación sticky ── */}
      <header className="w-full border-b border-secundario-zen/30 bg-fondo-zen/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" aria-label="Ir al inicio" className="flex items-center gap-2 text-primario-zen">
            <img
              src="/zen-logo.svg"
              alt="Zen Nail Salon"
              className="h-8 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
            />
          </Link>

          <Link
            href="/reserva"
            className="inline-flex items-center gap-1.5 text-primario-zen/50 hover:text-primario-zen font-sans text-xs font-semibold uppercase tracking-widest transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Volver a Reservas
          </Link>
        </div>
      </header>

      {/* ── Contenedor principal de dos columnas ── */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-5 py-12 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-12">
        
        {/* COLUMNA 1: Tabla de Contenidos (Sticky on desktop) */}
        <aside className="hidden md:block">
          <div className="sticky top-24 bg-white/70 border border-secundario-zen/30 rounded-3xl p-6 shadow-sm backdrop-blur-sm">
            <h2 className="font-serif text-sm text-primario-zen font-semibold mb-4 border-b border-secundario-zen/30 pb-2 uppercase tracking-wider">
              Contenidos
            </h2>
            <nav className="flex flex-col gap-3">
              <a
                href="#como-funciona"
                className="text-xs font-medium text-primario-zen/60 hover:text-primario-zen transition-colors flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold-primary" />
                El Flujo de Reserva
              </a>
              <a
                href="#politica-anticipo"
                className="text-xs font-medium text-primario-zen/60 hover:text-primario-zen transition-colors flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primario-zen/40" />
                Anticipo y Garantía
              </a>
              <a
                href="#instalacion-app"
                className="text-xs font-medium text-primario-zen/60 hover:text-primario-zen transition-colors flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-lavender" />
                Instalar como App
              </a>
              <a
                href="#preguntas-frecuentes"
                className="text-xs font-medium text-primario-zen/60 hover:text-primario-zen transition-colors flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primario-zen/20" />
                Preguntas Frecuentes
              </a>
            </nav>
          </div>
        </aside>

        {/* COLUMNA 2: Contenido */}
        <main className="flex flex-col gap-16">
          {/* Bienvenida Hero */}
          <section className="text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 bg-primario-zen/8 px-4 py-1.5 rounded-full mb-4">
              <BookOpen className="w-3.5 h-3.5 text-primario-zen/60" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-primario-zen/60">
                Guía del Portal
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-primario-zen mb-4 leading-tight">
              Manual de Uso para Clientas
            </h1>
            <p className="font-sans text-sm text-primario-zen/50 max-w-xl leading-relaxed">
              Descubre cómo agendar tu ritual, personalizar tus diseños y asegurar tu espacio en Zen Nail Salon en solo un par de clics.
            </p>
          </section>

          {/* SECCIÓN 1: EL FLUJO DE RESERVA */}
          <section id="como-funciona" className="scroll-mt-24">
            <div className="flex items-center gap-2.5 mb-4">
              <Sparkles className="w-5 h-5 text-accent-gold-primary" strokeWidth={1.5} />
              <h2 className="font-serif text-2xl md:text-3xl text-primario-zen">
                El Flujo de Reserva Paso a Paso
              </h2>
            </div>
            <p className="font-sans text-xs text-primario-zen/50 mb-8 leading-relaxed">
              Nuestro asistente inteligente te guía en el proceso de agendamiento para asegurar que cada detalle de tu cita esté adaptado a ti.
            </p>

            <div className="flex flex-col gap-6">
              {CATEGORY_DETAILS.map((step) => (
                <div 
                  key={step.num}
                  className="bg-white/80 border border-secundario-zen/30 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-sm hover:border-primario-zen/30 transition-colors group"
                >
                  {/* Número estético gigante de fondo */}
                  <span className="absolute -top-4 -right-1 font-serif text-8xl font-bold text-primario-zen/3 select-none pointer-events-none group-hover:scale-105 transition-transform duration-500">
                    {step.num}
                  </span>

                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-primario-zen/5 flex items-center justify-center font-bold text-primario-zen text-sm flex-shrink-0 mt-0.5">
                      {step.num}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-lg text-primario-zen mb-3">{step.title}</h3>
                      <p className="font-sans text-xs text-primario-zen/60 leading-relaxed font-light">{step.desc}</p>
                      
                      {step.items.length > 0 && (
                        <ul className="flex flex-col gap-2 mt-4 pl-4 list-disc text-xs text-primario-zen/50">
                          {step.items.map((item, index) => (
                            <li key={index}>
                              <strong className="text-primario-zen font-semibold">{item.bold}</strong>
                              {item.text}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECCIÓN 2: POLÍTICA DE ANTICIPO */}
          <section id="politica-anticipo" className="scroll-mt-24">
            <div className="flex items-center gap-2.5 mb-4">
              <CreditCard className="w-5 h-5 text-accent-gold-primary" strokeWidth={1.5} />
              <h2 className="font-serif text-2xl md:text-3xl text-primario-zen">
                Anticipo y Garantía del Espacio
              </h2>
            </div>
            <p className="font-sans text-xs text-primario-zen/50 mb-6 leading-relaxed">
              En Zen valoramos tu tiempo y el de nuestras artistas. Para garantizar una experiencia de tranquilidad y exclusividad, operamos bajo política de anticipo.
            </p>

            <div className="bg-primario-zen/5 border border-dashed border-primario-zen/30 rounded-3xl p-6 md:p-8 flex gap-4 items-start">
              <AlertCircle className="w-6 h-6 text-primario-zen mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-serif text-lg text-primario-zen mb-2">Garantía del 50% de la Base</h4>
                <p className="font-sans text-xs text-primario-zen/60 leading-relaxed font-light">
                  Una vez solicitada tu reserva, tu lugar quedará reservado temporalmente. Recibirás un mensaje de WhatsApp con un enlace seguro para realizar el pago del <strong>50% del servicio base</strong>. 
                  Dispones de un tiempo establecido para completarlo; una vez recibido el pago, tu cita cambia automáticamente a estado <strong>Confirmado</strong> y se asienta en la agenda de tu artista asignada.
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 3: INSTALAR COMO APP */}
          <section id="instalacion-app" className="scroll-mt-24">
            <div className="flex items-center gap-2.5 mb-4">
              <Phone className="w-5 h-5 text-accent-gold-primary" strokeWidth={1.5} />
              <h2 className="font-serif text-2xl md:text-3xl text-primario-zen">
                Instala el Portal en tu Móvil (PWA)
              </h2>
            </div>
            <p className="font-sans text-xs text-primario-zen/50 mb-6 leading-relaxed">
              Puedes instalar nuestro portal de reservas en la pantalla de inicio de tu teléfono móvil como si fuese una aplicación nativa, lo que te permitirá agendar en segundos.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Apple iOS */}
              <div className="bg-white/80 border border-secundario-zen/30 rounded-3xl p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 font-serif text-base text-primario-zen font-semibold">
                  <span className="text-xl"></span> Apple iOS (iPhone)
                </div>
                <ol className="list-decimal pl-5 text-xs text-primario-zen/60 flex flex-col gap-2 font-light">
                  <li>Abre el enlace de reservas en tu navegador <strong>Safari</strong>.</li>
                  <li>Toca el botón de <strong>Compartir</strong> (la caja con flecha hacia arriba).</li>
                  <li>Desliza el menú y selecciona <strong>Agregar al inicio</strong>.</li>
                  <li>Confirma el nombre y presiona <strong>Agregar</strong>.</li>
                </ol>
              </div>

              {/* Android */}
              <div className="bg-white/80 border border-secundario-zen/30 rounded-3xl p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 font-serif text-base text-primario-zen font-semibold">
                  <span className="text-base">🤖</span> Google Android
                </div>
                <ol className="list-decimal pl-5 text-xs text-primario-zen/60 flex flex-col gap-2 font-light">
                  <li>Abre el enlace de reservas en tu navegador <strong>Chrome</strong>.</li>
                  <li>Toca el botón de <strong>Menú</strong> (los tres puntos arriba a la derecha).</li>
                  <li>Selecciona la opción <strong>Instalar Aplicación</strong> o <strong>Agregar a pantalla principal</strong>.</li>
                  <li>Confirma el diálogo de instalación.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* SECCIÓN 4: PREGUNTAS FRECUENTES */}
          <section id="preguntas-frecuentes" className="scroll-mt-24">
            <div className="flex items-center gap-2.5 mb-4">
              <BookOpen className="w-5 h-5 text-accent-gold-primary" strokeWidth={1.5} />
              <h2 className="font-serif text-2xl md:text-3xl text-primario-zen">
                Preguntas Frecuentes (FAQ)
              </h2>
            </div>
            <p className="font-sans text-xs text-primario-zen/50 mb-6 leading-relaxed">
              Aclaramos tus dudas para asegurar una visita libre de preocupaciones a nuestro santuario.
            </p>

            <div className="flex flex-col gap-4">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div 
                    key={idx}
                    className="bg-white/80 border border-secundario-zen/30 rounded-2xl overflow-hidden transition-colors duration-300"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full text-left p-5 flex items-center justify-between font-serif text-sm text-primario-zen font-medium hover:bg-primario-zen/5 transition-colors focus:outline-none"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown 
                        className={`w-4 h-4 text-primario-zen/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                      />
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-secundario-zen/20"
                        >
                          <div className="p-5 font-sans text-xs text-primario-zen/60 font-light leading-relaxed">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-secundario-zen/30 py-8 text-center bg-white">
        <p className="font-sans text-[10px] uppercase tracking-widest text-primario-zen/30">
          © {new Date().getFullYear()} Zen Nail Salon · Rituales de Calma
        </p>
      </footer>
    </div>
  );
}
