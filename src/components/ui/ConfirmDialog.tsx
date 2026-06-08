'use client';

/**
 * ConfirmDialog.tsx
 * ─────────────────────────────────────────────────────────────
 * Modal de confirmación estilizado que reemplaza confirm() nativo.
 * Uso imperativo vía hook useConfirm():
 *
 *   const confirm = useConfirm();
 *   const ok = await confirm({
 *     title:        '¿Eliminar clienta?',
 *     message:      'Esta acción no se puede deshacer.',
 *     confirmLabel: 'Sí, eliminar',
 *     danger:       true,
 *   });
 *   if (ok) { ... }
 *
 * También exporta <ConfirmDialogProvider> para envolver en layout.tsx.
 */

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

/* ── Tipos ──────────────────────────────────────────────────── */
export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Si true, el botón de confirmación usa estilo destructivo (error). */
  danger?: boolean;
}

type Resolver = (value: boolean) => void;

interface ConfirmState {
  open: boolean;
  options: ConfirmOptions;
  resolve: Resolver | null;
}

/* ── Context ────────────────────────────────────────────────── */
const ConfirmContext = createContext<((opts: ConfirmOptions) => Promise<boolean>) | null>(null);

/* ── Provider ───────────────────────────────────────────────── */
export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    options: { title: '' },
    resolve: null,
  });

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((res) => {
      setState({ open: true, options: opts, resolve: res });
    });
  }, []);

  const handleResponse = (value: boolean) => {
    state.resolve?.(value);
    setState((s) => ({ ...s, open: false }));
  };

  const { title, message, confirmLabel, cancelLabel, danger } = state.options;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <AnimatePresence>
        {state.open && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[300] bg-black/30 backdrop-blur-sm"
              onClick={() => handleResponse(false)}
              aria-hidden
            />

            {/* Dialog */}
            <motion.div
              key="dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              aria-describedby={message ? 'confirm-desc' : undefined}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32, mass: 0.85 }}
              className="fixed inset-0 z-[301] flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-sm rounded-3xl bg-surface-container-lowest border border-outline-variant/40 shadow-[0_20px_60px_-12px_rgba(52,70,35,0.22)] p-6 flex flex-col gap-5">

                {/* Icono + close */}
                <div className="flex items-start justify-between">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                      danger ? 'bg-error/10' : 'bg-primary/10'
                    }`}
                  >
                    {danger ? (
                      <Trash2 className="w-5 h-5 text-error" strokeWidth={2.2} />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-primary" strokeWidth={2.2} />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleResponse(false)}
                    aria-label="Cancelar"
                    className="p-1.5 -mt-1 -mr-1 rounded-lg text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container-high transition-colors"
                  >
                    <X className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>

                {/* Textos */}
                <div className="flex flex-col gap-1.5">
                  <h2
                    id="confirm-title"
                    className="font-serif text-lg text-on-surface leading-snug"
                  >
                    {title}
                  </h2>
                  {message && (
                    <p
                      id="confirm-desc"
                      className="font-sans text-sm text-on-surface-variant leading-relaxed"
                    >
                      {message}
                    </p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => handleResponse(false)}
                    className="flex-1 py-3 rounded-2xl font-sans text-sm font-semibold text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest transition-colors"
                  >
                    {cancelLabel ?? 'Cancelar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResponse(true)}
                    className={`flex-1 py-3 rounded-2xl font-sans text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97] ${
                      danger
                        ? 'bg-error text-on-error shadow-[0_4px_16px_-4px_var(--error)]'
                        : 'bg-primary text-on-primary shadow-[0_4px_16px_-4px_var(--primary)]'
                    }`}
                  >
                    {confirmLabel ?? 'Confirmar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

/* ── Hook ───────────────────────────────────────────────────── */
export function useConfirm(): (opts: ConfirmOptions) => Promise<boolean> {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm() debe usarse dentro de <ConfirmDialogProvider>');
  }
  return ctx;
}
