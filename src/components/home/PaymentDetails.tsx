'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Wallet, CreditCard } from 'lucide-react';

export default function PaymentDetails() {
  return (
    <section className="w-full py-24 px-6 max-w-none">
      <motion.div
        initial={{ opacity: 1, y: 40, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-3xl mx-auto rounded-[2.5rem] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--deep-botanical-2) 0%, var(--deep-botanical-1) 100%)',
        }}
      >
        {/* Noise overlay */}
        <div className="noise-overlay absolute inset-0 pointer-events-none" />

        {/* Ambient glow corners */}
        <div
          className="absolute -top-12 -left-12 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, color-mix(in srgb, var(--accent-gold-primary), transparent 80%) 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute -bottom-12 -right-12 w-56 h-56 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, color-mix(in srgb, var(--inverse-primary), transparent 85%) 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />

        <div className="relative z-10 p-10 md:p-14">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-accent-gold/70 font-sans text-[11px] uppercase tracking-[0.3em] mb-3 font-semibold">
              Transparencia total
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-white/95 leading-tight">
              Así funciona el pago
            </h2>
          </div>

          {/* Cards row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Anticipo */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="glass-dark rounded-3xl p-7 group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent-gold/15 border border-accent-gold/25 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-accent-gold" />
                </div>
                <h3 className="font-serif text-white/90 text-lg">Anticipo del 50%</h3>
              </div>
              <p className="font-sans text-white/50 text-sm leading-relaxed">
                Para reservar tu espacio en nuestra agenda solicitamos un anticipo del{' '}
                <span className="text-accent-gold font-semibold">50% del total</span>. Este depósito confirma tu cita y es no reembolsable ante cancelaciones con menos de 24 horas.
              </p>
            </motion.div>

            {/* Pago final */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="glass-dark rounded-3xl p-7 group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent-gold/15 border border-accent-gold/25 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-accent-gold" />
                </div>
                <h3 className="font-serif text-white/90 text-lg">Pago al finalizar</h3>
              </div>
              <p className="font-sans text-white/50 text-sm leading-relaxed">
                El saldo restante se liquida al concluir el servicio. Aceptamos{' '}
                <span className="text-white/75 font-medium">transferencia, tarjeta y efectivo</span>. Recibirás un comprobante digital de tu sesión.
              </p>
            </motion.div>
          </div>

          {/* Security badge */}
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center justify-center gap-2.5 text-white/35"
          >
            <ShieldCheck className="w-4 h-4 text-accent-gold/60" />
            <span className="font-sans text-[11px] uppercase tracking-[0.25em] font-semibold">
              Pagos 100% seguros y encriptados
            </span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
