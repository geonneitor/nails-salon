import { motion } from 'framer-motion';

export default function ZenManifesto() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-32 z-10">
      <div className="px-6 md:px-12 max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] font-bold text-primary mb-10 block">
            Nuestra Filosofía
          </span>
          <h2 className="font-serif text-5xl md:text-7xl lg:text-[6rem] text-on-surface mb-16 leading-[1.1] tracking-tight">
            Un respiro en<br />
            <span className="italic text-primary/80">medio del caos.</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="flex flex-col gap-10 items-center"
        >
          <p className="text-2xl md:text-4xl text-on-surface-variant font-light leading-relaxed max-w-3xl">
            En un mundo que exige velocidad, nosotros elegimos la pausa. Creemos que arreglarse las uñas no debe ser un trámite apresurado.
          </p>
          <div className="w-px h-32 bg-gradient-to-b from-primary/50 to-transparent"></div>
          <p className="text-xl md:text-3xl text-on-surface-variant font-light leading-relaxed max-w-2xl">
            Aquí el tiempo se detiene, el aroma calma la mente, y cada detalle está diseñado para que te sientas en absoluta paz.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
