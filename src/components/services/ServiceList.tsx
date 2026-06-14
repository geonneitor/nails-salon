'use client';
// ============================================================
// src/components/services/ServiceList.tsx
// Gestor de Cotizador (Dynamic Services Admin con CRUD)
// ============================================================
import { useState } from 'react';
import { useDynamicServices } from '@/hooks/useDynamicServices';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Edit2, Check, X, Tag, Plus, Trash2 } from 'lucide-react';

export function ServiceList({
  onVariantEdited,
  onModifierEdited,
}: {
  onVariantEdited?: (categoryId: string) => void;
  onModifierEdited?: (categoryId: string) => void;
} = {}) {
  const {
    categories, variants, modifiers, isLoading, error,
    updateVariantPrice, updateModifierPrice, toggleCategoryActive, toggleVariantActive, toggleModifierActive,
    createCategory, updateCategory, deleteCategory,
    createVariant, updateVariant, deleteVariant,
    createModifier, updateModifier, deleteModifier
  } = useDynamicServices();

  // Estados de edición general
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState(0);

  // Estados de creación
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'single' | 'multiple'>('single');

  const [addingToCatId, setAddingToCatId] = useState<string | null>(null);
  const [addType, setAddType] = useState<'variant' | 'modifier' | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [newModType, setNewModType] = useState<'checkbox' | 'quantity'>('checkbox');

  // --- HANDLERS CREACIÓN ---
  const handleSaveNewCategory = async () => {
    if (!newCatName.trim()) return;
    await createCategory(newCatName.trim(), newCatType);
    setIsCreatingCat(false);
    setNewCatName('');
  };

  const handleSaveNewItem = async () => {
    if (!newItemName.trim() || !addingToCatId || !addType) return;
    if (addType === 'variant') {
      await createVariant(addingToCatId, newItemName.trim(), newItemPrice);
      onVariantEdited?.(addingToCatId);
    } else {
      await createModifier(addingToCatId, newItemName.trim(), newItemPrice, newModType);
      onModifierEdited?.(addingToCatId);
    }
    setAddingToCatId(null);
    setNewItemName('');
    setNewItemPrice(0);
  };

  // --- HANDLERS EDICIÓN/BORRADO ---
  const startEditCategory = (id: string, name: string) => {
    setEditingItemId(`cat_${id}`);
    setEditName(name);
  };

  const startEditVariant = (id: string, name: string, price: number) => {
    setEditingItemId(`var_${id}`);
    setEditName(name);
    setEditPrice(price);
  };

  const startEditModifier = (id: string, name: string, price: number) => {
    setEditingItemId(`mod_${id}`);
    setEditName(name);
    setEditPrice(price);
  };

  const handleSaveEditCategory = async (id: string) => {
    await updateCategory(id, { name: editName });
    setEditingItemId(null);
  };

  const handleSaveEditVariant = async (id: string, categoryId: string) => {
    await updateVariant(id, { name: editName, base_price: editPrice });
    setEditingItemId(null);
    onVariantEdited?.(categoryId);
  };

  const handleSaveEditModifier = async (id: string, categoryId: string) => {
    await updateModifier(id, { name: editName, price_delta: editPrice });
    setEditingItemId(null);
    onModifierEdited?.(categoryId);
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('¿Seguro que quieres borrar esta categoría y todos sus servicios?')) {
      await deleteCategory(id);
    }
  };

  const handleDeleteVariant = async (id: string, categoryId: string) => {
    if (window.confirm('¿Borrar esta opción?')) {
      await deleteVariant(id);
      onVariantEdited?.(categoryId);
    }
  };

  const handleDeleteModifier = async (id: string, categoryId: string) => {
    if (window.confirm('¿Borrar este adicional?')) {
      await deleteModifier(id);
      onModifierEdited?.(categoryId);
    }
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
    <div className="flex flex-col gap-8 w-full mx-auto relative pb-10">
      <div className="flex justify-between items-end border-b border-secundario-zen/50 pb-4">
        <div>
          <h2 className="text-primario-zen font-serif text-2xl uppercase tracking-widest">Gestor de Cotizador</h2>
          <p className="text-sm text-primario-zen/60 mt-1">
            Construye y ajusta las opciones de tu calculadora interactiva.
          </p>
        </div>
        <button
          onClick={() => { setIsCreatingCat(true); setAddingToCatId(null); }}
          className="bg-primario-zen text-fondo-zen px-4 py-2 rounded-xl uppercase tracking-widest text-xs font-semibold hover:bg-opacity-90 flex items-center gap-2 shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Categoría
        </button>
      </div>

      {isCreatingCat && (
        <div className="bg-secundario-zen/20 border border-primario-zen/30 rounded-3xl p-6 shadow-sm">
          <h3 className="font-serif text-lg text-primario-zen mb-4">Nueva Categoría</h3>
          <div className="flex flex-col gap-4">
            <input type="text" placeholder="Nombre de categoría (ej. Manicura)" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="p-3 rounded-xl border border-secundario-zen w-full" autoFocus />
            <select value={newCatType} onChange={(e) => setNewCatType(e.target.value as any)} className="p-3 rounded-xl border border-secundario-zen w-full">
              <option value="single">Selección Única (Opciones Base)</option>
              <option value="multiple">Selección Múltiple (Adicionales Libres)</option>
            </select>
            <div className="flex gap-2">
              <button onClick={handleSaveNewCategory} className="flex-1 bg-primario-zen text-fondo-zen py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90">Guardar</button>
              <button onClick={() => setIsCreatingCat(false)} className="flex-1 border border-primario-zen/40 text-primario-zen py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-secundario-zen/30">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {categories.map(category => {
        const catVariants = variants.filter(v => v.category_id === category.id);
        const catModifiers = modifiers.filter(m => m.category_id === category.id);

        return (
          <div key={category.id} className="bg-white/50 border border-secundario-zen/40 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6 border-b border-secundario-zen/30 pb-4">
              {editingItemId === `cat_${category.id}` ? (
                <div className="flex items-center gap-2 flex-1 mr-4">
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="p-2 border rounded-lg flex-1 text-sm font-serif" autoFocus />
                  <button onClick={() => handleSaveEditCategory(category.id)} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditingItemId(null)} className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <h3 className="font-serif text-xl text-primario-zen flex items-center gap-3">
                  <Tag className="w-5 h-5 text-accent-gold" />
                  {category.name}
                  <span className="text-xs uppercase font-sans tracking-wider text-primario-zen/40 bg-secundario-zen/20 px-2 py-1 rounded-full">{category.selection_type}</span>
                  <button onClick={() => startEditCategory(category.id, category.name)} className="text-primario-zen/30 hover:text-primario-zen transition-colors ml-2"><Edit2 className="w-3 h-3" /></button>
                </h3>
              )}
              
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-sans text-primario-zen/60 cursor-pointer">
                  <input type="checkbox" checked={category.is_active} onChange={(e) => toggleCategoryActive(category.id, e.target.checked)} className="w-4 h-4 accent-primario-zen" />
                  {category.is_active ? 'Visible' : 'Oculto'}
                </label>
                <button onClick={() => handleDeleteCategory(category.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            {/* VARIANTS */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-primario-zen/70">Opciones Base</h4>
                <button onClick={() => { setAddingToCatId(category.id); setAddType('variant'); setNewItemName(''); setNewItemPrice(0); setIsCreatingCat(false); }} className="text-[10px] uppercase font-bold text-accent-gold hover:text-gold-dark flex items-center gap-1"><Plus className="w-3 h-3" /> Añadir Opción</button>
              </div>
              
              <div className="flex flex-col gap-2">
                {catVariants.map(v => (
                  <div key={v.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${v.is_active ? 'bg-fondo-zen border-secundario-zen/50' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                    {editingItemId === `var_${v.id}` ? (
                      <div className="flex items-center gap-2 w-full">
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="p-1.5 text-sm border rounded-lg flex-1" autoFocus />
                        <span className="text-sm text-primario-zen/50">$</span>
                        <input type="number" value={editPrice} onChange={(e) => setEditPrice(Number(e.target.value))} className="w-20 text-sm p-1.5 border rounded-lg" />
                        <button onClick={() => handleSaveEditVariant(v.id, v.category_id)} className="p-1.5 bg-green-100 text-green-700 rounded-lg"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingItemId(null)} className="p-1.5 bg-gray-100 text-gray-700 rounded-lg"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <input type="checkbox" checked={v.is_active} onChange={(e) => toggleVariantActive(v.id, e.target.checked)} className="w-4 h-4 accent-primario-zen rounded shrink-0" />
                          <span className="text-sm font-medium text-primario-zen truncate">{v.name}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-semibold text-primario-zen">${v.base_price}</span>
                          <button onClick={() => startEditVariant(v.id, v.name, v.base_price)} className="p-1 text-primario-zen/40 hover:text-primario-zen"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteVariant(v.id, v.category_id)} className="p-1 text-red-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {addingToCatId === category.id && addType === 'variant' && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-secundario-zen/10 border border-primario-zen/30">
                    <input type="text" placeholder="Nombre" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="p-1.5 text-sm border rounded-lg flex-1" autoFocus />
                    <span className="text-sm text-primario-zen/50">$</span>
                    <input type="number" placeholder="Precio" value={newItemPrice || ''} onChange={(e) => setNewItemPrice(Number(e.target.value))} className="w-20 text-sm p-1.5 border rounded-lg" />
                    <button onClick={handleSaveNewItem} className="p-1.5 bg-primario-zen text-fondo-zen rounded-lg"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setAddingToCatId(null)} className="p-1.5 bg-gray-200 text-gray-700 rounded-lg"><X className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            </div>

            {/* MODIFIERS */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-primario-zen/70">Adicionales / Modificadores</h4>
                <button onClick={() => { setAddingToCatId(category.id); setAddType('modifier'); setNewItemName(''); setNewItemPrice(0); setNewModType('checkbox'); setIsCreatingCat(false); }} className="text-[10px] uppercase font-bold text-accent-gold hover:text-gold-dark flex items-center gap-1"><Plus className="w-3 h-3" /> Añadir Adicional</button>
              </div>

              <div className="flex flex-col gap-2">
                {catModifiers.map(m => (
                  <div key={m.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${m.is_active ? 'bg-fondo-zen border-secundario-zen/50' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                    {editingItemId === `mod_${m.id}` ? (
                      <div className="flex items-center gap-2 w-full">
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="p-1.5 text-sm border rounded-lg flex-1" autoFocus />
                        <span className="text-sm text-primario-zen/50">$</span>
                        <input type="number" value={editPrice} onChange={(e) => setEditPrice(Number(e.target.value))} className="w-20 text-sm p-1.5 border rounded-lg" />
                        <button onClick={() => handleSaveEditModifier(m.id, m.category_id)} className="p-1.5 bg-green-100 text-green-700 rounded-lg"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingItemId(null)} className="p-1.5 bg-gray-100 text-gray-700 rounded-lg"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <input type="checkbox" checked={m.is_active} onChange={(e) => toggleModifierActive(m.id, e.target.checked)} className="w-4 h-4 accent-primario-zen rounded shrink-0" />
                          <span className="text-sm font-medium text-primario-zen truncate">{m.name}</span>
                          <span className="text-[9px] uppercase bg-secundario-zen/30 px-1.5 py-0.5 rounded text-primario-zen/60 shrink-0">{m.modifier_type}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-semibold text-primario-zen">+${m.price_delta}</span>
                          <button onClick={() => startEditModifier(m.id, m.name, m.price_delta)} className="p-1 text-primario-zen/40 hover:text-primario-zen"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteModifier(m.id, m.category_id)} className="p-1 text-red-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {addingToCatId === category.id && addType === 'modifier' && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-secundario-zen/10 border border-primario-zen/30 flex-wrap sm:flex-nowrap">
                    <input type="text" placeholder="Nombre (ej. Diseño extra)" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="p-1.5 text-sm border rounded-lg flex-1 min-w-[120px]" autoFocus />
                    <select value={newModType} onChange={(e) => setNewModType(e.target.value as any)} className="p-1.5 text-xs border rounded-lg shrink-0">
                      <option value="checkbox">Único</option>
                      <option value="quantity">Cantidad (x1, x2...)</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-primario-zen/50">$</span>
                      <input type="number" placeholder="Costo" value={newItemPrice || ''} onChange={(e) => setNewItemPrice(Number(e.target.value))} className="w-20 text-sm p-1.5 border rounded-lg" />
                      <button onClick={handleSaveNewItem} className="p-1.5 bg-primario-zen text-fondo-zen rounded-lg"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setAddingToCatId(null)} className="p-1.5 bg-gray-200 text-gray-700 rounded-lg"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}
