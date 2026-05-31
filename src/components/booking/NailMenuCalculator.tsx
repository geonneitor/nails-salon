'use client';

// ============================================================
// src/components/booking/NailMenuCalculator.tsx
// Componente premium e interactivo para cotizar servicios de uñas a la carta.
// Basado en el diseño y lógica de la aplicación Canva y el sistema Zen.
// ============================================================

import { useState, useEffect } from 'react';
import { Sparkles, Palette, Gem, Wrench, Shield, Hand, Footprints, RotateCcw, Plus, Minus } from 'lucide-react';
import type { TicketDetails } from '@/types/supabase';

// ── DEFINICIÓN DE DATOS (Precios y Tiempos de Duración en minutos) ──

const SISTEMAS = [
  { name: 'Acrílico', basePrice: 450, duration: 120 },
  { name: 'Builder Gel', basePrice: 480, duration: 120 },
  { name: 'Polygel', basePrice: 450, duration: 120 },
];

const FORMAS = ['Cuadrada', 'Almendra', 'Stiletto', 'Coffin'];
const LARGOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const DISENOS_COMPLETOS = [
  { name: 'Mano Alzada', price: 200, durationPerNail: 10 },
  { name: 'French', price: 120, durationPerNail: 8 },
  { name: 'Mano Alzada con Relieves', price: 250, durationPerNail: 12 },
  { name: 'Efecto completo / Ojo de gato', price: 100, durationPerNail: 5 },
  { name: 'Efecto + Diseño sencillo', price: 150, durationPerNail: 7 },
];

const DECOS = [
  { name: 'Espejo', price: 15, durationPerNail: 3 },
  { name: 'Aurora', price: 15, durationPerNail: 3 },
  { name: 'Azúcar', price: 15, durationPerNail: 4 },
  { name: 'Suéter', price: 15, durationPerNail: 5 },
  { name: 'Perla', price: 15, durationPerNail: 2 },
  { name: 'Glitter', price: 15, durationPerNail: 2 },
  { name: 'Carey', price: 15, durationPerNail: 5 },
  { name: 'Blooming', price: 15, durationPerNail: 4 },
  { name: 'Ojo de gato', price: 15, durationPerNail: 3 },
  { name: 'Relieve', price: 15, durationPerNail: 5 },
  { name: '3D', price: 20, durationPerNail: 8 },
  { name: 'Francés', price: 15, durationPerNail: 6 },
  { name: 'Nail art simple', price: 15, durationPerNail: 5 },
  { name: 'Diseño complicado', price: 25, durationPerNail: 10 },
  { name: 'Encapsulado', price: 30, durationPerNail: 8 },
  { name: 'Naturaleza muerta', price: 20, durationPerNail: 5 },
  { name: 'Dijes', price: 25, durationPerNail: 3 },
  { name: 'Sticker', price: 10, durationPerNail: 2 },
  { name: 'Baby boomer', price: 15, durationPerNail: 5 },
  { name: 'Cristales Ch', price: 20, durationPerNail: 3 },
  { name: 'Cristales M', price: 30, durationPerNail: 4 },
  { name: 'Cristales G', price: 40, durationPerNail: 5 },
  { name: 'Uña completa cristal Ch (1-3)', price: 50, durationPerNail: 8 },
  { name: 'Uña completa cristal M (4-6)', price: 80, durationPerNail: 12 },
  { name: 'Uña completa cristal G (7-9)', price: 100, durationPerNail: 15 },
];

const REPOS = [
  { name: 'Acrílico / Polygel', price: 50, durationPerNail: 15 },
  { name: 'Builder Gel', price: 60, durationPerNail: 15 },
  { name: 'Rubber', price: 40, durationPerNail: 10 },
];

const GELS = [
  { name: 'Protección Polygel', price: 400, duration: 60 },
  { name: 'Protección Builder Gel', price: 400, duration: 60 },
  { name: 'Gel sobre uña natural', price: 350, duration: 45 },
  { name: 'Cambio de gel', price: 380, duration: 50 },
  { name: 'Nivelación con Rubber', price: 380, duration: 60 },
  { name: 'Relleno Rubber', price: 380, duration: 55 },
];

const MANIS = [
  { name: 'Con gel', price: 400, duration: 50 },
  { name: 'Sin gel', price: 300, duration: 35 },
];

const PEDIS = [
  { name: 'Pedicura spa', price: 480, duration: 60 },
  { name: 'Pedicura + Acripie', price: 800, duration: 90 },
  { name: 'Pedicura + French', price: 550, duration: 75 },
  { name: 'Pedicura, Acripie 2 dedos, French', price: 750, duration: 85 },
];

interface NailMenuCalculatorProps {
  value?: TicketDetails | null;
  onChange: (data: { ticketDetails: TicketDetails; totalPrice: number; totalDuration: number }) => void;
}

export function NailMenuCalculator({ value, onChange }: NailMenuCalculatorProps) {
  // ── ESTADOS LOCALES DE LA COTIZADORA ──
  const [activeServices, setActiveServices] = useState<Set<string>>(
    new Set(value?.activeServices ?? [])
  );

  const [fsSistema, setFsSistema] = useState<string | null>(value?.fs_sistema ?? null);
  const [fsForma, setFsForma] = useState<string | null>(value?.fs_forma ?? null);
  const [fsLargo, setFsLargo] = useState<number | null>(value?.fs_largo ?? null);
  const [fsTonos, setFsTonos] = useState<number>(value?.fs_tonos ?? 0);

  const [dis, setDis] = useState<Record<string, number>>(value?.dis ?? {});
  const [disTonos, setDisTonos] = useState<number>(value?.dis_tonos ?? 0);

  const [deco, setDeco] = useState<Record<string, number>>(value?.deco ?? {});
  const [decoTonos, setDecoTonos] = useState<number>(value?.deco_tonos ?? 0);

  const [repo, setRepo] = useState<Record<string, number>>(value?.repo ?? {});
  const [repoTonos, setRepoTonos] = useState<number>(value?.repo_tonos ?? 0);

  const [gel, setGel] = useState<string | null>(value?.gel ?? null);
  const [gelTonos, setGelTonos] = useState<number>(value?.gel_tonos ?? 0);

  const [mani, setMani] = useState<string | null>(value?.mani ?? null);
  const [maniTonos, setManiTonos] = useState<number>(value?.mani_tonos ?? 0);

  const [pedi, setPedi] = useState<string | null>(value?.pedi ?? null);
  const [pediTonos, setPediTonos] = useState<number>(value?.pedi_tonos ?? 0);

  // ── TOGGLE DE CATEGORÍAS ──
  const toggleService = (category: string) => {
    const next = new Set(activeServices);
    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }
    setActiveServices(next);
  };

  // ── RESET DE SECCIÓN ──
  const resetSection = (sec: string) => {
    if (sec === 'fullset') {
      setFsSistema(null);
      setFsForma(null);
      setFsLargo(null);
      setFsTonos(0);
    } else if (sec === 'disenos') {
      setDis({});
      setDisTonos(0);
    } else if (sec === 'deco') {
      setDeco({});
      setDecoTonos(0);
    } else if (sec === 'repo') {
      setRepo({});
      setRepoTonos(0);
    } else if (sec === 'gel') {
      setGel(null);
      setGelTonos(0);
    } else if (sec === 'mani') {
      setMani(null);
      setManiTonos(0);
    } else if (sec === 'pedi') {
      setPedi(null);
      setPediTonos(0);
    }
  };

  // ── OPERACIONES CON OBJETOS / CONTADORES ──
  const adjObj = (state: Record<string, number>, setter: React.Dispatch<React.SetStateAction<Record<string, number>>>, key: string, delta: number) => {
    setter((prev) => {
      const current = prev[key] ?? 0;
      const nextVal = Math.max(0, current + delta);
      return { ...prev, [key]: nextVal };
    });
  };

  // ── CÁLCULO DÍNAMICO DE PRECIOS Y TIEMPO ──
  const calculateTotals = () => {
    let price = 0;
    let duration = 0;
    const lines: { label: string; price: number; duration: number }[] = [];

    // 1. Full Set
    if (activeServices.has('fullset')) {
      if (fsSistema && fsForma && fsLargo) {
        const matchingSys = SISTEMAS.find((s) => s.name === fsSistema);
        let fsBasePrice = matchingSys?.basePrice ?? 450;
        let fsDuration = matchingSys?.duration ?? 120;

        // Cada paso de largo arriba de 2 añade $50 y 10 minutos
        if (fsLargo > 2) {
          fsBasePrice += (fsLargo - 2) * 50;
          fsDuration += (fsLargo - 2) * 10;
        }

        lines.push({
          label: `Full Set — ${fsSistema}, ${fsForma}, Largo ${fsLargo}`,
          price: fsBasePrice,
          duration: fsDuration,
        });
        price += fsBasePrice;
        duration += fsDuration;
      }

      if (fsTonos > 0) {
        const extraP = fsTonos * 5;
        const extraD = fsTonos * 5; // 5 minutos por tono extra
        lines.push({ label: `  Tonos extra (Full Set) ×${fsTonos}`, price: extraP, duration: extraD });
        price += extraP;
        duration += extraD;
      }
    }

    // 2. Diseños completos
    if (activeServices.has('disenos')) {
      DISENOS_COMPLETOS.forEach((d) => {
        const qty = dis[d.name] ?? 0;
        if (qty > 0) {
          const itemP = d.price * qty;
          const itemD = d.durationPerNail * qty;
          lines.push({ label: `${d.name} ×${qty} uñas`, price: itemP, duration: itemD });
          price += itemP;
          duration += itemD;
        }
      });

      if (disTonos > 0) {
        const extraP = disTonos * 5;
        const extraD = disTonos * 5;
        lines.push({ label: `  Tonos extra (Diseños) ×${disTonos}`, price: extraP, duration: extraD });
        price += extraP;
        duration += extraD;
      }
    }

    // 3. Decoraciones por Uña
    if (activeServices.has('deco')) {
      DECOS.forEach((d) => {
        const qty = deco[d.name] ?? 0;
        if (qty > 0) {
          const itemP = d.price * qty;
          const itemD = d.durationPerNail * qty;
          lines.push({ label: `${d.name} ×${qty} uñas`, price: itemP, duration: itemD });
          price += itemP;
          duration += itemD;
        }
      });

      if (decoTonos > 0) {
        const extraP = decoTonos * 5;
        const extraD = decoTonos * 5;
        lines.push({ label: `  Tonos extra (Deco) ×${decoTonos}`, price: extraP, duration: extraD });
        price += extraP;
        duration += extraD;
      }
    }

    // 4. Reposiciones
    if (activeServices.has('repo')) {
      REPOS.forEach((r) => {
        const qty = repo[r.name] ?? 0;
        if (qty > 0) {
          const itemP = r.price * qty;
          const itemD = r.durationPerNail * qty;
          lines.push({ label: `Repo ${r.name} ×${qty}`, price: itemP, duration: itemD });
          price += itemP;
          duration += itemD;
        }
      });

      if (repoTonos > 0) {
        const extraP = repoTonos * 5;
        const extraD = repoTonos * 5;
        lines.push({ label: `  Tonos extra (Repo) ×${repoTonos}`, price: extraP, duration: extraD });
        price += extraP;
        duration += extraD;
      }
    }

    // 5. Gel Protección
    if (activeServices.has('gel') && gel) {
      const match = GELS.find((g) => g.name === gel);
      if (match) {
        lines.push({ label: `Gel: ${match.name}`, price: match.price, duration: match.duration });
        price += match.price;
        duration += match.duration;
      }

      if (gelTonos > 0) {
        const extraP = gelTonos * 5;
        const extraD = gelTonos * 5;
        lines.push({ label: `  Tonos extra (Gel Protec) ×${gelTonos}`, price: extraP, duration: extraD });
        price += extraP;
        duration += extraD;
      }
    }

    // 6. Manicura
    if (activeServices.has('mani') && mani) {
      const match = MANIS.find((m) => m.name === mani);
      if (match) {
        lines.push({ label: `Manicura: ${match.name}`, price: match.price, duration: match.duration });
        price += match.price;
        duration += match.duration;
      }

      if (maniTonos > 0) {
        const extraP = maniTonos * 5;
        const extraD = maniTonos * 5;
        lines.push({ label: `  Tonos extra (Manicura) ×${maniTonos}`, price: extraP, duration: extraD });
        price += extraP;
        duration += extraD;
      }
    }

    // 7. Pedicura
    if (activeServices.has('pedi') && pedi) {
      const match = PEDIS.find((p) => p.name === pedi);
      if (match) {
        lines.push({ label: match.name, price: match.price, duration: match.duration });
        price += match.price;
        duration += match.duration;
      }

      if (pediTonos > 0) {
        const extraP = pediTonos * 5;
        const extraD = pediTonos * 5;
        lines.push({ label: `  Tonos extra (Pedicura) ×${pediTonos}`, price: extraP, duration: extraD });
        price += extraP;
        duration += extraD;
      }
    }

    return { price, duration, lines };
  };

  const { price: totalPrice, duration: totalDuration, lines: summaryLines } = calculateTotals();

  // ── EMITIR CAMBIOS HACIA EL PADRE ──
  useEffect(() => {
    const details: TicketDetails = {
      activeServices: Array.from(activeServices),
      fs_sistema: fsSistema,
      fs_forma: fsForma,
      fs_largo: fsLargo,
      fs_tonos: fsTonos,
      dis,
      dis_tonos: disTonos,
      deco,
      deco_tonos: decoTonos,
      repo,
      repo_tonos: repoTonos,
      gel,
      gel_tonos: gelTonos,
      mani,
      mani_tonos: maniTonos,
      pedi,
      pedi_tonos: pediTonos,
    };
    onChange({ ticketDetails: details, totalPrice, totalDuration });
  }, [
    activeServices,
    fsSistema,
    fsForma,
    fsLargo,
    fsTonos,
    dis,
    disTonos,
    deco,
    decoTonos,
    repo,
    repoTonos,
    gel,
    gelTonos,
    mani,
    maniTonos,
    pedi,
    pediTonos,
    totalPrice,
    totalDuration,
  ]);

  const SERVICE_CATEGORIES = [
    { id: 'fullset', label: 'Full Set', icon: Sparkles },
    { id: 'disenos', label: 'Diseños', icon: Palette },
    { id: 'deco', label: 'Decoraciones', icon: Gem },
    { id: 'repo', label: 'Reposiciones', icon: Wrench },
    { id: 'gel', label: 'Gel Protección', icon: Shield },
    { id: 'mani', label: 'Manicura', icon: Hand },
    { id: 'pedi', label: 'Pedicura', icon: Footprints },
  ];

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* ── BOTONES DE SERVICIO PRINCIPALES ── */}
      <div>
        <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50 mb-2 block">
          Categorías de Servicios
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SERVICE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeServices.has(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleService(cat.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  isActive
                    ? 'bg-primario-zen text-fondo-zen border-primario-zen shadow-sm'
                    : 'bg-secundario-zen/20 border-secundario-zen/50 text-primario-zen/70 hover:bg-secundario-zen/30'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-semibold tracking-wide">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SECCIÓN: FULL SET ── */}
      {activeServices.has('fullset') && (
        <div className="bg-[#FAF8ED] border border-secundario-zen/60 rounded-3xl p-5 flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg text-primario-zen flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4" /> Full Set
            </h3>
            <button
              type="button"
              onClick={() => resetSection('fullset')}
              className="text-[10px] font-semibold text-primario-zen/40 hover:text-primario-zen flex items-center gap-1 bg-secundario-zen/20 px-2.5 py-1 rounded-full"
            >
              <RotateCcw className="w-3 h-3" /> Reiniciar
            </button>
          </div>

          {/* Sistema */}
          <div>
            <p className="text-[9px] font-bold text-primario-zen/50 uppercase tracking-widest mb-1.5">Sistema</p>
            <div className="flex flex-wrap gap-2">
              {SISTEMAS.map((sys) => (
                <button
                  key={sys.name}
                  type="button"
                  onClick={() => setFsSistema(fsSistema === sys.name ? null : sys.name)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    fsSistema === sys.name
                      ? 'bg-primario-zen text-fondo-zen border-primario-zen'
                      : 'bg-secundario-zen/10 border-secundario-zen/40 text-primario-zen/80 hover:bg-secundario-zen/25'
                  }`}
                >
                  {sys.name} (${sys.basePrice})
                </button>
              ))}
            </div>
          </div>

          {/* Forma */}
          <div>
            <p className="text-[9px] font-bold text-primario-zen/50 uppercase tracking-widest mb-1.5">Forma</p>
            <div className="flex flex-wrap gap-2">
              {FORMAS.map((forma) => (
                <button
                  key={forma}
                  type="button"
                  onClick={() => setFsForma(fsForma === forma ? null : forma)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    fsForma === forma
                      ? 'bg-primario-zen text-fondo-zen border-primario-zen'
                      : 'bg-secundario-zen/10 border-secundario-zen/40 text-primario-zen/80 hover:bg-secundario-zen/25'
                  }`}
                >
                  {forma}
                </button>
              ))}
            </div>
          </div>

          {/* Largo */}
          <div>
            <p className="text-[9px] font-bold text-primario-zen/50 uppercase tracking-widest mb-1.5">Largo (Largo {'>'} 2 añade +$50 por nivel)</p>
            <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
              {LARGOS.map((largo) => (
                <button
                  key={largo}
                  type="button"
                  onClick={() => setFsLargo(fsLargo === largo ? null : largo)}
                  className={`min-w-[32px] h-8 rounded-full text-xs font-bold border transition-all flex items-center justify-center ${
                    fsLargo === largo
                      ? 'bg-primario-zen text-fondo-zen border-primario-zen'
                      : 'bg-secundario-zen/10 border-secundario-zen/40 text-primario-zen/80 hover:bg-secundario-zen/25'
                  }`}
                >
                  {largo}
                </button>
              ))}
            </div>
          </div>

          {/* Tonos extra */}
          <div className="flex items-center justify-between border-t border-secundario-zen/30 pt-3">
            <span className="text-xs font-semibold text-primario-zen/85">Tonos extra (+$5 c/u)</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFsTonos(Math.max(0, fsTonos - 1))}
                className="w-7 h-7 rounded-full bg-secundario-zen/30 hover:bg-secundario-zen/50 text-primario-zen flex items-center justify-center font-bold"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-bold text-primario-zen w-5 text-center">{fsTonos}</span>
              <button
                type="button"
                onClick={() => setFsTonos(fsTonos + 1)}
                className="w-7 h-7 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 flex items-center justify-center font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SECCIÓN: DISEÑOS COMPLETOS ── */}
      {activeServices.has('disenos') && (
        <div className="bg-[#FAF8ED] border border-secundario-zen/60 rounded-3xl p-5 flex flex-col gap-3 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-serif text-lg text-primario-zen flex items-center gap-1.5 font-bold">
              <Palette className="w-4 h-4" /> Diseños Completos
            </h3>
            <button
              type="button"
              onClick={() => resetSection('disenos')}
              className="text-[10px] font-semibold text-primario-zen/40 hover:text-primario-zen flex items-center gap-1 bg-secundario-zen/20 px-2.5 py-1 rounded-full"
            >
              <RotateCcw className="w-3 h-3" /> Reiniciar
            </button>
          </div>

          <p className="text-[10px] text-primario-zen/60 italic mb-2">Multiplica la cantidad de uñas por diseño.</p>

          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            {DISENOS_COMPLETOS.map((d) => {
              const qty = dis[d.name] ?? 0;
              return (
                <div key={d.name} className="flex items-center justify-between py-1 border-b border-secundario-zen/20">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-primario-zen">{d.name}</span>
                    <span className="text-[10px] text-primario-zen/50">${d.price} MXN / uña</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => adjObj(dis, setDis, d.name, -1)}
                      className="w-7 h-7 rounded-full bg-secundario-zen/30 hover:bg-secundario-zen/50 text-primario-zen flex items-center justify-center"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-bold text-primario-zen w-5 text-center">{qty}</span>
                    <button
                      type="button"
                      onClick={() => adjObj(dis, setDis, d.name, 1)}
                      className="w-7 h-7 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-secundario-zen/30 pt-3">
            <span className="text-xs font-semibold text-primario-zen/85">Tonos extra (+$5 c/u)</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDisTonos(Math.max(0, disTonos - 1))}
                className="w-7 h-7 rounded-full bg-secundario-zen/30 hover:bg-secundario-zen/50 text-primario-zen flex items-center justify-center"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-bold text-primario-zen w-5 text-center">{disTonos}</span>
              <button
                type="button"
                onClick={() => setDisTonos(disTonos + 1)}
                className="w-7 h-7 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SECCIÓN: DECORACIONES ── */}
      {activeServices.has('deco') && (
        <div className="bg-[#FAF8ED] border border-secundario-zen/60 rounded-3xl p-5 flex flex-col gap-3 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-serif text-lg text-primario-zen flex items-center gap-1.5 font-bold">
              <Gem className="w-4 h-4" /> Decoraciones por Uña
            </h3>
            <button
              type="button"
              onClick={() => resetSection('deco')}
              className="text-[10px] font-semibold text-primario-zen/40 hover:text-primario-zen flex items-center gap-1 bg-secundario-zen/20 px-2.5 py-1 rounded-full"
            >
              <RotateCcw className="w-3 h-3" /> Reiniciar
            </button>
          </div>

          <p className="text-[10px] text-primario-zen/60 italic mb-2">Selecciona la cantidad de uñas decoradas.</p>

          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            {DECOS.map((d) => {
              const qty = deco[d.name] ?? 0;
              return (
                <div key={d.name} className="flex items-center justify-between py-1 border-b border-secundario-zen/20">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-primario-zen">{d.name}</span>
                    <span className="text-[10px] text-primario-zen/50">${d.price} MXN / uña</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => adjObj(deco, setDeco, d.name, -1)}
                      className="w-7 h-7 rounded-full bg-secundario-zen/30 hover:bg-secundario-zen/50 text-primario-zen flex items-center justify-center"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-bold text-primario-zen w-5 text-center">{qty}</span>
                    <button
                      type="button"
                      onClick={() => adjObj(deco, setDeco, d.name, 1)}
                      className="w-7 h-7 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-secundario-zen/30 pt-3">
            <span className="text-xs font-semibold text-primario-zen/85">Tonos extra (+$5 c/u)</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDecoTonos(Math.max(0, decoTonos - 1))}
                className="w-7 h-7 rounded-full bg-secundario-zen/30 hover:bg-secundario-zen/50 text-primario-zen flex items-center justify-center"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-bold text-primario-zen w-5 text-center">{decoTonos}</span>
              <button
                type="button"
                onClick={() => setDecoTonos(decoTonos + 1)}
                className="w-7 h-7 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SECCIÓN: REPOSICIONES ── */}
      {activeServices.has('repo') && (
        <div className="bg-[#FAF8ED] border border-secundario-zen/60 rounded-3xl p-5 flex flex-col gap-3 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-serif text-lg text-primario-zen flex items-center gap-1.5 font-bold">
              <Wrench className="w-4 h-4" /> Reposiciones
            </h3>
            <button
              type="button"
              onClick={() => resetSection('repo')}
              className="text-[10px] font-semibold text-primario-zen/40 hover:text-primario-zen flex items-center gap-1 bg-secundario-zen/20 px-2.5 py-1 rounded-full"
            >
              <RotateCcw className="w-3 h-3" /> Reiniciar
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {REPOS.map((r) => {
              const qty = repo[r.name] ?? 0;
              return (
                <div key={r.name} className="flex items-center justify-between py-1 border-b border-secundario-zen/20">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-primario-zen">{r.name}</span>
                    <span className="text-[10px] text-primario-zen/50">${r.price} MXN / uña</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => adjObj(repo, setRepo, r.name, -1)}
                      className="w-7 h-7 rounded-full bg-secundario-zen/30 hover:bg-secundario-zen/50 text-primario-zen flex items-center justify-center"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-bold text-primario-zen w-5 text-center">{qty}</span>
                    <button
                      type="button"
                      onClick={() => adjObj(repo, setRepo, r.name, 1)}
                      className="w-7 h-7 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-secundario-zen/30 pt-3">
            <span className="text-xs font-semibold text-primario-zen/85">Tonos extra (+$5 c/u)</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRepoTonos(Math.max(0, repoTonos - 1))}
                className="w-7 h-7 rounded-full bg-secundario-zen/30 hover:bg-secundario-zen/50 text-primario-zen flex items-center justify-center"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-bold text-primario-zen w-5 text-center">{repoTonos}</span>
              <button
                type="button"
                onClick={() => setRepoTonos(repoTonos + 1)}
                className="w-7 h-7 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SECCIÓN: GEL PROTECCIÓN ── */}
      {activeServices.has('gel') && (
        <div className="bg-[#FAF8ED] border border-secundario-zen/60 rounded-3xl p-5 flex flex-col gap-3 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex justify-between items-center mb-1.5">
            <h3 className="font-serif text-lg text-primario-zen flex items-center gap-1.5 font-bold">
              <Shield className="w-4 h-4" /> Gel Protección
            </h3>
            <button
              type="button"
              onClick={() => resetSection('gel')}
              className="text-[10px] font-semibold text-primario-zen/40 hover:text-primario-zen flex items-center gap-1 bg-secundario-zen/20 px-2.5 py-1 rounded-full"
            >
              <RotateCcw className="w-3 h-3" /> Reiniciar
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {GELS.map((g) => (
              <button
                key={g.name}
                type="button"
                onClick={() => setGel(gel === g.name ? null : g.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  gel === g.name
                    ? 'bg-primario-zen text-fondo-zen border-primario-zen'
                    : 'bg-secundario-zen/10 border-secundario-zen/40 text-primario-zen/80 hover:bg-secundario-zen/25'
                }`}
              >
                {g.name} (${g.price})
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-secundario-zen/30 pt-3">
            <span className="text-xs font-semibold text-primario-zen/85">Tonos extra (+$5 c/u)</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGelTonos(Math.max(0, gelTonos - 1))}
                className="w-7 h-7 rounded-full bg-secundario-zen/30 hover:bg-secundario-zen/50 text-primario-zen flex items-center justify-center"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-bold text-primario-zen w-5 text-center">{gelTonos}</span>
              <button
                type="button"
                onClick={() => setGelTonos(gelTonos + 1)}
                className="w-7 h-7 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SECCIÓN: MANICURA ── */}
      {activeServices.has('mani') && (
        <div className="bg-[#FAF8ED] border border-secundario-zen/60 rounded-3xl p-5 flex flex-col gap-3 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex justify-between items-center mb-1.5">
            <h3 className="font-serif text-lg text-primario-zen flex items-center gap-1.5 font-bold">
              <Hand className="w-4 h-4" /> Manicura
            </h3>
            <button
              type="button"
              onClick={() => resetSection('mani')}
              className="text-[10px] font-semibold text-primario-zen/40 hover:text-primario-zen flex items-center gap-1 bg-secundario-zen/20 px-2.5 py-1 rounded-full"
            >
              <RotateCcw className="w-3 h-3" /> Reiniciar
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {MANIS.map((m) => (
              <button
                key={m.name}
                type="button"
                onClick={() => setMani(mani === m.name ? null : m.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  mani === m.name
                    ? 'bg-primario-zen text-fondo-zen border-primario-zen'
                    : 'bg-secundario-zen/10 border-secundario-zen/40 text-primario-zen/80 hover:bg-secundario-zen/25'
                }`}
              >
                {m.name} (${m.price})
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-secundario-zen/30 pt-3">
            <span className="text-xs font-semibold text-primario-zen/85">Tonos extra (+$5 c/u)</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setManiTonos(Math.max(0, maniTonos - 1))}
                className="w-7 h-7 rounded-full bg-secundario-zen/30 hover:bg-secundario-zen/50 text-primario-zen flex items-center justify-center"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-bold text-primario-zen w-5 text-center">{maniTonos}</span>
              <button
                type="button"
                onClick={() => setManiTonos(maniTonos + 1)}
                className="w-7 h-7 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SECCIÓN: PEDICURA ── */}
      {activeServices.has('pedi') && (
        <div className="bg-[#FAF8ED] border border-secundario-zen/60 rounded-3xl p-5 flex flex-col gap-3 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex justify-between items-center mb-1.5">
            <h3 className="font-serif text-lg text-primario-zen flex items-center gap-1.5 font-bold">
              <Footprints className="w-4 h-4" /> Pedicura Spa
            </h3>
            <button
              type="button"
              onClick={() => resetSection('pedi')}
              className="text-[10px] font-semibold text-primario-zen/40 hover:text-primario-zen flex items-center gap-1 bg-secundario-zen/20 px-2.5 py-1 rounded-full"
            >
              <RotateCcw className="w-3 h-3" /> Reiniciar
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {PEDIS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setPedi(pedi === p.name ? null : p.name)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border text-left transition-all ${
                  pedi === p.name
                    ? 'bg-primario-zen text-fondo-zen border-primario-zen'
                    : 'bg-secundario-zen/10 border-secundario-zen/40 text-primario-zen/80 hover:bg-secundario-zen/25'
                }`}
              >
                {p.name} (${p.price})
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-secundario-zen/30 pt-3">
            <span className="text-xs font-semibold text-primario-zen/85">Tonos extra (+$5 c/u)</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPediTonos(Math.max(0, pediTonos - 1))}
                className="w-7 h-7 rounded-full bg-secundario-zen/30 hover:bg-secundario-zen/50 text-primario-zen flex items-center justify-center"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-bold text-primario-zen w-5 text-center">{pediTonos}</span>
              <button
                type="button"
                onClick={() => setPediTonos(pediTonos + 1)}
                className="w-7 h-7 rounded-full bg-primario-zen text-fondo-zen hover:bg-opacity-90 flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DESGLOSE DE COTIZACIÓN Y DÍNAMICO TOTAL ── */}
      <div className="bg-secundario-zen/10 border-2 border-primario-zen/30 rounded-3xl p-5 mt-2 flex flex-col gap-3">
        <h4 className="font-serif text-sm font-bold text-primario-zen text-center border-b border-secundario-zen/20 pb-2">
          Desglose de Cotización Zen
        </h4>
        <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
          {summaryLines.length === 0 ? (
            <p className="text-center text-xs text-primario-zen/40 italic py-2">
              Selecciona categorías y servicios para ver el desglose.
            </p>
          ) : (
            summaryLines.map((line, idx) => (
              <div key={idx} className="flex justify-between text-xs text-primario-zen/80">
                <span>{line.label}</span>
                <span className="font-bold">${line.price} MXN</span>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-between items-center pt-2.5 border-t border-primario-zen/20">
          <div className="flex flex-col">
            <span className="font-serif text-sm font-bold text-primario-zen">Total de Cita</span>
            <span className="text-[10px] text-primario-zen/60 font-semibold tracking-wider uppercase">
              Duración: {totalDuration} min
            </span>
          </div>
          <span className="font-serif text-xl font-bold text-primario-zen">${totalPrice} MXN</span>
        </div>
      </div>
    </div>
  );
}
