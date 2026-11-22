import { describe, expect, it } from 'vitest';
import { network } from '../src/data';
import { formatDistance, nearestStops } from '../src/domain/nearby';
import {
  flatToPath,
  haversineMeters,
  offsetPolyline,
  polylineLength,
  project,
  simplify,
  unflatten,
  unproject,
} from '../src/lib/geo';
import { clampView, fitView, panBy, placeLabels, resizeView, screenToWorld, worldToScreen, zoomAt } from '../src/map/camera';

const projection = { lat0: 4.108, lon0: -73.62 };

describe('projection', () => {
  it('maps the origin to zero and grows x east, y south', () => {
    expect(project(projection, { lat: 4.108, lon: -73.62 })).toEqual({ x: 0, y: 0 });
    const ne = project(projection, { lat: 4.118, lon: -73.61 });
    expect(ne.x).toBeGreaterThan(0);
    expect(ne.y).toBeLessThan(0);
  });

  it('round-trips through unproject', () => {
    const coord = { lat: 4.0752029, lon: -73.5855988 };
    const back = unproject(projection, project(projection, coord));
    expect(back.lat).toBeCloseTo(coord.lat, 9);
    expect(back.lon).toBeCloseTo(coord.lon, 9);
  });

  it('agrees with great-circle distance within 0.1 % across the city', () => {
    const a = { lat: 4.0594, lon: -73.6701 };
    const b = { lat: 4.1584, lon: -73.641 };
    const pa = project(projection, a);
    const pb = project(projection, b);
    const planar = Math.hypot(pb.x - pa.x, pb.y - pa.y);
    const sphere = haversineMeters(a, b);
    expect(Math.abs(planar - sphere) / sphere).toBeLessThan(0.001);
    expect(sphere).toBeGreaterThan(11_000);
    expect(sphere).toBeLessThan(12_000);
  });
});

describe('polyline helpers', () => {
  it('measures, unflattens and builds SVG paths', () => {
    expect(polylineLength(unflatten([0, 0, 3, 4, 3, 10]))).toBe(11);
    expect(flatToPath([0, 0, 3, 4])).toBe('M0 0L3 4');
    expect(flatToPath([0, 0, 3, 4, 0, 4], true)).toBe('M0 0L3 4L0 4Z');
    expect(flatToPath([1, 2])).toBe('');
  });

  it('simplifies collinear points but keeps corners and endpoints', () => {
    const line = unflatten([0, 0, 5, 0.2, 10, 0, 10, 10]);
    expect(simplify(line, 1)).toEqual(unflatten([0, 0, 10, 0, 10, 10]));
    expect(simplify(line, 0.1)).toHaveLength(4);
  });
});

describe('offsetPolyline', () => {
  it('shifts a straight line by the offset and keeps it parallel', () => {
    const shifted = offsetPolyline(unflatten([0, 0, 10, 0, 20, 0]), 2);
    shifted.forEach((p, i) => {
      expect(p.x).toBeCloseTo(i * 10);
      expect(Math.abs(p.y)).toBeCloseTo(2);
    });
  });

  it('keeps a right-angle corner at the miter distance and returns copies for zero offset', () => {
    const corner = offsetPolyline(unflatten([0, 0, 10, 0, 10, 10]), 1);
    expect(Math.hypot(corner[1].x - 10, corner[1].y)).toBeCloseTo(Math.SQRT2);
    const tapered = offsetPolyline(unflatten([0, 0, 10, 0, 20, 0, 30, 0]), 2, 10);
    expect(tapered.map((p) => Math.abs(Math.round(p.y * 100) / 100))).toEqual([0, 2, 2, 0]);
    const same = unflatten([0, 0, 1, 1]);
    expect(offsetPolyline(same, 0)).toEqual(same);
  });
});

describe('camera', () => {
  const viewport = { width: 400, height: 200 };

  it('fits points with padding and the viewport aspect ratio', () => {
    const view = fitView([{ x: 0, y: 0 }, { x: 1000, y: 100 }], viewport, 20, 10);
    expect(view.width / view.height).toBeCloseTo(2);
    expect(view.x).toBeLessThan(0);
    expect(view.x + view.width).toBeGreaterThan(1000);
    const topLeft = worldToScreen(view, viewport, { x: 0, y: 0 });
    expect(topLeft.x).toBeCloseTo(20);
  });

  it('enforces a minimum width when fitting a single point', () => {
    const view = fitView([{ x: 50, y: 50 }], viewport, 20, 800);
    expect(view.width).toBe(800);
    expect(view.x + view.width / 2).toBe(50);
  });

  it('converts between screen and world coordinates', () => {
    const view = { x: 100, y: 200, width: 400, height: 200 };
    const world = screenToWorld(view, viewport, { x: 200, y: 100 });
    expect(world).toEqual({ x: 300, y: 300 });
    expect(worldToScreen(view, viewport, world)).toEqual({ x: 200, y: 100 });
  });

  it('zooms around an anchor that stays fixed on screen', () => {
    const view = { x: 0, y: 0, width: 400, height: 200 };
    const anchor = { x: 100, y: 50 };
    const zoomed = zoomAt(view, 2, anchor);
    expect(zoomed.width).toBe(200);
    expect(worldToScreen(zoomed, viewport, anchor)).toEqual(worldToScreen(view, viewport, anchor));
  });

  it('pans opposite to the drag direction', () => {
    const moved = panBy({ x: 0, y: 0, width: 400, height: 200 }, viewport, 40, -20);
    expect(moved).toMatchObject({ x: -40, y: 20 });
  });

  it('clamps zoom and keeps the center inside the world', () => {
    const limits = { world: { x: 0, y: 0, width: 1000, height: 1000 }, minWidth: 100, maxWidth: 2000 };
    const tooClose = clampView({ x: 0, y: 0, width: 10, height: 5 }, limits);
    expect(tooClose.width).toBe(100);
    expect(tooClose.height).toBe(50);
    const tooFar = clampView({ x: 5000, y: 5000, width: 400, height: 200 }, limits);
    expect(tooFar.x + tooFar.width / 2).toBe(1000);
    expect(tooFar.y + tooFar.height / 2).toBe(1000);
  });

  it('keeps scale and center when the viewport is resized', () => {
    const view = resizeView({ x: 0, y: 0, width: 400, height: 200 }, viewport, { width: 200, height: 200 });
    expect(view).toEqual({ x: 100, y: 0, width: 200, height: 200 });
  });

  it('drops overlapping and off-screen labels, highest priority first', () => {
    const view = { x: 0, y: 0, width: 400, height: 200 };
    const labels = [
      { id: 'a', x: 100, y: 100, text: 'Alfa', priority: 1 },
      { id: 'b', x: 104, y: 102, text: 'Beta', priority: 2 },
      { id: 'c', x: 300, y: 100, text: 'Gamma', priority: 0 },
      { id: 'd', x: 399, y: 100, text: 'Delta larga', priority: 5 },
    ];
    expect(placeLabels(labels, view, viewport, 12).map((l) => l.id)).toEqual(['b', 'c']);
  });
});

describe('nearest stops', () => {
  it('finds the campus stop from the campus parking lot', () => {
    const [first] = nearestStops(network.stops, { lat: 4.0749, lon: -73.5859 });
    expect(first.stop.id).toBe('unillanos');
    expect(first.meters).toBeLessThan(60);
  });

  it('sorts by distance and formats it', () => {
    const list = nearestStops(network.stops, { lat: 4.13, lon: -73.62 }, 4);
    list.slice(1).forEach((n, i) => expect(n.meters).toBeGreaterThanOrEqual(list[i].meters));
    expect(formatDistance(123)).toBe('120 m');
    expect(formatDistance(1450)).toBe('1,4 km');
  });
});
