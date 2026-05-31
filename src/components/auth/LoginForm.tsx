'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useApp } from '@/context/AppContext';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { loginDemo } = useApp();

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
      // Si el login es exitoso, AppContext actualizará el estado y DashboardLayout mostrará el contenido.
      // Refrescamos la ruta para asegurar que Next.js tome los cambios si estamos en /login.
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-sm bg-[#FDFBEE] p-8 rounded-3xl shadow-2xl border border-secundario-zen/50">
      <div className="text-center mb-8">
        <h1 className="font-serif tracking-[0.2em] text-3xl text-primario-zen mb-2">ZEN</h1>
        <div className="flex justify-center gap-1.5 opacity-50 mb-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-primario-zen" />
          ))}
        </div>
        <p className="text-sm tracking-widest uppercase text-primario-zen/60 font-medium">
          Acceso Exclusivo
        </p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-secundario-zen/20 border border-secundario-zen/60 text-primario-zen text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primario-zen/30 transition-all placeholder:text-primario-zen/30"
            placeholder="tu@correo.com"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-secundario-zen/20 border border-secundario-zen/60 text-primario-zen text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primario-zen/30 transition-all placeholder:text-primario-zen/30"
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-primario-zen text-fondo-zen py-3.5 rounded-full uppercase tracking-widest text-xs font-semibold hover:bg-opacity-90 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
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
            loginDemo();
            router.push('/');
            router.refresh();
          }}
          className="w-full mt-2 text-primario-zen/60 py-2 rounded-full uppercase tracking-widest text-[10px] font-medium hover:text-primario-zen transition-all"
        >
          Entrar como Demo
        </button>
      </form>
    </div>
  );
}
