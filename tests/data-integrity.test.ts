import { describe, expect, it } from 'vitest';
import { alerts, basemap, network, networkData, shapes, stopPoint } from '../src/data';
import { validateAlerts } from '../src/domain/alerts';
import { CAMPUS_STOP_ID, validateNetwork } from '../src/domain/network';
import type { NetworkData } from '../src/domain/types';

describe('bundled network seed', () => {
  it('has no integrity problems', () => {
    expect(validateNetwork(networkData, shapes)).toEqual([]);
  });

  it('keeps the nine university routes of the original projects', () => {
    expect(network.routes.map((r) => r.code)).toEqual(['POR', 'VIV', 'VCE', 'GRA', 'TER', 'COV', 'MAR', 'MON', 'PAR']);
    expect(network.stops).toHaveLength(59);
  });

  it('serves the campus from every route', () => {
    expect(network.routesAt(CAMPUS_STOP_ID)).toHaveLength(network.routes.length);
  });

  it('merges stops shared by several routes', () => {
    expect(network.routesAt('yamaha-jordan').map((r) => r.id)).toEqual(['grama-postobon', 'terminal']);
    expect(network.routesAt('panaderia-kirpan').map((r) => r.id)).toEqual(['covisan', 'maracos']);
  });

  it('places every stop inside the bundled map frame', () => {
    const f = basemap.frame;
    for (const stop of network.stops) {
      const p = stopPoint(stop.id);
      expect(p.x).toBeGreaterThan(f.x);
      expect(p.x).toBeLessThan(f.x + f.width);
      expect(p.y).toBeGreaterThan(f.y);
      expect(p.y).toBeLessThan(f.y + f.height);
    }
  });

  it('draws every route shape close to its stops', () => {
    for (const route of network.routes) {
      const shape = shapes[`${route.id}:inbound`];
      const first = stopPoint(route.inbound.stops[0]);
      const last = stopPoint(route.inbound.stops[route.inbound.stops.length - 1]);
      expect(Math.hypot(shape.path[0] - first.x, shape.path[1] - first.y)).toBeLessThan(5);
      const n = shape.path.length;
      expect(Math.hypot(shape.path[n - 2] - last.x, shape.path[n - 1] - last.y)).toBeLessThan(5);
    }
  });

  it('credits OpenStreetMap in the basemap', () => {
    expect(basemap.attribution).toBe('© OpenStreetMap contributors');
  });
});

describe('notices seed', () => {
  it('has no integrity problems', () => {
    expect(validateAlerts(alerts, new Set(network.routes.map((r) => r.id)))).toEqual([]);
  });
});

describe('network validation', () => {
  const base = (): NetworkData => structuredClone(networkData);

  it('reports unknown stops, broken campus ends and bad times', () => {
    const data = base();
    data.routes[0].inbound.stops = ['ghost', ...data.routes[0].inbound.stops.slice(1, -1)];
    data.routes[1].outbound.departures = ['11:00', '10:00', '25:00'];
    const problems = validateNetwork(data);
    expect(problems).toContain('porfia:inbound references unknown stop ghost');
    expect(problems).toContain('porfia:inbound must end at the campus');
    expect(problems).toContain('viva:outbound departures are not strictly increasing');
    expect(problems).toContain('viva:outbound has a bad departure time 25:00');
  });

  it('reports duplicated ids and unused stops', () => {
    const data = base();
    data.stops.push({ ...data.stops[0] });
    data.stops.push({ id: 'lonely', name: 'Sola', description: '', lat: 4.1, lon: -73.6 });
    const problems = validateNetwork(data);
    expect(problems).toContain(`duplicate stop id ${data.stops[0].id}`);
    expect(problems).toContain('stop lonely is not served by any route');
  });

  it('reports shapes that do not match the stop sequence', () => {
    const broken = { ...shapes, 'viva:inbound': { path: [], legs: [100] } };
    expect(validateNetwork(networkData, broken)).toContain('viva:inbound shape legs do not match its stops');
  });
});
