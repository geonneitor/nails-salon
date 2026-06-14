/**
 * nail-menu-calculator.ts
 * ─────────────────────────────────────────────────────────────
 * Lógica de cálculo de precios y tiempo para el menú de uñas.
 */

import {
  SISTEMAS, FORMAS, LARGOS, DISENOS_COMPLETOS,
  DECOS, REPOS, GELS, MANIS, PEDIS
} from './nail-menu-config';
import type { TicketDetails } from '@/types/supabase';

export interface CalculationResult {
  totalPrice: number;
  totalDuration: number;
  summaryLines: { label: string; price: number; duration: number }[];
}

export function calculateNailTotals(details: TicketDetails): CalculationResult {
  let price = 0;
  let duration = 0;
  const lines: { label: string; price: number; duration: number }[] = [];

  const activeServices = details.activeServices || [];

  // 1. Full Set
  if (activeServices.includes('fullset')) {
    if (details.fs_sistema && details.fs_forma && details.fs_largo) {
      const matchingSys = SISTEMAS.find((s) => s.name === details.fs_sistema);
      let fsBasePrice = matchingSys?.basePrice ?? 450;
      let fsDuration = matchingSys?.duration ?? 120;

      if (details.fs_largo > 2) {
        fsBasePrice += (details.fs_largo - 2) * 50;
        fsDuration += (details.fs_largo - 2) * 10;
      }

      lines.push({
        label: `Full Set — ${details.fs_sistema}, ${details.fs_forma}, Largo ${details.fs_largo}`,
        price: fsBasePrice,
        duration: fsDuration,
      });
      price += fsBasePrice;
      duration += fsDuration;
    }

    const fsTonos = details.fs_tonos ?? 0;
    if (fsTonos > 0) {
      const extraP = fsTonos * 5;
      const extraD = fsTonos * 5;
      lines.push({ label: `  Tonos extra (Full Set) ×${fsTonos}`, price: extraP, duration: extraD });
      price += extraP;
      duration += extraD;
    }
  }

  // 2. Diseños completos
  if (activeServices.includes('disenos')) {
    DISENOS_COMPLETOS.forEach((d) => {
      const qty = details.dis?.[d.name] ?? 0;
      if (qty > 0) {
        const itemP = d.price * qty;
        const itemD = d.durationPerNail * qty;
        lines.push({ label: `${d.name} ×${qty} uñas`, price: itemP, duration: itemD });
        price += itemP;
        duration += itemD;
      }
    });

    const disTonos = details.dis_tonos ?? 0;
    if (disTonos > 0) {
      const extraP = disTonos * 5;
      const extraD = disTonos * 5;
      lines.push({ label: `  Tonos extra (Diseños) ×${disTonos}`, price: extraP, duration: extraD });
      price += extraP;
      duration += extraD;
    }
  }

  // 3. Decoraciones por Uña
  if (activeServices.includes('deco')) {
    DECOS.forEach((d) => {
      const qty = details.deco?.[d.name] ?? 0;
      if (qty > 0) {
        const itemP = d.price * qty;
        const itemD = d.durationPerNail * qty;
        lines.push({ label: `${d.name} ×${qty} uñas`, price: itemP, duration: itemD });
        price += itemP;
        duration += itemD;
      }
    });

    const decoTonos = details.deco_tonos ?? 0;
    if (decoTonos > 0) {
      const extraP = decoTonos * 5;
      const extraD = decoTonos * 5;
      lines.push({ label: `  Tonos extra (Deco) ×${decoTonos}`, price: extraP, duration: extraD });
      price += extraP;
      duration += extraD;
    }
  }

  // 4. Reposiciones
  if (activeServices.includes('repo')) {
    REPOS.forEach((r) => {
      const qty = details.repo?.[r.name] ?? 0;
      if (qty > 0) {
        const itemP = r.price * qty;
        const itemD = r.durationPerNail * qty;
        lines.push({ label: `Repo ${r.name} ×${qty}`, price: itemP, duration: itemD });
        price += itemP;
        duration += itemD;
      }
    });

    const repoTonos = details.repo_tonos ?? 0;
    if (repoTonos > 0) {
      const extraP = repoTonos * 5;
      const extraD = repoTonos * 5;
      lines.push({ label: `  Tonos extra (Repo) ×${repoTonos}`, price: extraP, duration: extraD });
      price += extraP;
      duration += extraD;
    }
  }

  // 5. Gel Protección
  if (activeServices.includes('gel') && details.gel) {
    const match = GELS.find((g) => g.name === details.gel);
    if (match) {
      lines.push({ label: `Gel: ${match.name}`, price: match.price, duration: match.duration });
      price += match.price;
      duration += match.duration;
    }

    const gelTonos = details.gel_tonos ?? 0;
    if (gelTonos > 0) {
      const extraP = gelTonos * 5;
      const extraD = gelTonos * 5;
      lines.push({ label: `  Tonos extra (Gel Protec) ×${gelTonos}`, price: extraP, duration: extraD });
      price += extraP;
      duration += extraD;
    }
  }

  // 6. Manicura
  if (activeServices.includes('mani') && details.mani) {
    const match = MANIS.find((m) => m.name === details.mani);
    if (match) {
      lines.push({ label: `Manicura: ${match.name}`, price: match.price, duration: match.duration });
      price += match.price;
      duration += match.duration;
    }

    const maniTonos = details.mani_tonos ?? 0;
    if (maniTonos > 0) {
      const extraP = maniTonos * 5;
      const extraD = maniTonos * 5;
      lines.push({ label: `  Tonos extra (Manicura) ×${maniTonos}`, price: extraP, duration: extraD });
      price += extraP;
      duration += extraD;
    }
  }

  // 7. Pedicura
  if (activeServices.includes('pedi') && details.pedi) {
    const match = PEDIS.find((p) => p.name === details.pedi);
    if (match) {
      lines.push({ label: match.name, price: match.price, duration: match.duration });
      price += match.price;
      duration += match.duration;
    }

    const pediTonos = details.pedi_tonos ?? 0;
    if (pediTonos > 0) {
      const extraP = pediTonos * 5;
      const extraD = pediTonos * 5;
      lines.push({ label: `  Tonos extra (Pedicura) ×${pediTonos}`, price: extraP, duration: extraD });
      price += extraP;
      duration += extraD;
    }
  }

  return { totalPrice: price, totalDuration: duration, summaryLines: lines };
}

export function calculateDynamicNailTotals(
  details: TicketDetails,
  categories: any[],
  variants: any[],
  modifiers: any[]
): CalculationResult {
  if (!categories || categories.length === 0) {
    return calculateNailTotals(details);
  }

  let price = 0;
  let duration = 0;
  const lines: { label: string; price: number; duration: number }[] = [];
  const activeServices = details.activeServices || [];

  // Helper to find category by partial name
  const findCat = (sub: string) => categories.find(c => c.name.toLowerCase().includes(sub.toLowerCase()));

  // Helper for extra tones modifier
  const getTonoExtraConfig = (cat: any) => {
    if (!cat) return { price: 5, duration: 5 };
    const mod = modifiers.find(m => m.category_id === cat.id && m.name.toLowerCase().includes('tono'));
    return {
      price: mod ? Number(mod.price_delta) : 5,
      duration: mod ? Number(mod.duration_delta) : 5
    };
  };

  // 1. Full Set
  if (activeServices.includes('fullset')) {
    const fsCat = findCat('full set') || findCat('acril');
    if (details.fs_sistema && details.fs_forma && details.fs_largo) {
      let fsBasePrice = 450;
      let fsDuration = 120;

      if (fsCat) {
        const matchingSys = variants.find(v => v.category_id === fsCat.id && v.name.toLowerCase().trim() === details.fs_sistema?.toLowerCase().trim());
        if (matchingSys) {
          fsBasePrice = Number(matchingSys.base_price);
          fsDuration = matchingSys.base_duration_minutes;
        } else {
          fsBasePrice = SISTEMAS.find((s) => s.name === details.fs_sistema)?.basePrice ?? 450;
          fsDuration = SISTEMAS.find((s) => s.name === details.fs_sistema)?.duration ?? 120;
        }
      } else {
        fsBasePrice = SISTEMAS.find((s) => s.name === details.fs_sistema)?.basePrice ?? 450;
        fsDuration = SISTEMAS.find((s) => s.name === details.fs_sistema)?.duration ?? 120;
      }

      // Largo delta
      let largoPriceDelta = 50;
      let largoDurationDelta = 10;
      if (fsCat) {
        const largoMod = modifiers.find(m => m.category_id === fsCat.id && m.name.toLowerCase().includes('largo'));
        if (largoMod) {
          largoPriceDelta = Number(largoMod.price_delta);
          largoDurationDelta = Number(largoMod.duration_delta);
        }
      }

      if (details.fs_largo > 2) {
        fsBasePrice += (details.fs_largo - 2) * largoPriceDelta;
        fsDuration += (details.fs_largo - 2) * largoDurationDelta;
      }

      lines.push({
        label: `Full Set — ${details.fs_sistema}, ${details.fs_forma}, Largo ${details.fs_largo}`,
        price: fsBasePrice,
        duration: fsDuration,
      });
      price += fsBasePrice;
      duration += fsDuration;
    }

    const fsTonos = details.fs_tonos ?? 0;
    if (fsTonos > 0) {
      const fsTonoConf = getTonoExtraConfig(fsCat);
      const extraP = fsTonos * fsTonoConf.price;
      const extraD = fsTonos * fsTonoConf.duration;
      lines.push({ label: `  Tonos extra (Full Set) ×${fsTonos}`, price: extraP, duration: extraD });
      price += extraP;
      duration += extraD;
    }
  }

  // 2. Diseños completos
  if (activeServices.includes('disenos')) {
    const disCat = findCat('diseño');
    DISENOS_COMPLETOS.forEach((d) => {
      const qty = details.dis?.[d.name] ?? 0;
      if (qty > 0) {
        let dPrice = d.price;
        let dDuration = d.durationPerNail;

        if (disCat) {
          const dbMod = modifiers.find(m => m.category_id === disCat.id && m.name.toLowerCase().trim() === d.name.toLowerCase().trim());
          if (dbMod) {
            dPrice = Number(dbMod.price_delta);
            dDuration = dbMod.duration_delta;
          }
        }

        const itemP = dPrice * qty;
        const itemD = dDuration * qty;
        lines.push({ label: `${d.name} ×${qty} uñas`, price: itemP, duration: itemD });
        price += itemP;
        duration += itemD;
      }
    });

    const disTonos = details.dis_tonos ?? 0;
    if (disTonos > 0) {
      const disTonoConf = getTonoExtraConfig(disCat);
      const extraP = disTonos * disTonoConf.price;
      const extraD = disTonos * disTonoConf.duration;
      lines.push({ label: `  Tonos extra (Diseños) ×${disTonos}`, price: extraP, duration: extraD });
      price += extraP;
      duration += extraD;
    }
  }

  // 3. Decoraciones por Uña
  if (activeServices.includes('deco')) {
    const decoCat = findCat('decor');
    DECOS.forEach((d) => {
      const qty = details.deco?.[d.name] ?? 0;
      if (qty > 0) {
        let dPrice = d.price;
        let dDuration = d.durationPerNail;

        if (decoCat) {
          const dbMod = modifiers.find(m => m.category_id === decoCat.id && m.name.toLowerCase().trim() === d.name.toLowerCase().trim());
          if (dbMod) {
            dPrice = Number(dbMod.price_delta);
            dDuration = dbMod.duration_delta;
          }
        }

        const itemP = dPrice * qty;
        const itemD = dDuration * qty;
        lines.push({ label: `${d.name} ×${qty} uñas`, price: itemP, duration: itemD });
        price += itemP;
        duration += itemD;
      }
    });

    const decoTonos = details.deco_tonos ?? 0;
    if (decoTonos > 0) {
      const decoTonoConf = getTonoExtraConfig(decoCat);
      const extraP = decoTonos * decoTonoConf.price;
      const extraD = decoTonos * decoTonoConf.duration;
      lines.push({ label: `  Tonos extra (Deco) ×${decoTonos}`, price: extraP, duration: extraD });
      price += extraP;
      duration += extraD;
    }
  }

  // 4. Reposiciones
  if (activeServices.includes('repo')) {
    const repoCat = findCat('reposic');
    REPOS.forEach((r) => {
      const qty = details.repo?.[r.name] ?? 0;
      if (qty > 0) {
        let rPrice = r.price;
        let rDuration = r.durationPerNail;

        if (repoCat) {
          const dbMod = modifiers.find(m => m.category_id === repoCat.id && m.name.toLowerCase().trim() === r.name.toLowerCase().trim());
          if (dbMod) {
            rPrice = Number(dbMod.price_delta);
            rDuration = dbMod.duration_delta;
          }
        }

        const itemP = rPrice * qty;
        const itemD = rDuration * qty;
        lines.push({ label: `Repo ${r.name} ×${qty}`, price: itemP, duration: itemD });
        price += itemP;
        duration += itemD;
      }
    });

    const repoTonos = details.repo_tonos ?? 0;
    if (repoTonos > 0) {
      const repoTonoConf = getTonoExtraConfig(repoCat);
      const extraP = repoTonos * repoTonoConf.price;
      const extraD = repoTonos * repoTonoConf.duration;
      lines.push({ label: `  Tonos extra (Repo) ×${repoTonos}`, price: extraP, duration: extraD });
      price += extraP;
      duration += extraD;
    }
  }

  // 5. Gel Protección
  if (activeServices.includes('gel') && details.gel) {
    const gelCat = findCat('gel') || findCat('protec');
    let gelPrice = 0;
    let gelDuration = 0;

    if (gelCat) {
      const matchingSys = variants.find(v => v.category_id === gelCat.id && v.name.toLowerCase().trim() === details.gel?.toLowerCase().trim());
      if (matchingSys) {
        gelPrice = Number(matchingSys.base_price);
        gelDuration = matchingSys.base_duration_minutes;
      } else {
        const match = GELS.find((g) => g.name === details.gel);
        gelPrice = match?.price ?? 400;
        gelDuration = match?.duration ?? 60;
      }
    } else {
      const match = GELS.find((g) => g.name === details.gel);
      gelPrice = match?.price ?? 400;
      gelDuration = match?.duration ?? 60;
    }

    lines.push({ label: `Gel: ${details.gel}`, price: gelPrice, duration: gelDuration });
    price += gelPrice;
    duration += gelDuration;

    const gelTonos = details.gel_tonos ?? 0;
    if (gelTonos > 0) {
      const gelTonoConf = getTonoExtraConfig(gelCat);
      const extraP = gelTonos * gelTonoConf.price;
      const extraD = gelTonos * gelTonoConf.duration;
      lines.push({ label: `  Tonos extra (Gel Protec) ×${gelTonos}`, price: extraP, duration: extraD });
      price += extraP;
      duration += extraD;
    }
  }

  // 6. Manicura
  if (activeServices.includes('mani') && details.mani) {
    const maniCat = categories.find(c => c.name.toLowerCase().includes('mani') && !c.name.toLowerCase().includes('pedi'));
    let maniPrice = 0;
    let maniDuration = 0;

    if (maniCat) {
      const matchingSys = variants.find(v => v.category_id === maniCat.id && v.name.toLowerCase().trim() === details.mani?.toLowerCase().trim());
      if (matchingSys) {
        maniPrice = Number(matchingSys.base_price);
        maniDuration = matchingSys.base_duration_minutes;
      } else {
        const match = MANIS.find((m) => m.name === details.mani);
        maniPrice = match?.price ?? 400;
        maniDuration = match?.duration ?? 50;
      }
    } else {
      const match = MANIS.find((m) => m.name === details.mani);
      maniPrice = match?.price ?? 400;
      maniDuration = match?.duration ?? 50;
    }

    lines.push({ label: `Manicura: ${details.mani}`, price: maniPrice, duration: maniDuration });
    price += maniPrice;
    duration += maniDuration;

    const maniTonos = details.mani_tonos ?? 0;
    if (maniTonos > 0) {
      const maniTonoConf = getTonoExtraConfig(maniCat);
      const extraP = maniTonos * maniTonoConf.price;
      const extraD = maniTonos * maniTonoConf.duration;
      lines.push({ label: `  Tonos extra (Manicura) ×${maniTonos}`, price: extraP, duration: extraD });
      price += extraP;
      duration += extraD;
    }
  }

  // 7. Pedicura
  if (activeServices.includes('pedi') && details.pedi) {
    const pediCat = findCat('pedi');
    let pediPrice = 0;
    let pediDuration = 0;

    if (pediCat) {
      const matchingSys = variants.find(v => v.category_id === pediCat.id && v.name.toLowerCase().trim() === details.pedi?.toLowerCase().trim());
      if (matchingSys) {
        pediPrice = Number(matchingSys.base_price);
        pediDuration = matchingSys.base_duration_minutes;
      } else {
        const match = PEDIS.find((p) => p.name === details.pedi);
        pediPrice = match?.price ?? 480;
        pediDuration = match?.duration ?? 60;
      }
    } else {
      const match = PEDIS.find((p) => p.name === details.pedi);
      pediPrice = match?.price ?? 480;
      pediDuration = match?.duration ?? 60;
    }

    lines.push({ label: details.pedi, price: pediPrice, duration: pediDuration });
    price += pediPrice;
    duration += pediDuration;

    const pediTonos = details.pedi_tonos ?? 0;
    if (pediTonos > 0) {
      const pediTonoConf = getTonoExtraConfig(pediCat);
      const extraP = pediTonos * pediTonoConf.price;
      const extraD = pediTonos * pediTonoConf.duration;
      lines.push({ label: `  Tonos extra (Pedicura) ×${pediTonos}`, price: extraP, duration: extraD });
      price += extraP;
      duration += extraD;
    }
  }

  return { totalPrice: price, totalDuration: duration, summaryLines: lines };
}
