'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    const { error: resetError } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess('Tu contraseña ha sido restablecida exitosamente. Redirigiendo...');
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  };

  return (
    <main className="min-h-screen w-full bg-fondo-zen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[#FDFBEE] p-8 rounded-3xl shadow-2xl border border-secundario-zen/50">
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
            Restablecer Contraseña
          </p>
        </div>

        <form onSubmit={handleReset} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5 font-sans">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
              Nueva Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-secundario-zen/20 border border-secundario-zen/60 text-primario-zen text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primario-zen/30 transition-all placeholder:text-primario-zen/30"
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 font-sans">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-secundario-zen/20 border border-secundario-zen/60 text-primario-zen text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primario-zen/30 transition-all placeholder:text-primario-zen/30"
              placeholder="Confirmar contraseña"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center font-sans">
              {error}
            </p>
          )}

          {success && (
            <p className="text-primario-zen text-xs bg-primario-zen/10 border border-primario-zen/30 rounded-xl px-4 py-3 text-center font-sans font-medium">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-primario-zen text-fondo-zen py-3.5 rounded-full uppercase tracking-widest text-xs font-semibold hover:bg-opacity-90 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 font-sans"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Actualizando...</>
            ) : (
              'Guardar Contraseña'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
