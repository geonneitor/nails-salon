import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-fondo-zen flex flex-col items-center justify-center p-6">
      
      {/* Logo inspirado en el Brand Board (ZEN con puntos) */}
      <div className="flex flex-col items-center mb-16">
        <div className="relative w-64 md:w-80">
          <Image
            src="/zen.png"
            alt="Zen Logo"
            width={320}
            height={160}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
        <div className="flex gap-3 mt-4">
          <span className="w-1.5 h-1.5 rounded-full bg-primario-zen"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-primario-zen"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-primario-zen"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-primario-zen"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-primario-zen"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-primario-zen"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-primario-zen"></span>
        </div>
      </div>

      {/* Botón de Ingreso (Estilo "Pebble" / Minimalista) */}
      <Link href="/calendar">
        <button className="bg-primario-zen text-fondo-zen px-10 py-3.5 rounded-full uppercase tracking-widest text-xs font-semibold hover:bg-opacity-90 transition-all shadow-sm">
          Ingresar
        </button>
      </Link>

    </main>
  );
}
