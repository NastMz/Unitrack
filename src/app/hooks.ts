import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

// ---------------------------------------------------------------- hash routing

export type Screen =
  | { name: 'home' }
  | { name: 'routes' }
  | { name: 'route'; routeId: string; direction: 'inbound' | 'outbound' }
  | { name: 'stop'; stopId: string }
  | { name: 'alerts' }
  | { name: 'about' };

/** Parses `#/ruta/porfia?sentido=regreso` style hashes. Unknown hashes fall back to home. */
export function parseHash(hash: string): Screen {
  const [path, query = ''] = hash.replace(/^#/, '').split('?');
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  const params = new URLSearchParams(query);
  switch (parts[0]) {
    case 'rutas':
      return { name: 'routes' };
    case 'ruta':
      return parts[1]
        ? { name: 'route', routeId: parts[1], direction: params.get('sentido') === 'regreso' ? 'outbound' : 'inbound' }
        : { name: 'routes' };
    case 'paradero':
      return parts[1] ? { name: 'stop', stopId: parts[1] } : { name: 'home' };
    case 'avisos':
      return { name: 'alerts' };
    case 'acerca':
      return { name: 'about' };
    default:
      return { name: 'home' };
  }
}

export function screenHref(screen: Screen): string {
  switch (screen.name) {
    case 'home':
      return '#/';
    case 'routes':
      return '#/rutas';
    case 'route':
      return `#/ruta/${encodeURIComponent(screen.routeId)}${screen.direction === 'outbound' ? '?sentido=regreso' : ''}`;
    case 'stop':
      return `#/paradero/${encodeURIComponent(screen.stopId)}`;
    case 'alerts':
      return '#/avisos';
    case 'about':
      return '#/acerca';
  }
}

function subscribeHash(callback: () => void) {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}

export function useScreen(): Screen {
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash, () => '');
  return parseHash(hash);
}

export function navigate(screen: Screen): void {
  window.location.hash = screenHref(screen);
}

// ---------------------------------------------------------------- clock

/**
 * Current time, refreshed every 20 s. A fixed demo clock can be set with
 * `?ahora=2026-11-23T07:05` (Villavicencio local time) for presentations.
 */
export function useNow(): Date {
  const fixed = readFixedClock();
  const [now, setNow] = useState(() => fixed ?? new Date());
  useEffect(() => {
    if (fixed) return undefined;
    const id = window.setInterval(() => setNow(new Date()), 20_000);
    return () => window.clearInterval(id);
  }, [fixed]);
  return fixed ?? now;
}

let cachedClock: { search: string; value: Date | null } | null = null;

export function readFixedClock(search = window.location.search): Date | null {
  if (cachedClock?.search === search) return cachedClock.value;
  const raw = new URLSearchParams(search).get('ahora');
  const match = raw && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw) ? new Date(`${raw}:00-05:00`) : null;
  const value = match && !Number.isNaN(match.getTime()) ? match : null;
  cachedClock = { search, value };
  return value;
}

// ---------------------------------------------------------------- persistence

function readSet(key: string): Set<string> {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []);
  } catch {
    return new Set();
  }
}

/** A string set persisted in localStorage (best effort: works without storage too). */
export function usePersistentSet(
  key: string,
): [ReadonlySet<string>, (value: string, on?: boolean) => void, (values: string[]) => void] {
  const [set, setSet] = useState<ReadonlySet<string>>(() => readSet(key));
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify([...set]));
    } catch {
      // Storage can be unavailable (private mode); the in-memory state still works.
    }
  }, [key, set]);
  const toggle = useCallback((value: string, on?: boolean) => {
    setSet((current) => {
      const next = new Set(current);
      if (on ?? !next.has(value)) next.add(value);
      else next.delete(value);
      return next;
    });
  }, []);
  const addAll = useCallback((values: string[]) => setSet((current) => new Set([...current, ...values])), []);
  return [set, toggle, addAll];
}

// ---------------------------------------------------------------- layout

export function useElementSize<T extends Element>(): [React.RefObject<T | null>, { width: number; height: number }] {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const update = () => {
      const rect = element.getBoundingClientRect();
      setSize((s) => (s.width === rect.width && s.height === rect.height ? s : { width: rect.width, height: rect.height }));
    };
    update();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, size];
}
