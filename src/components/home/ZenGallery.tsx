import { motion } from 'framer-motion';

export default function ZenGallery() {
  return (
    <section className="py-32 overflow-hidden bg-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="text-left mb-24">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary mb-6 block">Portafolio</span>
          <h2 className="font-serif text-5xl md:text-[6rem] text-on-surface leading-[1.1]">Inspiración<br/><span className="italic text-on-surface-variant">Visual.</span></h2>
        </div>

        {/* Bento Grid Estilo Awwwards */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[900px]">
          
          {/* Box 1 (Large 2x2) */}
          <motion.div 
            initial={{ opacity: 1, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="md:col-span-2 md:row-span-2 relative rounded-[2rem] overflow-hidden group h-[500px] md:h-full cursor-crosshair bg-surface-variant"
          >
            <img src="/images/spa_pedicure_station.png" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" alt="Pedicura" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute bottom-0 left-0 p-12 translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
               <span className="text-white/70 text-[10px] tracking-widest uppercase font-bold mb-4 block">Pedicura Spa</span>
               <h3 className="font-serif text-4xl md:text-5xl text-white">Relajación<br/>Botánica</h3>
            </div>
          </motion.div>

          {/* Box 2 (1x1) */}
          <motion.div 
            initial={{ opacity: 1, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1 }}
            className="md:col-span-1 md:row-span-1 relative rounded-[2rem] overflow-hidden group h-[300px] md:h-full cursor-crosshair bg-surface-variant"
          >
            <img src="/images/spa_detail.png" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" alt="Detalle" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 scale-95 group-hover:scale-100">
               <span className="font-serif text-2xl text-white">Higiene Clínica</span>
            </div>
          </motion.div>

          {/* Box 3 (1x2 tall) */}
          <motion.div 
            initial={{ opacity: 1, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="md:col-span-1 md:row-span-2 relative rounded-[2rem] overflow-hidden group h-[500px] md:h-full cursor-crosshair bg-surface-variant"
          >
            <img src="/images/nail_art_minimalist.png" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" alt="Nail Art" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute bottom-12 left-8 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
               <span className="font-serif text-3xl text-white block">Arte</span>
               <span className="font-serif text-3xl text-white/70 italic">Minimalista</span>
            </div>
          </motion.div>

          {/* Box 4 (1x1) */}
          <motion.div 
            initial={{ opacity: 1, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="md:col-span-1 md:row-span-1 relative rounded-[2rem] overflow-hidden group h-[300px] md:h-full cursor-crosshair bg-surface-variant"
          >
            <img src="/images/zen_salon_interior.png" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" alt="Interior" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 scale-95 group-hover:scale-100">
               <span className="font-serif text-2xl text-white">Santuario</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
