'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Hero from '@/components/home/Hero';
import BrandInfo from '@/components/home/BrandInfo';
import TimeRules from '@/components/home/TimeRules';
import BookingTutorial from '@/components/home/BookingTutorial';
import PaymentDetails from '@/components/home/PaymentDetails';
import ZenBookingJourney from '@/components/home/ZenBookingJourney';
import MiniCalendarPreview from '@/components/home/MiniCalendarPreview';

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-fondo-zen flex flex-col items-center p-6 relative overflow-hidden">
      {/*
          Atmospheric Dynamic Background
          Combining gradients, pulsed glows and a subtle noise/grain texture
      */}
      <div className="absolute inset-0 hero-gradient pointer-events-none" />

      {/* Animated Floating Orbs for depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-sage/20 blur-[140px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-gold/15 blur-[140px] animate-pulse pointer-events-none" />
      <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-primario-zen/10 blur-[100px] animate-bounce pointer-events-none" style={{ animationDuration: '8s' }} />

      {/* Subtle Grain Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />

      {/* Header Navigation - The "Connection" */}
      <nav className="relative z-30 w-full max-w-7xl flex justify-between items-center py-8 px-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-primario-zen font-serif text-xs uppercase tracking-widest font-bold">
          ZEN
        </div>
        <Link
          href="/dashboard"
          className="group relative px-6 py-2 rounded-full bg-primario-zen text-fondo-zen text-[10px] uppercase tracking-widest font-bold overflow-hidden transition-all hover:shadow-lg hover:shadow-primario-zen/30"
        >
          <span className="relative z-10">Acceso al Santuario</span>
          <motion.div
            className="absolute inset-0 bg-accent-gold/30"
            initial={{ x: '-100%' }}
            whileHover={{ x: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          />
        </Link>
      </nav>

      {/* Content Wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-20 flex flex-col items-center w-full max-w-none"
      >
        {/* --- PHASE 1: WELCOME & INSPIRATION --- */}
        <Hero />
        <BrandInfo />

        {/* --- PHASE 2: EDUCATION & RULES --- */}
        <TimeRules />
        <BookingTutorial />
        <PaymentDetails />

        {/* --- PHASE 3: ACTION (BOOKING SECTION) --- */}
        <div className="w-full mt-20 p-8 md:p-12 rounded-[3rem] bg-white/30 border border-white/50 backdrop-blur-md shadow-2xl flex flex-col items-center gap-12 transition-all duration-700 hover:bg-white/40">
          <div className="text-center">
            <h2 className="text-primario-zen font-serif text-3xl mb-2 uppercase tracking-widest">
              Reserva Tu Cita
            </h2>
            <p className="text-primario-zen/60 font-sans text-sm max-w-md mx-auto">
              Ahora que conoces nuestra esencia, elige el momento perfecto para tu transformación.
            </p>
          </div>

          <div className="w-full flex flex-col items-center gap-12">
            <MiniCalendarPreview />
            <ZenBookingJourney />
          </div>

          <div className="mt-6">
            <Link href="/calendar" className="text-primario-zen/60 hover:text-primario-zen transition-colors text-xs uppercase tracking-widest font-semibold">
              Ver calendario completo de disponibilidades →
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
