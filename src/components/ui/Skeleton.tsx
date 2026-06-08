'use client';

/**
 * Skeleton.tsx
 * ─────────────────────────────────────────────────────────────
 * Componentes de carga esqueleto (shimmer) para reemplazar
 * los spinners Loader2 en listas y modales.
 *
 * Exports:
 *   <Skeleton />      — bloque rectangular genérico
 *   <SkeletonText />  — línea de texto (con variante narrow)
 *   <SkeletonCard />  — tarjeta completa de clienta/servicio
 */

import { cn } from '@/lib/utils';

/* ── Base shimmer ───────────────────────────────────────────── */
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-surface-container',
        className
      )}
    />
  );
}

/* ── Línea de texto ─────────────────────────────────────────── */
interface SkeletonTextProps {
  lines?: number;
  narrow?: boolean;
  className?: string;
}

export function SkeletonText({ lines = 1, narrow = false, className }: SkeletonTextProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-3.5 rounded-full',
            narrow ? 'w-3/4' : 'w-full',
            i === lines - 1 && lines > 1 ? 'w-2/3' : ''
          )}
        />
      ))}
    </div>
  );
}

/* ── Tarjeta completa ───────────────────────────────────────── */
export function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest">
      {/* Header row */}
      <div className="flex justify-between items-start gap-3">
        <Skeleton className="h-5 w-1/2 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      {/* Body */}
      <SkeletonText lines={2} className="mt-1" />
      {/* Footer */}
      <Skeleton className="h-4 w-1/3 rounded-full mt-1" />
    </div>
  );
}
