import type { AppointmentWithRelations } from '@/types/supabase';

interface LayoutAppointment {
  appointment: AppointmentWithRelations;
  columnIndex: number;
  columnCount: number;
}

/**
 * Algoritmo "interval graph coloring" simplificado:
 * asigna a cada cita una columna visual donde no se solape con otra
 * cita del mismo día que se intersecta en el tiempo.
 *
 * Asume que las citas están ordenadas por `start_time` ascendente.
 * Retorna cada cita con su `columnIndex` y el `columnCount` del grupo
 * (todas las citas paralelas comparten el mismo columnCount).
 */
export function layoutAppointments(appointments: AppointmentWithRelations[]): LayoutAppointment[] {
  if (appointments.length === 0) return [];

  const sorted = [...appointments].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const result: LayoutAppointment[] = [];

  // Procesamos por "clusters" de citas solapadas
  let cluster: Array<{ a: AppointmentWithRelations; col: number; end: number }> = [];
  let clusterEnd = -Infinity;

  const flushCluster = () => {
    if (cluster.length === 0) return;
    const count = Math.max(...cluster.map((c) => c.col)) + 1;
    for (const c of cluster) {
      result.push({ appointment: c.a, columnIndex: c.col, columnCount: count });
    }
    cluster = [];
    clusterEnd = -Infinity;
  };

  for (const a of sorted) {
    const start = new Date(a.start_time).getTime();
    const end = new Date(a.end_time).getTime();

    // Si la cita actual no solapa con el final del cluster, cerramos cluster.
    if (start >= clusterEnd) {
      flushCluster();
    }

    // Encontrar la primera columna libre en este cluster.
    const usedCols = new Set(cluster.filter((c) => c.end > start).map((c) => c.col));
    let col = 0;
    while (usedCols.has(col)) col++;

    cluster.push({ a, col, end });
    clusterEnd = Math.max(clusterEnd, end);
  }
  flushCluster();

  return result;
}
