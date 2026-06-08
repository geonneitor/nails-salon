/**
 * utils.ts
 * Utilidades generales compartidas en toda la app.
 */

/**
 * Combina clases CSS condicionalmente (equivalente liviano a clsx/tailwind-merge).
 * Uso: cn('base-class', condition && 'extra-class', className)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
