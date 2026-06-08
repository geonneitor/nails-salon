'use client';

import React from 'react';

interface PriceSummaryProps {
  totalPrice: number;
  totalDuration: number;
  summaryLines: { label: string; price: number; duration: number }[];
}

export function PriceSummary({ totalPrice, totalDuration, summaryLines }: PriceSummaryProps) {
  return (
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
              <span className="truncate mr-2">{line.label}</span>
              <span className="font-bold shrink-0">${line.price} MXN</span>
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
  );
}
