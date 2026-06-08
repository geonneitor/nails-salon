'use client';
// ============================================================
// src/components/services/ServiceList.tsx
// Gestor de Cotizador (Dynamic Services Admin)
// ============================================================
import { useState } from 'react';
import { useDynamicServices } from '@/hooks/useDynamicServices';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Edit2, Check, X, Tag } from 'lucide-react';

export function ServiceList() {
  const { 
    categories, variants, modifiers, isLoading, error,
    updateVariantPrice, updateModifierPrice, toggleVariantActive, toggleModifierActive
  } = useDynamicServices();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  const startEdit = (id: string, currentPrice: number) => {
    setEditingId(id);
    setEditPrice(currentPrice);
  };

  const saveVariantEdit = async (id: string) => {
    await updateVariantPrice(id, editPrice);
    setEditingId(null);
  };

  const saveModifierEdit = async (id: string) => {
    await updateModifierPrice(id, editPrice);
    setEditingId(null);
  };

  if (error) {
    return (
      <div className="text-center py-8 bg-red-50 rounded-2xl border border-red-200">
        <p className="text-red-700 text-sm">Error cargando configurador: {error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-end border-b border-secundario-zen/50 pb-4">
        <div>
          <h2 className="text-primario-zen font-serif text-2xl uppercase tracking-widest">Gestor de Cotizador</h2>
          <p className="text-sm text-primario-zen/60 mt-1">
            Activa o desactiva opciones y ajusta los precios en tiempo real de tu calculadora interactiva.
          </p>
        </div>
      </div>

      {categories.map(category => {
        const catVariants = variants.filter(v => v.category_id === category.id);
        const catModifiers = modifiers.filter(m => m.category_id === category.id);

        return (
          <div key={category.id} className="bg-white/50 border border-secundario-zen/40 rounded-3xl p-6 shadow-sm">
            <h3 className="font-serif text-xl text-primario-zen mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-accent-gold" />
              {category.name} <span className="text-xs uppercase font-sans tracking-wider text-primario-zen/40 bg-secundario-zen/20 px-2 py-1 rounded-full">{category.selection_type}</span>
            </h3>

            {/* Variants */}
            {catVariants.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-widest font-semibold text-primario-zen/70 mb-3 border-b border-secundario-zen/30 pb-2">Opciones Base</h4>
                <div className="flex flex-col gap-2">
                  {catVariants.map(v => (
                    <div key={v.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${v.is_active ? 'bg-fondo-zen border-secundario-zen/50' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                      <div className="flex items-center gap-4">
                        <input type="checkbox" checked={v.is_active} onChange={(e) => toggleVariantActive(v.id, e.target.checked)} className="w-4 h-4 accent-primario-zen rounded" />
                        <span className="text-sm font-medium text-primario-zen">{v.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {editingId === v.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-primario-zen/50">$</span>
                            <input type="number" value={editPrice} onChange={(e) => setEditPrice(Number(e.target.value))} className="w-20 text-sm p-1 border rounded" autoFocus />
                            <button onClick={() => saveVariantEdit(v.id)} className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setEditingId(null)} className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-primario-zen">${v.base_price} MXN</span>
                            <button onClick={() => startEdit(v.id, v.base_price)} className="p-1.5 text-primario-zen/40 hover:text-primario-zen transition-colors"><Edit2 className="w-4 h-4" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modifiers */}
            {catModifiers.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-widest font-semibold text-primario-zen/70 mb-3 border-b border-secundario-zen/30 pb-2">Adicionales / Modificadores</h4>
                <div className="flex flex-col gap-2">
                  {catModifiers.map(m => (
                    <div key={m.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${m.is_active ? 'bg-fondo-zen border-secundario-zen/50' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                      <div className="flex items-center gap-4">
                        <input type="checkbox" checked={m.is_active} onChange={(e) => toggleModifierActive(m.id, e.target.checked)} className="w-4 h-4 accent-primario-zen rounded" />
                        <span className="text-sm font-medium text-primario-zen">{m.name}</span>
                        <span className="text-[10px] uppercase bg-secundario-zen/20 px-2 py-0.5 rounded text-primario-zen/50">{m.modifier_type}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {editingId === m.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-primario-zen/50">$</span>
                            <input type="number" value={editPrice} onChange={(e) => setEditPrice(Number(e.target.value))} className="w-20 text-sm p-1 border rounded" autoFocus />
                            <button onClick={() => saveModifierEdit(m.id)} className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setEditingId(null)} className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-primario-zen">+${m.price_delta} MXN</span>
                            <button onClick={() => startEdit(m.id, m.price_delta)} className="p-1.5 text-primario-zen/40 hover:text-primario-zen transition-colors"><Edit2 className="w-4 h-4" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

