import { useState } from 'react';
import { navigate } from '../app/hooks';
import { network } from '../data';
import { ALERT_KIND_LABEL } from '../domain/alerts';
import { MAX_NEARBY_METERS, formatDistance, type NearbyStop } from '../domain/nearby';
import { search } from '../domain/search';
import { formatClock, nextDepartureIndex, parseClock, toLocalTime, weekdayName, isServiceDay } from '../domain/schedule';
import type { Alert } from '../domain/types';
import { Icon, Link, RouteBadge, SectionTitle } from './common';

export type LocateState =
  | { status: 'idle' }
  | { status: 'locating' }
  | { status: 'error'; message: string }
  | { status: 'found'; nearby: NearbyStop[] };

interface HomePanelProps {
  now: Date;
  latestAlert?: Alert;
  unread: number;
  locate: LocateState;
  onLocate: () => void;
}

export function SearchBox() {
  const [query, setQuery] = useState('');
  const results = search(network, query);
  return (
    <div className="search">
      <label className="search-field">
        <Icon name="search" />
        <span className="visually-hidden">Buscar ruta o paradero</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca una ruta o un paradero"
          autoComplete="off"
          enterKeyHint="search"
        />
      </label>
      {query.trim() && (
        <ul className="search-results" aria-label="Resultados de búsqueda">
          {results.length === 0 && <li className="search-empty">Sin coincidencias para “{query.trim()}”.</li>}
          {results.map((r) =>
            r.kind === 'route' ? (
              <li key={`r-${r.route.id}`}>
                <Link to={{ name: 'route', routeId: r.route.id, direction: 'inbound' }} className="search-result">
                  <RouteBadge route={r.route} size="sm" />
                  <span>
                    <strong>Ruta {r.route.name}</strong>
                    <small>{r.route.inbound.stops.length - 1} paraderos hasta Unillanos</small>
                  </span>
                </Link>
              </li>
            ) : (
              <li key={`s-${r.stop.id}`}>
                <Link to={{ name: 'stop', stopId: r.stop.id }} className="search-result">
                  <span className="stop-dot" aria-hidden="true" />
                  <span>
                    <strong>{r.stop.name}</strong>
                    <small>{network.routesAt(r.stop.id).map((x) => x.name).join(' · ')}</small>
                  </span>
                </Link>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}

function NextToCampus({ now }: { now: Date }) {
  const local = toLocalTime(now);
  const upcoming = network.routes
    .map((route) => {
      const i = nextDepartureIndex(route.inbound.departures, now);
      return { route, departure: i >= 0 ? route.inbound.departures[i] : undefined };
    })
    .sort((a, b) => (a.departure ? parseClock(a.departure) : 9999) - (b.departure ? parseClock(b.departure) : 9999));
  return (
    <ul className="route-board" aria-label="Próximas salidas hacia Unillanos">
      {upcoming.map(({ route, departure }) => (
        <li key={route.id}>
          <Link to={{ name: 'route', routeId: route.id, direction: 'inbound' }} className="route-board-row">
            <RouteBadge route={route} />
            <span className="route-board-name">{route.name}</span>
            <span className={departure ? 'route-board-time' : 'route-board-time route-board-time--none'}>
              {departure ? formatClock(parseClock(departure)) : isServiceDay(local.weekday) ? 'Sin más salidas hoy' : 'Sin servicio hoy'}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function HomePanel({ now, latestAlert, unread, locate, onLocate }: HomePanelProps) {
  const local = toLocalTime(now);
  return (
    <div className="panel-body">
      <SearchBox />
      <div className="home-actions">
        <button type="button" className="button button--primary" onClick={onLocate} disabled={locate.status === 'locating'}>
          <Icon name="locate" />
          {locate.status === 'locating' ? 'Buscando tu ubicación…' : 'Paradero más cercano'}
        </button>
      </div>
      {locate.status === 'error' && <p className="notice notice--warn">{locate.message}</p>}
      {locate.status === 'found' && (
        <div className="nearby">
          {locate.nearby[0].meters > MAX_NEARBY_METERS && (
            <p className="notice notice--warn">Estás lejos de las rutas universitarias. Estos son los paraderos más cercanos:</p>
          )}
          <ul className="nearby-list">
            {locate.nearby.map((n) => (
              <li key={n.stop.id}>
                <button type="button" className="nearby-item" onClick={() => navigate({ name: 'stop', stopId: n.stop.id })}>
                  <span className="stop-dot" aria-hidden="true" />
                  <span>
                    <strong>{n.stop.name}</strong>
                    <small>{network.routesAt(n.stop.id).map((r) => r.code).join(' · ')}</small>
                  </span>
                  <span className="nearby-distance">{formatDistance(n.meters)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {latestAlert && (
        <Link to={{ name: 'alerts' }} className="alert-banner">
          <span className="alert-banner-kind">{ALERT_KIND_LABEL[latestAlert.kind]}</span>
          <span className="alert-banner-title">{latestAlert.title}</span>
          {unread > 0 && <span className="alert-banner-count">{unread} sin leer</span>}
        </Link>
      )}
      <SectionTitle aside={<span className="section-meta">{weekdayName(local.weekday)} · {formatClock(local.minutes)}</span>}>
        Próximas salidas hacia la U
      </SectionTitle>
      <NextToCampus now={now} />
    </div>
  );
}
