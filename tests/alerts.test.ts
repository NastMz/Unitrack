import { describe, expect, it } from 'vitest';
import {
  affectsRoute,
  alertStatus,
  filterForRoutes,
  formatDate,
  sortAlerts,
  unreadCount,
  validateAlerts,
} from '../src/domain/alerts';
import type { Alert } from '../src/domain/types';

const make = (over: Partial<Alert>): Alert => ({
  id: 'x',
  kind: 'novedad',
  title: 'T',
  body: 'B',
  published: '2026-11-01',
  routes: [],
  ...over,
});

describe('alert status', () => {
  const windowed = make({ validFrom: '2026-11-10', validUntil: '2026-11-20' });
  it('is scheduled, current or ended depending on the date', () => {
    expect(alertStatus(windowed, '2026-11-09')).toBe('programado');
    expect(alertStatus(windowed, '2026-11-10')).toBe('vigente');
    expect(alertStatus(windowed, '2026-11-20')).toBe('vigente');
    expect(alertStatus(windowed, '2026-11-21')).toBe('finalizado');
    expect(alertStatus(make({}), '2030-01-01')).toBe('vigente');
  });
});

describe('route relevance', () => {
  const global = make({ id: 'g' });
  const covisan = make({ id: 'c', routes: ['covisan'] });
  const parque = make({ id: 'p', routes: ['parque'] });

  it('treats network-wide notices as affecting every route', () => {
    expect(affectsRoute(global, 'viva')).toBe(true);
    expect(affectsRoute(covisan, 'viva')).toBe(false);
  });

  it('filters by followed routes, or keeps all when nothing is followed', () => {
    expect(filterForRoutes([global, covisan, parque], new Set(['parque'])).map((a) => a.id)).toEqual(['g', 'p']);
    expect(filterForRoutes([global, covisan], new Set())).toHaveLength(2);
  });
});

describe('ordering and unread count', () => {
  const ended = make({ id: 'old', published: '2026-11-15', validUntil: '2026-11-16' });
  const recent = make({ id: 'new', published: '2026-11-14' });
  const older = make({ id: 'older', published: '2026-11-02' });

  it('lists current notices newest first, ended ones last', () => {
    expect(sortAlerts([older, ended, recent], '2026-11-22').map((a) => a.id)).toEqual(['new', 'older', 'old']);
  });

  it('counts unread notices that have not ended', () => {
    expect(unreadCount([older, ended, recent], new Set(['new']), '2026-11-22')).toBe(1);
  });

  it('formats dates in Spanish', () => {
    expect(formatDate('2026-11-05')).toBe('5 nov 2026');
  });
});

describe('alert validation', () => {
  it('reports unknown routes, bad dates and inverted windows', () => {
    const problems = validateAlerts(
      [
        make({ id: 'a', routes: ['ghost'] }),
        make({ id: 'b', published: '05/11/2026' }),
        make({ id: 'c', validFrom: '2026-12-01', validUntil: '2026-11-01' }),
        make({ id: 'c' }),
      ],
      new Set(['viva']),
    );
    expect(problems).toEqual([
      'a references unknown route ghost',
      'b has a bad date 05/11/2026',
      'c ends before it starts',
      'duplicate notice id c',
    ]);
  });
});
