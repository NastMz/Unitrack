import { network, shapeOf } from '../data';
import { formatClock, nextDepartureIndex, parseClock } from '../domain/schedule';
import type { Route } from '../domain/types';
import { Icon, Link, RouteBadge } from './common';

function nextLabel(departures: readonly string[], now: Date): string {
  const i = nextDepartureIndex(departures, now);
  return i >= 0 ? formatClock(parseClock(departures[i])) : '—';
}

function RouteCard({ route, now, followed }: { route: Route; now: Date; followed: boolean }) {
  const km = (shapeOf(route, 'inbound')?.legs.reduce((a, b) => a + b, 0) ?? 0) / 1000;
  const stops = network.stopsOf(route, 'inbound');
  return (
    <li>
      <Link
        to={{ name: 'route', routeId: route.id, direction: 'inbound' }}
        className="route-card"
        label={`Ruta ${route.name}`}
      >
        <span className="route-card-band" style={{ background: route.color }} aria-hidden="true" />
        <RouteBadge route={route} size="lg" />
        <span className="route-card-body">
          <strong>
            {route.name}
            {followed && (
              <span className="route-card-star" aria-label="Siguiendo">
                <Icon name="star-filled" />
              </span>
            )}
          </strong>
          <small>
            {stops[0]?.name} → Unillanos · {stops.length} paraderos · {km.toFixed(1).replace('.', ',')} km
          </small>
          <span className="route-card-next">
            <span>
              Hacia la U <b>{nextLabel(route.inbound.departures, now)}</b>
            </span>
            <span>
              Regreso <b>{nextLabel(route.outbound.departures, now)}</b>
            </span>
          </span>
        </span>
      </Link>
    </li>
  );
}

export function RoutesPanel({ now, followed }: { now: Date; followed: ReadonlySet<string> }) {
  const ordered = [...network.routes].sort((a, b) => Number(followed.has(b.id)) - Number(followed.has(a.id)));
  return (
    <div className="panel-body">
      <header className="page-hero">
        <p className="eyebrow">Nueve líneas · una sede</p>
        <h1>Rutas a la sede Barcelona</h1>
        <p>Cada ruta sale de su barrio hacia la universidad en la mañana y regresa al mediodía y en la tarde.</p>
      </header>
      <ul className="route-cards">
        {ordered.map((r) => (
          <RouteCard key={r.id} route={r} now={now} followed={followed.has(r.id)} />
        ))}
      </ul>
    </div>
  );
}
