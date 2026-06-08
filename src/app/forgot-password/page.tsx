'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Se ha enviado un enlace de recuperación a tu correo. Por favor, revisa tu bandeja de entrada.',
      });
    } catch {
      setMessage({
        type: 'error',
        text: 'No fue posible enviar el enlace. Verifica el correo e intenta de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-fondo-zen flex flex-col items-center justify-center p-6">
      {/* FIXED: bg-surface-container-lowest en vez de literal bg-[#FDFBEE] */}
      {/* FIXED: JSX corregido — era </div} (error de sintaxis) */}
      <div className="w-full max-w-sm bg-surface-container-lowest p-8 rounded-3xl shadow-2xl border border-secundario-zen/50">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative w-32">
              <img
                src="/zen-logo.svg"
                alt="Zen Logo"
                className="w-full h-auto object-contain"
                style={{ height: 'auto' }}
              />
            </div>
          </div>
          <p className="text-sm tracking-widest uppercase text-primario-zen/60 font-medium font-sans">
            Recuperar Acceso
          </p>
        </div>

        <form onSubmit={handleRequestReset} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5 font-sans">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-secundario-zen/20 border border-secundario-zen/60 text-primario-zen text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primario-zen/30 transition-all placeholder:text-primario-zen/30"
              placeholder="ejemplo@email.com"
              required
            />
          </div>

          {message && (
            <p className={`text-xs px-4 py-3 rounded-xl text-center font-sans ${
              message.type === 'success'
                ? 'bg-primario-zen/10 border border-primario-zen/30 text-primario-zen font-medium'
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-primario-zen text-fondo-zen py-3.5 rounded-full uppercase tracking-widest text-xs font-semibold hover:bg-opacity-90 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 font-sans"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
            ) : (
              'Enviar Enlace de Recuperación'
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push('/login')}
            className="w-full text-primario-zen/60 hover:text-primario-zen text-xs uppercase tracking-widest font-semibold transition-colors mt-2"
          >
            Volver al Login
          </button>
        </form>
      </div>
    </main>
  );
}
