'use client';

import { motion } from 'framer-motion';
import { CreditCard, ShieldCheck, Wallet } from 'lucide-react';
import ZenCard from './ZenCard';

export default function PaymentDetails() {
  return (
    <section className="mb-12 w-full max-w-none px-6">
      <div className="text-center mb-8">
        <h2 className="text-primario-zen font-serif text-2xl uppercase tracking-widest">
          Detalles del Pago
        </h2>
        <div className="mt-4 p-3 bg-accent-gold/10 border border-accent-gold/20 rounded-full inline-block">
          <p className="text-[10px] text-accent-gold uppercase tracking-tighter font-bold italic">
            💡 Sugerencia: Transmite seguridad y claridad. Explica el "por qué" del anticipo para evitar fricciones. (Aprox. 50-80 palabras)
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ZenCard className="p-6 group hover:shadow-lg hover:shadow-accent-gold/5 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primario-zen/10 rounded-lg group-hover:bg-accent-gold/20 transition-colors">
              <Wallet className="w-5 h-5 text-primario-zen group-hover:text-accent-gold transition-colors" />
            </div>
            <h3 className="text-primario-zen font-serif text-lg group-hover:text-accent-gold transition-colors">Depósito de Anticipo</h3>
          </div>
          <p className="text-primario-zen/60 text-sm font-sans leading-relaxed">
            Para asegurar tu espacio en nuestra agenda, solicitamos un <span className="font-bold text-primario-zen group-hover:text-accent-gold transition-colors">anticipo del 50%</span> del valor total del servicio. Este depósito garantiza tu cita y es no reembolsable en caso de cancelaciones con menos de 24 horas de aviso.
          </p>
        </ZenCard>

        <ZenCard className="p-6 group hover:shadow-lg hover:shadow-accent-gold/5 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primario-zen/10 rounded-lg group-hover:bg-accent-gold/20 transition-colors">
              <CreditCard className="w-5 h-5 text-primario-zen group-hover:text-accent-gold transition-colors" />
            </div>
            <h3 className="text-primario-zen font-serif text-lg group-hover:text-accent-gold transition-colors">Pago Final</h3>
          </div>
          <p className="text-primario-zen/60 text-sm font-sans leading-relaxed">
            El monto restante se liquidará al finalizar tu servicio. Aceptamos transferencias, tarjetas y efectivo. Al finalizar, recibirás un comprobante digital de tu sesión.
          </p>
        </ZenCard>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-primario-zen/40">
        <ShieldCheck className="w-4 h-4" />
        <span className="text-[10px] uppercase tracking-widest font-semibold font-sans">Pagos seguros y encriptados</span>
      </div>
    </section>
  );
}
