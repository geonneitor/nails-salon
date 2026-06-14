'use client';

// ============================================================
// AlertList.tsx — Lista de avisos/alertas premium.
// Pensada para la zona inferior del dashboard "morning brief".
// ============================================================

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bell,
  Gift,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AlertItem {
  id: string;
  /** Tipo determina el ícono y el tono. */
  kind: 'reminder' | 'birthday' | 'unconfirmed' | 'failed' | 'opportunity';
  title: string;
  description?: string;
  href?: string;
}

interface AlertListProps {
  alerts: AlertItem[];
  emptyMessage?: string;
}

const KIND_STYLES: Record<AlertItem['kind'], { icon: LucideIcon; color: string; bg: string }> = {
  reminder: { icon: Bell, color: 'text-gold-dark', bg: 'bg-gold-primary/15' },
  birthday: { icon: Gift, color: 'text-lavender-dark', bg: 'bg-lavender-primary/15' },
  unconfirmed: { icon: AlertTriangle, color: 'text-primario-zen', bg: 'bg-primario-zen/10' },
  failed: { icon: AlertTriangle, color: 'text-error', bg: 'bg-error-container/40' },
  opportunity: { icon: Sparkles, color: 'text-primario-zen', bg: 'bg-primario-zen/10' },
};

export function AlertList({ alerts, emptyMessage = 'Todo en orden 🌿' }: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-3 px-5 py-6 rounded-2xl bg-primario-zen/5 border border-primario-zen/10">
        <span className="w-9 h-9 rounded-full bg-primario-zen/10 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-primario-zen" strokeWidth={2} />
        </span>
        <p className="text-sm text-on-surface-variant font-sans italic">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-outline-variant/30">
      {alerts.map((a, idx) => {
        const style = KIND_STYLES[a.kind];
        const Icon = style.icon;
        const inner = (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * idx, duration: 0.3 }}
            className="flex items-center gap-4 px-5 py-3.5 hover:bg-secundario-zen/20 transition-colors group cursor-pointer"
          >
            <span
              className={`shrink-0 w-9 h-9 rounded-full ${style.bg} flex items-center justify-center`}
            >
              <Icon className={`w-4 h-4 ${style.color}`} strokeWidth={1.75} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface font-sans truncate">
                {a.title}
              </p>
              {a.description && (
                <p className="text-[11px] text-on-surface-variant/70 font-sans mt-0.5 truncate">
                  {a.description}
                </p>
              )}
            </div>
            {a.href && (
              <ChevronRight className="w-4 h-4 text-on-surface-variant/40 group-hover:text-primario-zen group-hover:translate-x-0.5 transition-all" />
            )}
          </motion.div>
        );
        return (
          <li key={a.id}>
            {a.href ? <Link href={a.href}>{inner}</Link> : inner}
          </li>
        );
      })}
    </ul>
  );
}
