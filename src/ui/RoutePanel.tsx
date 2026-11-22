import { useState } from 'react';
import { network, shapeOf } from '../data';
import { affectsRoute, alertStatus, sortAlerts } from '../domain/alerts';
import { CAMPUS_STOP_ID, directionLabel } from '../domain/network';
import { formatClock, isServiceDay, nextDepartureIndex, parseClock, stopOffsets, toLocalTime, tripTimes } from '../domain/schedule';
import type { Alert, DirectionKey, Route } from '../domain/types';
import { AlertCard } from './AlertsPanel';
import { Icon, Link, RouteBadge, SectionTitle } from './common';

interface RoutePanelProps {
  route: Route;
  direction: DirectionKey;
  now: Date;
  followed: boolean;
  onToggleFollow: () => void;
  alerts: readonly Alert[];
  read: ReadonlySet<string>;
}

export function RoutePanel({ route, direction, now, followed, onToggleFollow, alerts, read }: RoutePanelProps) {
  const { departures } = route[direction];
  const nextIndex = nextDepartureIndex(departures, now);
  const [chosen, setChosen] = useState<{ key: string; index: number } | null>(null);
  const key = `${route.id}:${direction}`;
  const selectedIndex = chosen?.key === key ? chosen.index : Math.max(0, nextIndex);
  const stops = network.stopsOf(route, direction);
  const legs = shapeOf(route, direction)?.legs ?? [];
  const times = tripTimes(departures[selectedIndex], stopOffsets(legs));
  const km = legs.reduce((a, b) => a + b, 0) / 1000;
  const local = toLocalTime(now);
  const today = local.date;
  const routeAlerts = sortAlerts(alerts, today).filter((a) => a.routes.includes(route.id) && alertStatus(a, today) !== 'finalizado');
  const generalAlerts = alerts.filter((a) => affectsRoute(a, route.id) && a.routes.length === 0 && alertStatus(a, today) === 'vigente');

  return (
    <div className="panel-body route-panel" style={{ '--route': route.color } as React.CSSProperties}>
      <header className="route-hero">
        <Link to={{ name: 'routes' }} className="back-link" label="Volver a las rutas">
          <Icon name="back" />
        </Link>
        <RouteBadge route={route} size="lg" />
        <div className="route-hero-text">
          <p className="eyebrow">Ruta universitaria</p>
          <h1>{route.name}</h1>
          <p className="route-hero-meta">
            {stops.length} paraderos · {km.toFixed(1).replace('.', ',')} km · {Math.round(times[times.length - 1] - times[0])} min aprox.
          </p>
        </div>
        <button
          type="button"
          className={followed ? 'follow follow--on' : 'follow'}
          onClick={onToggleFollow}
          aria-pressed={followed}
        >
          <Icon name={followed ? 'star-filled' : 'star'} />
          {followed ? 'Siguiendo' : 'Seguir'}
        </button>
      </header>

      <nav className="direction-switch" aria-label="Sentido del recorrido">
        {(['inbound', 'outbound'] as const).map((d) => (
          <Link
            key={d}
            to={{ name: 'route', routeId: route.id, direction: d }}
            className={d === direction ? 'direction-option direction-option--on' : 'direction-option'}
          >
            {directionLabel(route, d)}
          </Link>
        ))}
      </nav>

      {routeAlerts.map((a) => (
        <AlertCard key={a.id} alert={a} today={today} unread={!read.has(a.id)} compact />
      ))}

      <SectionTitle
        aside={
          <span className="section-meta">
            {nextIndex >= 0 ? `Próxima: ${formatClock(parseClock(departures[nextIndex]))}` : isServiceDay(local.weekday) ? 'No hay más salidas hoy' : 'Sin servicio hoy'}
          </span>
        }
      >
        Salidas desde {stops[0]?.id === CAMPUS_STOP_ID ? 'Unillanos' : stops[0]?.name}
      </SectionTitle>
      <div className="departures" role="listbox" aria-label="Salidas">
        {departures.map((d, i) => (
          <button
            key={d}
            type="button"
            role="option"
            aria-selected={i === selectedIndex}
            className={[
              'departure',
              i === selectedIndex ? 'departure--on' : '',
              nextIndex >= 0 && i < nextIndex ? 'departure--past' : '',
              i === nextIndex ? 'departure--next' : '',
            ].join(' ')}
            onClick={() => setChosen({ key, index: i })}
          >
            {formatClock(parseClock(d))}
          </button>
        ))}
      </div>

      <SectionTitle aside={<span className="section-meta">Horas estimadas</span>}>Recorrido</SectionTitle>
      <ol className="line-strip">
        {stops.map((stop, i) => {
          const transfers = network.routesAt(stop.id).filter((r) => r.id !== route.id);
          const campus = stop.id === CAMPUS_STOP_ID;
          return (
            <li key={stop.id} className={campus ? 'line-stop line-stop--campus' : 'line-stop'}>
              <span className="line-stop-time">{formatClock(times[i])}</span>
              <span className="line-stop-node" aria-hidden="true" />
              <Link to={{ name: 'stop', stopId: stop.id }} className="line-stop-name">
                <strong>{stop.name}</strong>
                <small>{stop.description}</small>
                {transfers.length > 0 && !campus && (
                  <span className="line-stop-transfers">
                    Conexión con {transfers.map((r) => <RouteBadge key={r.id} route={r} size="sm" />)}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
      {generalAlerts.length > 0 && (
        <p className="footnote">
          Hay {generalAlerts.length} aviso{generalAlerts.length > 1 ? 's' : ''} vigente{generalAlerts.length > 1 ? 's' : ''} para todas las rutas.{' '}
          <Link to={{ name: 'alerts' }}>Ver avisos</Link>
        </p>
      )}
    </div>
  );
}
