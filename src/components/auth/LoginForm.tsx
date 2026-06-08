'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRecovery, setIsRecovery] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Credenciales inválidas. Verifica tu correo y contraseña.');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (recoveryError) {
      setError('No fue posible enviar el enlace. Intenta de nuevo más tarde.');
    } else {
      setSuccessMessage('Se ha enviado un correo con instrucciones para restablecer tu contraseña.');
      setEmail('');
    }
  };

  return (
    <div className="w-full max-w-sm bg-white/40 backdrop-blur-xl p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(74,83,62,0.15)]">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4 group cursor-pointer">
          <div className="relative w-32 transition-transform duration-500 group-hover:scale-110">
            <div className="absolute inset-0 bg-accent-gold/20 blur-2xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity" />
            <img
              src="/zen-logo.svg"
              alt="Zen Logo"
              className="relative w-full h-auto object-contain drop-shadow-sm"
              style={{ height: 'auto' }}
            />
          </div>
        </div>
        <p className="text-sm tracking-[0.2em] uppercase text-primario-zen/60 font-medium font-sans">
          {isRecovery ? 'Recuperar Acceso' : 'Acceso Exclusivo'}
        </p>
      </div>

      {isRecovery ? (
        <form onSubmit={handleRecovery} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5 font-sans">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-fondo-zen/50 border border-secundario-zen/60 text-primario-zen text-sm rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-gold/30 transition-all placeholder:text-primario-zen/30"
              placeholder="tu@correo.com"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-center font-sans">
              {error}
            </p>
          )}

          {successMessage && (
            <p className="text-primario-zen text-xs bg-primario-zen/10 border border-primario-zen/30 rounded-2xl px-4 py-3 text-center font-sans font-medium">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-primario-zen text-fondo-zen py-3.5 rounded-full uppercase tracking-widest text-xs font-semibold hover:bg-opacity-90 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 font-sans"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
            ) : (
              'Enviar Enlace'
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRecovery(false);
              setError(null);
              setSuccessMessage(null);
            }}
            className="w-full text-primario-zen/60 py-2 rounded-full uppercase tracking-widest text-[10px] font-semibold hover:text-primario-zen transition-all font-sans"
          >
            Volver al Inicio de Sesión
          </button>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {/* FIXED: era flex--col (typo), ahora flex-col */}
          <div className="flex flex-col gap-1.5 font-sans">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-fondo-zen/50 border border-secundario-zen/60 text-primario-zen text-sm rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-gold/30 transition-all placeholder:text-primario-zen/30"
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 font-sans">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-fondo-zen/50 border border-secundario-zen/60 text-primario-zen text-sm rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-gold/30 transition-all placeholder:text-primario-zen/30"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primario-zen/40 hover:text-primario-zen transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-center font-sans">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-primario-zen text-fondo-zen py-3.5 rounded-full uppercase tracking-widest text-xs font-semibold hover:bg-opacity-90 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 font-sans"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              router.push('/forgot-password');
            }}
            className="w-full text-primario-zen/60 py-2 rounded-full uppercase tracking-widest text-[10px] font-semibold hover:text-primario-zen transition-all font-sans"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </form>
      )}
    </div>
  );
}
