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
