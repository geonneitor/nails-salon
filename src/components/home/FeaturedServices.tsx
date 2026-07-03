import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FeaturedServices() {
  const services = [
    {
      title: "Pedicura Botánica Spa",
      desc: "Un ritual inmersivo. Baño en sales aromáticas, remoción de durezas con torno y esmaltado perfecto. Tu momento de desconexión total.",
      img: "/images/spa_pedicure_station.png"
    },
    {
      title: "Acrílicas Esculpidas",
      desc: "Arquitectura en tus manos. Extensión a medida con acabados minimalistas y geles de alta gama que protegen tu uña natural.",
      img: "/images/nail_art_minimalist.png"
    },
    {
      title: "Manicura Rusa Profunda",
      desc: "Limpieza milimétrica de cutículas usando fresas de diamante. Logramos un esmaltado perfecto bajo la piel que dura semanas.",
      img: "/images/spa_detail.png"
    }
  ];

  return (
    <section className="relative py-32 bg-background z-10">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-16 relative">
        
        {/* Lado Izquierdo: Textos (Scrollean normalmente) */}
        <div className="w-full md:w-1/2 flex flex-col pt-10 pb-32">
          <div className="mb-40">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary mb-6 block">Menú Especial</span>
            <h2 className="font-serif text-5xl md:text-7xl text-on-surface leading-[1.1] mb-10">El Arte de<br/>los Detalles.</h2>
            <Link href="/reserva" className="inline-flex text-sm font-bold text-on-surface uppercase tracking-widest items-center gap-4 hover:text-primary transition-all group">
              Explorar Menú Completo 
              <span className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          <div className="flex flex-col gap-[30vh]">
            {services.map((svc, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 1, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ margin: "-20% 0px -20% 0px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col"
              >
                <span className="text-primary/40 font-serif text-7xl mb-6 block leading-none">0{i+1}</span>
                <h3 className="font-serif text-4xl md:text-5xl text-on-surface mb-6">{svc.title}</h3>
                <p className="text-xl md:text-2xl text-on-surface-variant font-light leading-relaxed max-w-md">{svc.desc}</p>
                {/* Mobile image preview */}
                <div className="md:hidden mt-10 w-full h-96 rounded-[2rem] overflow-hidden shadow-lg">
                  <img src={svc.img} className="w-full h-full object-cover" alt={svc.title} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Lado Derecho: Sticky Images Stack (Solo Desktop) */}
        <div className="hidden md:block w-1/2 relative h-full">
           <div className="h-full w-full flex flex-col gap-[20vh] pt-[20vh]">
             {services.map((svc, i) => (
               <div key={i} className="sticky top-32 h-[75vh] w-full rounded-[2rem] overflow-hidden shadow-2xl border border-outline-variant/20">
                 <img src={svc.img} className="w-full h-full object-cover" alt={svc.title} />
                 <div className="absolute inset-0 bg-black/5"></div>
               </div>
             ))}
           </div>
        </div>

      </div>
    </section>
  );
}
