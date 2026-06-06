'use client';

export default function Hero() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Content Wrapper */}
      <div className="relative z-20 flex flex-col items-center w-full max-w-none px-6 py-12">
        {/* Logo Section: No box, pure atmospheric integration */}
        <div className="flex flex-col items-center mb-12 group cursor-pointer">
          <div className="relative w-64 md:w-80 transition-transform duration-700 group-hover:scale-105">
            {/* Soft glow behind logo that intensifies on hover */}
            <div className="absolute inset-0 bg-accent-gold/20 blur-3xl rounded-full transition-opacity duration-500 group-hover:opacity-100 opacity-40" />

            <div className="relative z-30 w-full h-auto drop-shadow-2xl">
              <svg width="300" height="150" viewBox="0 0 300 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                <circle cx="150" cy="75" r="60" fill="url(#zen-gradient)" fillOpacity="0.2" />
                <circle cx="150" cy="75" r="45" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="10 5" opacity="0.6" />
                <circle cx="150" cy="75" r="42" stroke="#D4AF37" strokeWidth="0.5" />
                <text x="150" y="82" textAnchor="middle" fontFamily="Georgia, serif" fontSize="32" fontWeight="300" fill="#4A533E" letterSpacing="0.2em">ZEN</text>
                <circle cx="150" cy="95" r="2" fill="#D4AF37" />
                <defs>
                  <linearGradient id="zen-gradient" x1="150" y1="15" x2="150" y2="135" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#D4AF37" />
                    <stop offset="1" stopColor="#D4AF37" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Zen Dots: Now as elegant separators with a subtle glow */}
          <div className="flex gap-3 mt-6 relative z-30">
            {Array.from({ length: 7 }).map((_, i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primario-zen shadow-[0_0_5px_var(--accent-gold)]"
              />
            ))}
          </div>
        </div>

        {/* Tagline */}
        <h1 className="text-primario-zen font-serif text-3xl md:text-5xl mb-4 uppercase tracking-widest text-center">
          Belleza y Bienestar en Armonía
        </h1>
        <p className="text-primario-zen/80 text-lg max-w-xl text-center font-sans">
          En Zen, creemos que la verdadera belleza nace del equilibrio interior.
          Nuestros tratamientos personalizados combinan técnicas ancestrales con
 la innovación moderna para renovar tu cuerpo, mente y espíritu.
        </p>
      </div>
    </div>
  );
}
