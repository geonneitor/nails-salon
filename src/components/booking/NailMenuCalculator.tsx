'use client';

import { useState, useEffect } from 'react';
import type { TicketDetails } from '@/types/supabase';
import { calculateNailTotals } from '@/lib/nail-menu-calculator';

import { ServiceCategoryToggles } from './calculator/ServiceCategoryToggles';
import { FullSetSection } from './calculator/FullSetSection';
import { DesignsSection } from './calculator/DesignsSection';
import { DecorationsSection } from './calculator/DecorationsSection';
import { RepoSection } from './calculator/RepoSection';
import { GelSection } from './calculator/GelSection';
import { ManiSection } from './calculator/ManiSection';
import { PediSection } from './calculator/PediSection';
import { PriceSummary } from './calculator/PriceSummary';

interface NailMenuCalculatorProps {
  value?: TicketDetails | null;
  onChange: (data: { ticketDetails: TicketDetails; totalPrice: number; totalDuration: number }) => void;
}

export function NailMenuCalculator({ value, onChange }: NailMenuCalculatorProps) {
  // ── ESTADOS LOCALES ──
  const [activeServices, setActiveServices] = useState<Set<string>>(new Set(value?.activeServices ?? []));
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

  // ── ACCIONES ──
  const toggleService = (id: string) => {
    const next = new Set(activeServices);
    next.has(id) ? next.delete(id) : next.add(id);
    setActiveServices(next);
  };

  const resetSection = (sec: string) => {
    if (sec === 'fullset') { setFsSistema(null); setFsForma(null); setFsLargo(null); setFsTonos(0); }
    else if (sec === 'disenos') { setDis({}); setDisTonos(0); }
    else if (sec === 'deco') { setDeco({}); setDecoTonos(0); }
    else if (sec === 'repo') { setRepo({}); setRepoTonos(0); }
    else if (sec === 'gel') { setGel(null); setGelTonos(0); }
    else if (sec === 'mani') { setMani(null); setManiTonos(0); }
    else if (sec === 'pedi') { setPedi(null); setPediTonos(0); }
  };

  // ── CÁLCULOS ──
  const { totalPrice, totalDuration, summaryLines } = calculateNailTotals({
    activeServices: Array.from(activeServices),
    fs_sistema: fsSistema, fs_forma: fsForma, fs_largo: fsLargo, fs_tonos: fsTonos,
    dis, dis_tonos: disTonos,
    deco, deco_tonos: decoTonos,
    repo, repo_tonos: repoTonos,
    gel, gel_tonos: gelTonos,
    mani, mani_tonos: maniTonos,
    pedi, pedi_tonos: pediTonos,
  });

  useEffect(() => {
    onChange({
      ticketDetails: {
        activeServices: Array.from(activeServices),
        fs_sistema: fsSistema, fs_forma: fsForma, fs_largo: fsLargo, fs_tonos: fsTonos,
        dis, dis_tonos: disTonos,
        deco, deco_tonos: decoTonos,
        repo, repo_tonos: repoTonos,
        gel, gel_tonos: gelTonos,
        mani, mani_tonos: maniTonos,
        pedi, pedi_tonos: pediTonos,
      },
      totalPrice,
      totalDuration,
    });
  }, [
    activeServices, fsSistema, fsForma, fsLargo, fsTonos,
    dis, disTonos, deco, decoTonos, repo, repoTonos,
    gel, gelTonos, mani, maniTonos, pedi, pediTonos,
    totalPrice, totalDuration
  ]);

  return (
    <div className="flex flex-col gap-5 w-full">
      <ServiceCategoryToggles activeServices={activeServices} onToggle={toggleService} />

      {activeServices.has('fullset') && (
        <FullSetSection
          fsSistema={fsSistema} setFsSistema={setFsSistema}
          fsForma={fsForma} setFsForma={setFsForma}
          fsLargo={fsLargo} setFsLargo={setFsLargo}
          fsTonos={fsTonos} setFsTonos={setFsTonos}
          onReset={() => resetSection('fullset')}
        />
      )}

      {activeServices.has('disenos') && (
        <DesignsSection
          dis={dis} setDis={setDis}
          disTonos={disTonos} setDisTonos={setDisTonos}
          onReset={() => resetSection('disenos')}
        />
      )}

      {activeServices.has('deco') && (
        <DecorationsSection
          deco={deco} setDeco={setDeco}
          decoTonos={decoTonos} setDecoTonos={setDecoTonos}
          onReset={() => resetSection('deco')}
        />
      )}

      {activeServices.has('repo') && (
        <RepoSection
          repo={repo} setRepo={setRepo}
          repoTonos={repoTonos} setRepoTonos={setRepoTonos}
          onReset={() => resetSection('repo')}
        />
      )}

      {activeServices.has('gel') && (
        <GelSection
          gel={gel} setGel={setGel}
          gelTonos={gelTonos} setGelTonos={setGelTonos}
          onReset={() => resetSection('gel')}
        />
      )}

      {activeServices.has('mani') && (
        <ManiSection
          mani={mani} setMani={setMani}
          maniTonos={maniTonos} setManiTonos={setManiTonos}
          onReset={() => resetSection('mani')}
        />
      )}

      {activeServices.has('pedi') && (
        <PediSection
          pedi={pedi} setPedi={setPedi}
          pediTonos={pediTonos} setPediTonos={setPediTonos}
          onReset={() => resetSection('pedi')}
        />
      )}

      <PriceSummary totalPrice={totalPrice} totalDuration={totalDuration} summaryLines={summaryLines} />
    </div>
  );
}
