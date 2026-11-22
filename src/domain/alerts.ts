import type { Alert, AlertKind } from './types';

export type AlertStatus = 'programado' | 'vigente' | 'finalizado';

export const ALERT_KIND_LABEL: Record<AlertKind, string> = {
  desvio: 'Desvío',
  horario: 'Horario',
  suspension: 'Suspensión',
  novedad: 'Novedad',
};

/** Status of a notice on a local date (`YYYY-MM-DD`). Notices without a window stay current. */
export function alertStatus(alert: Alert, today: string): AlertStatus {
  if (alert.validFrom && today < alert.validFrom) return 'programado';
  if (alert.validUntil && today > alert.validUntil) return 'finalizado';
  return 'vigente';
}

/** True when the notice concerns the route (network-wide notices concern every route). */
export function affectsRoute(alert: Alert, routeId: string): boolean {
  return alert.routes.length === 0 || alert.routes.includes(routeId);
}

/**
 * Orders notices for display: current and upcoming first, then ended ones;
 * newest publication first within each group.
 */
export function sortAlerts(alerts: readonly Alert[], today: string): Alert[] {
  const rank = (a: Alert) => (alertStatus(a, today) === 'finalizado' ? 1 : 0);
  return [...alerts].sort((a, b) => rank(a) - rank(b) || b.published.localeCompare(a.published) || a.id.localeCompare(b.id));
}

/** Notices relevant to a set of followed routes; with nothing followed every notice is relevant. */
export function filterForRoutes(alerts: readonly Alert[], followed: ReadonlySet<string>): Alert[] {
  if (followed.size === 0) return [...alerts];
  return alerts.filter((a) => a.routes.length === 0 || a.routes.some((r) => followed.has(r)));
}

export function unreadCount(alerts: readonly Alert[], read: ReadonlySet<string>, today: string): number {
  return alerts.filter((a) => !read.has(a.id) && alertStatus(a, today) !== 'finalizado').length;
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** `2026-11-23` → `23 nov 2026`. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Integrity problems in the notices seed; an empty list means it is sound. */
export function validateAlerts(alerts: readonly Alert[], routeIds: ReadonlySet<string>): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const a of alerts) {
    if (ids.has(a.id)) problems.push(`duplicate notice id ${a.id}`);
    ids.add(a.id);
    if (!(a.kind in ALERT_KIND_LABEL)) problems.push(`${a.id} has unknown kind ${a.kind}`);
    if (!a.title.trim() || !a.body.trim()) problems.push(`${a.id} needs a title and a body`);
    for (const d of [a.published, a.validFrom, a.validUntil]) {
      if (d !== undefined && !ISO_DATE.test(d)) problems.push(`${a.id} has a bad date ${d}`);
    }
    if (a.validFrom && a.validUntil && a.validFrom > a.validUntil) problems.push(`${a.id} ends before it starts`);
    for (const r of a.routes) if (!routeIds.has(r)) problems.push(`${a.id} references unknown route ${r}`);
  }
  return problems;
}
