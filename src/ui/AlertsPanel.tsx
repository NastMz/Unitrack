import { useState } from 'react';
import { network } from '../data';
import { ALERT_KIND_LABEL, alertStatus, filterForRoutes, formatDate, sortAlerts } from '../domain/alerts';
import { toLocalTime } from '../domain/schedule';
import type { Alert } from '../domain/types';
import { RouteBadge, SectionTitle } from './common';

const STATUS_LABEL = { programado: 'Programado', vigente: 'Vigente', finalizado: 'Finalizado' } as const;

export function AlertCard({
  alert,
  today,
  unread,
  compact = false,
  onRead,
}: {
  alert: Alert;
  today: string;
  unread: boolean;
  compact?: boolean;
  onRead?: () => void;
}) {
  const status = alertStatus(alert, today);
  const routes = alert.routes.map((id) => network.route(id)).filter((r) => r !== undefined);
  return (
    <article
      className={`alert-card alert-card--${alert.kind} alert-card--${status}${unread ? ' alert-card--unread' : ''}${compact ? ' alert-card--compact' : ''}`}
      aria-label={alert.title}
    >
      <header className="alert-card-head">
        <span className="alert-kind">{ALERT_KIND_LABEL[alert.kind]}</span>
        <span className={`alert-status alert-status--${status}`}>{STATUS_LABEL[status]}</span>
        {unread && <span className="alert-unread-dot" aria-label="Sin leer" />}
      </header>
      <h3>{alert.title}</h3>
      {!compact && <p>{alert.body}</p>}
      <footer className="alert-card-foot">
        <span className="alert-routes">
          {routes.length === 0 ? 'Todas las rutas' : routes.map((r) => <RouteBadge key={r.id} route={r} size="sm" />)}
        </span>
        <time dateTime={alert.published}>{formatDate(alert.published)}</time>
        {onRead && unread && (
          <button type="button" className="link-button" onClick={onRead}>
            Marcar como leído
          </button>
        )}
      </footer>
    </article>
  );
}

interface AlertsPanelProps {
  alerts: readonly Alert[];
  now: Date;
  read: ReadonlySet<string>;
  followed: ReadonlySet<string>;
  onRead: (id: string) => void;
  onReadAll: (ids: string[]) => void;
}

export function AlertsPanel({ alerts, now, read, followed, onRead, onReadAll }: AlertsPanelProps) {
  const [onlyMine, setOnlyMine] = useState(false);
  const today = toLocalTime(now).date;
  const visible = sortAlerts(onlyMine ? filterForRoutes(alerts, followed) : alerts, today);
  const unreadIds = visible.filter((a) => !read.has(a.id)).map((a) => a.id);
  const followedRoutes = network.routes.filter((r) => followed.has(r.id));
  return (
    <div className="panel-body">
      <header className="page-hero">
        <p className="eyebrow">Avisos de las rutas</p>
        <h1>Novedades del servicio</h1>
        <p>Desvíos, cambios de horario y suspensiones publicados para las rutas universitarias.</p>
      </header>
      <div className="alerts-toolbar">
        <div className="segmented" role="group" aria-label="Filtrar avisos">
          <button type="button" aria-pressed={!onlyMine} onClick={() => setOnlyMine(false)}>
            Todos
          </button>
          <button type="button" aria-pressed={onlyMine} onClick={() => setOnlyMine(true)}>
            Mis rutas{followed.size > 0 ? ` (${followed.size})` : ''}
          </button>
        </div>
        <button type="button" className="link-button" disabled={unreadIds.length === 0} onClick={() => onReadAll(unreadIds)}>
          Marcar todo como leído
        </button>
      </div>
      {onlyMine && followedRoutes.length === 0 && (
        <p className="notice">Aún no sigues ninguna ruta. Abre una ruta y pulsa “Seguir” para filtrar sus avisos.</p>
      )}
      {onlyMine && followedRoutes.length > 0 && (
        <p className="section-meta following">
          Siguiendo: {followedRoutes.map((r) => <RouteBadge key={r.id} route={r} size="sm" />)}
        </p>
      )}
      <SectionTitle>{visible.length} avisos</SectionTitle>
      <div className="alert-list">
        {visible.map((a) => (
          <AlertCard key={a.id} alert={a} today={today} unread={!read.has(a.id)} onRead={() => onRead(a.id)} />
        ))}
      </div>
    </div>
  );
}
