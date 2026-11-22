import type { ReactNode } from 'react';
import { screenHref, type Screen } from '../app/hooks';
import type { Route } from '../domain/types';

export function RouteBadge({ route, size = 'md' }: { route: Route; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`route-badge route-badge--${size}`} style={{ '--route': route.color } as React.CSSProperties}>
      {route.code}
    </span>
  );
}

export function Link({ to, className, children, label }: { to: Screen; className?: string; children: ReactNode; label?: string }) {
  return (
    <a href={screenHref(to)} className={className} aria-label={label}>
      {children}
    </a>
  );
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="section-title">
      <h2>{children}</h2>
      {aside}
    </div>
  );
}

type IconName = 'map' | 'routes' | 'bell' | 'info' | 'locate' | 'search' | 'star' | 'star-filled' | 'back' | 'clock';

const ICONS: Record<IconName, ReactNode> = {
  map: <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14" />,
  routes: (
    <>
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" />
    </>
  ),
  bell: <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5v.5" />
    </>
  ),
  locate: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l5 5" />
    </>
  ),
  star: <path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8z" />,
  'star-filled': <path className="icon-fill" d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8z" />,
  back: <path d="M15 5l-7 7 7 7" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
};

export function Icon({ name }: { name: IconName }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}
