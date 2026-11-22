import { useCallback, useMemo, useState } from 'react';
import { alerts, basemap, network } from '../data';
import { alertStatus, sortAlerts, unreadCount } from '../domain/alerts';
import { nearestStops } from '../domain/nearby';
import { formatClock, toLocalTime, weekdayName } from '../domain/schedule';
import { project } from '../lib/geo';
import { TransitMap, type MapFocus } from '../map/TransitMap';
import { AboutPanel } from '../ui/AboutPanel';
import { AlertsPanel } from '../ui/AlertsPanel';
import { Icon, Link } from '../ui/common';
import { HomePanel, type LocateState } from '../ui/HomePanel';
import { RoutePanel } from '../ui/RoutePanel';
import { RoutesPanel } from '../ui/RoutesPanel';
import { StopPanel } from '../ui/StopPanel';
import { navigate, usePersistentSet, useNow, useScreen, type Screen } from './hooks';

const FOLLOWED_KEY = 'unitrack:rutas-seguidas';
const READ_KEY = 'unitrack:avisos-leidos';

function focusFor(screen: Screen, locate: LocateState): MapFocus {
  if (screen.name === 'route' && network.route(screen.routeId)) {
    return { kind: 'route', routeId: screen.routeId, direction: screen.direction };
  }
  if (screen.name === 'stop' && network.stop(screen.stopId)) return { kind: 'stop', stopId: screen.stopId };
  if (screen.name === 'home' && locate.status === 'found') return { kind: 'stop', stopId: locate.nearby[0].stop.id };
  return { kind: 'all' };
}

const TABS: Array<{ screen: Screen; label: string; icon: 'map' | 'routes' | 'bell' | 'info'; match: Screen['name'][] }> = [
  { screen: { name: 'home' }, label: 'Mapa', icon: 'map', match: ['home', 'stop'] },
  { screen: { name: 'routes' }, label: 'Rutas', icon: 'routes', match: ['routes', 'route'] },
  { screen: { name: 'alerts' }, label: 'Avisos', icon: 'bell', match: ['alerts'] },
  { screen: { name: 'about' }, label: 'Acerca', icon: 'info', match: ['about'] },
];

export function App() {
  const screen = useScreen();
  const now = useNow();
  const [followed, toggleFollow] = usePersistentSet(FOLLOWED_KEY);
  const [read, toggleRead, markRead] = usePersistentSet(READ_KEY);
  const [locate, setLocate] = useState<LocateState>({ status: 'idle' });
  const [userPoint, setUserPoint] = useState<{ x: number; y: number } | null>(null);

  const local = toLocalTime(now);
  const unread = unreadCount(alerts, read, local.date);
  const latestAlert = useMemo(
    () => sortAlerts(alerts, local.date).find((a) => alertStatus(a, local.date) !== 'finalizado'),
    [local.date],
  );

  const onLocate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocate({ status: 'error', message: 'Este navegador no permite conocer tu ubicación.' });
      return;
    }
    setLocate({ status: 'locating' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const here = { lat: position.coords.latitude, lon: position.coords.longitude };
        setUserPoint(project(basemap.projection, here));
        setLocate({ status: 'found', nearby: nearestStops(network.stops, here, 3) });
      },
      () => setLocate({ status: 'error', message: 'No pudimos obtener tu ubicación. Revisa los permisos del navegador.' }),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  const focus = focusFor(screen, locate);
  const selectedStopId = focus.kind === 'stop' ? focus.stopId : undefined;

  let panel;
  switch (screen.name) {
    case 'route': {
      const route = network.route(screen.routeId);
      panel = route ? (
        <RoutePanel
          route={route}
          direction={screen.direction}
          now={now}
          followed={followed.has(route.id)}
          onToggleFollow={() => toggleFollow(route.id)}
          alerts={alerts}
          read={read}
        />
      ) : (
        <NotFound what="Esta ruta no existe." />
      );
      break;
    }
    case 'stop': {
      const stop = network.stop(screen.stopId);
      panel = stop ? <StopPanel stop={stop} now={now} /> : <NotFound what="Este paradero no existe." />;
      break;
    }
    case 'routes':
      panel = <RoutesPanel now={now} followed={followed} />;
      break;
    case 'alerts':
      panel = (
        <AlertsPanel
          alerts={alerts}
          now={now}
          read={read}
          followed={followed}
          onRead={(id) => toggleRead(id, true)}
          onReadAll={markRead}
        />
      );
      break;
    case 'about':
      panel = <AboutPanel />;
      break;
    default:
      panel = <HomePanel now={now} latestAlert={latestAlert} unread={unread} locate={locate} onLocate={onLocate} />;
  }

  return (
    <div className="app" data-screen={screen.name}>
      <header className="app-header">
        <a href="#/" className="brand" aria-label="Unitrack, inicio">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="15" />
              <path d="M6 20h20M9 20l3-8h8l3 8M12 12l4-5 4 5" />
            </svg>
          </span>
          <span className="brand-text">
            <span className="brand-name">Unitrack</span>
            <span className="brand-tagline">Rutas Unillanos · Villavicencio</span>
          </span>
        </a>
        <p className="clock" aria-label="Hora local">
          <Icon name="clock" />
          <span>
            {weekdayName(local.weekday).slice(0, 3)} {formatClock(local.minutes)}
          </span>
        </p>
      </header>
      <div className="horizon" aria-hidden="true" />
      <main className="app-map">
        <TransitMap
          focus={focus}
          selectedStopId={selectedStopId}
          userPosition={userPoint}
          onSelectStop={(stopId) => navigate({ name: 'stop', stopId })}
        />
      </main>
      <section className="app-panel" aria-live="polite">
        {panel}
      </section>
      <nav className="app-tabs" aria-label="Secciones">
        {TABS.map((tab) => (
          <Link
            key={tab.label}
            to={tab.screen}
            className={tab.match.includes(screen.name) ? 'tab tab--on' : 'tab'}
          >
            <Icon name={tab.icon} />
            <span>{tab.label}</span>
            {tab.icon === 'bell' && unread > 0 && <span className="tab-badge">{unread}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function NotFound({ what }: { what: string }) {
  return (
    <div className="panel-body">
      <p className="notice notice--warn">{what}</p>
      <Link to={{ name: 'home' }} className="button">
        Volver al mapa
      </Link>
    </div>
  );
}
