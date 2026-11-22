/**
 * Geographic helpers shared by the app and the geodata build script.
 *
 * The map uses a local equirectangular projection in meters, centered on the
 * study area. At Villavicencio's latitude (about 4°N) and over a ~15 km extent
 * the distortion is far below one pixel, so no web-mercator machinery is needed.
 * Only erasable TypeScript syntax is used so Node can import this file directly.
 */

export interface LonLat {
  lat: number;
  lon: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Projection {
  lat0: number;
  lon0: number;
}

const EARTH_RADIUS_M = 6_371_008.8;
const DEG = Math.PI / 180;

/** Meters per degree of latitude and longitude at the given latitude. */
export function metersPerDegree(lat: number): { lat: number; lon: number } {
  const meanDegree = EARTH_RADIUS_M * DEG;
  return { lat: meanDegree, lon: meanDegree * Math.cos(lat * DEG) };
}

/** Projects a coordinate to local meters: x grows east, y grows south (screen order). */
export function project(projection: Projection, coord: LonLat): Point {
  const scale = metersPerDegree(projection.lat0);
  return {
    x: (coord.lon - projection.lon0) * scale.lon,
    y: (projection.lat0 - coord.lat) * scale.lat,
  };
}

/** Inverse of {@link project}. */
export function unproject(projection: Projection, point: Point): LonLat {
  const scale = metersPerDegree(projection.lat0);
  return {
    lat: projection.lat0 - point.y / scale.lat,
    lon: projection.lon0 + point.x / scale.lon,
  };
}

/** Great-circle distance in meters. */
export function haversineMeters(a: LonLat, b: LonLat): number {
  const dLat = (b.lat - a.lat) * DEG;
  const dLon = (b.lon - a.lon) * DEG;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * DEG) * Math.cos(b.lat * DEG) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Total length of a polyline in the same units as its points. */
export function polylineLength(points: readonly Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += distance(points[i - 1], points[i]);
  return total;
}

/** Converts a flat `[x0, y0, x1, y1, ...]` array into points. */
export function unflatten(flat: readonly number[]): Point[] {
  const points: Point[] = [];
  for (let i = 0; i + 1 < flat.length; i += 2) points.push({ x: flat[i], y: flat[i + 1] });
  return points;
}

/** Builds an SVG path `d` attribute from a flat coordinate array. */
export function flatToPath(flat: readonly number[], closed = false): string {
  if (flat.length < 4) return '';
  let d = `M${flat[0]} ${flat[1]}`;
  for (let i = 2; i + 1 < flat.length; i += 2) d += `L${flat[i]} ${flat[i + 1]}`;
  return closed ? `${d}Z` : d;
}

function perpendicularDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) return distance(p, a);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq));
  return distance(p, { x: a.x + t * dx, y: a.y + t * dy });
}

/** Douglas–Peucker simplification; keeps the first and last points. */
export function simplify(points: readonly Point[], tolerance: number): Point[] {
  if (points.length <= 2) return points.slice();
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack: Array<[number, number]> = [[0, points.length - 1]];
  while (stack.length > 0) {
    const [start, end] = stack.pop() as [number, number];
    let maxDistance = 0;
    let index = -1;
    for (let i = start + 1; i < end; i += 1) {
      const d = perpendicularDistance(points[i], points[start], points[end]);
      if (d > maxDistance) {
        maxDistance = d;
        index = i;
      }
    }
    if (index !== -1 && maxDistance > tolerance) {
      keep[index] = 1;
      stack.push([start, index], [index, end]);
    }
  }
  return points.filter((_, i) => keep[i] === 1);
}

/**
 * Shifts a polyline sideways by `offset` (positive = to the right of travel in
 * screen coordinates). Vertices use the averaged normal of their two segments,
 * with the miter length capped at twice the offset so sharp turns stay tidy.
 * With `taper > 0` the offset ramps up from zero over that length at both ends,
 * so lines that share a terminus still meet at it.
 */
export function offsetPolyline(points: readonly Point[], offset: number, taper = 0): Point[] {
  if (offset === 0 || points.length < 2) return points.slice();
  const along = [0];
  for (let i = 1; i < points.length; i += 1) along.push(along[i - 1] + distance(points[i - 1], points[i]));
  const total = along[along.length - 1];
  const ramp = (i: number) => (taper > 0 ? Math.min(1, along[i] / taper, (total - along[i]) / taper) : 1);
  const normals: Point[] = [];
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const len = Math.hypot(dx, dy) || 1;
    normals.push({ x: -dy / len, y: dx / len });
  }
  return points.map((p, i) => {
    const a = normals[Math.max(0, i - 1)];
    const b = normals[Math.min(normals.length - 1, i)];
    let nx = a.x + b.x;
    let ny = a.y + b.y;
    const len = Math.hypot(nx, ny);
    if (len < 1e-9) {
      nx = b.x;
      ny = b.y;
    } else {
      nx /= len;
      ny /= len;
    }
    const cos = nx * b.x + ny * b.y;
    const scale = Math.min(2, 1 / Math.max(cos, 0.5));
    const shift = offset * scale * ramp(i);
    return { x: p.x - nx * shift, y: p.y - ny * shift };
  });
}
