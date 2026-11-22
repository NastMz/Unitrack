import { network, shapeOf } from '../data';
import { CAMPUS_STOP_ID, directionLabel } from '../domain/network';
import { formatClock, formatWait, nextBusesAt } from '../domain/schedule';
import type { Stop } from '../domain/types';
import { Icon, Link, RouteBadge, SectionTitle } from './common';

export function StopPanel({ stop, now }: { stop: Stop; now: Date }) {
  const routes = network.routesAt(stop.id);
  const buses = nextBusesAt(network, shapeOf, stop.id, now, 6);
  const campus = stop.id === CAMPUS_STOP_ID;
  return (
    <div className="panel-body stop-panel">
      <header className="stop-hero">
        <Link to={{ name: 'home' }} className="back-link" label="Volver al mapa">
          <Icon name="back" />
        </Link>
        <div>
          <p className="eyebrow">{campus ? 'Paradero del campus' : 'Paradero'}</p>
          <h1>{stop.name}</h1>
          <p className="stop-hero-description">{stop.description}</p>
        </div>
      </header>

      <div className="stop-routes" aria-label="Rutas que pasan por aquí">
        {routes.map((r) => (
          <Link key={r.id} to={{ name: 'route', routeId: r.id, direction: 'inbound' }} className="stop-route-chip">
            <RouteBadge route={r} size="sm" />
            {r.name}
          </Link>
        ))}
      </div>

      <SectionTitle aside={<span className="section-meta">Hora estimada en este paradero</span>}>Próximos buses</SectionTitle>
      {buses.length === 0 ? (
        <p className="notice">No hay salidas programadas desde este paradero.</p>
      ) : (
        <ol className="arrivals" aria-label="Próximos buses">
          {buses.map((bus, i) => (
            <li
              key={`${bus.route.id}-${bus.direction}-${bus.departure}-${bus.dayOffset}`}
              className={i === 0 ? 'arrival arrival--first' : 'arrival'}
              style={{ '--route': bus.route.color } as React.CSSProperties}
            >
              <RouteBadge route={bus.route} />
              <span className="arrival-where">
                <strong>{bus.route.name}</strong>
                <small>{directionLabel(bus.route, bus.direction)}</small>
              </span>
              <span className="arrival-when">
                <strong>{formatWait(bus)}</strong>
                <small>{formatClock(bus.at)}</small>
              </span>
            </li>
          ))}
        </ol>
      )}
      <p className="footnote">
        La hora en el paradero se estima a partir de la salida programada, la distancia por las calles y una velocidad media de
        20 km/h. Puede variar con el tráfico.
      </p>
    </div>
  );
}
