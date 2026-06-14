'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import ZenBookingJourney from '@/components/home/ZenBookingJourney';
import PublicNavbar from '@/components/home/PublicNavbar';
import { motion } from 'framer-motion';

export default function BookingPage() {
  return (
    <div className="min-h-screen w-full bg-background text-on-background flex flex-col transition-colors duration-500">
      {/* ── Barra de navegación global ── */}
      <PublicNavbar />

      {/* ── Contenido principal ── */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-4 md:pb-6 relative z-10 flex flex-col">
        
        {/* El Dashboard Unificado de Reserva */}
        <div className="w-full flex-1">
          <ZenBookingJourney />
        </div>
      </main>
    </div>
  );
}

