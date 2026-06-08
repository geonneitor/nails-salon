'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ZenBookingJourney from '@/components/home/ZenBookingJourney';

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-fondo-zen pt-24 pb-24 px-5">
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-primario-zen/60 hover:text-primario-zen font-sans text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Volver
        </Link>
      </div>

      <ZenBookingJourney />
    </div>
  );
}
