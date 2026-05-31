import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-fondo-zen flex flex-col items-center justify-center p-6">
      
      {/* Logo inspirado en el Brand Board (ZEN con puntos) */}
      <div className="flex flex-col items-center mb-16">
        <h1 className="text-primario-zen font-serif text-6xl md:text-7xl tracking-[0.2em] ml-[0.2em]">
          ZEN
        </h1>
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

      {/* Llamado a la acción principal */}
      <h2 className="text-primario-zen font-serif text-xl md:text-2xl text-center mb-10">
        Reserva tu cita aquí
      </h2>

      {/* Botón de Reserva (Estilo "Pebble" / Minimalista) */}
      <Link href="/calendar">
        <button className="bg-primario-zen text-fondo-zen px-10 py-3.5 rounded-full uppercase tracking-widest text-xs font-semibold hover:bg-opacity-90 transition-all shadow-sm">
          Book Appointment
        </button>
      </Link>

    </main>
  );
}
