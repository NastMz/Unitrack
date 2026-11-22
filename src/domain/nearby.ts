import { haversineMeters, type LonLat } from '../lib/geo';
import type { Stop } from './types';

/** Farther than this from every stop, the user is considered outside the network. */
export const MAX_NEARBY_METERS = 3_000;

export interface NearbyStop {
  stop: Stop;
  meters: number;
}

/** Stops sorted by straight-line distance from a position, up to `limit`. */
export function nearestStops(stops: readonly Stop[], position: LonLat, limit = 3): NearbyStop[] {
  return stops
    .map((stop) => ({ stop, meters: haversineMeters(position, stop) }))
    .sort((a, b) => a.meters - b.meters)
    .slice(0, limit);
}

/** Walking-distance label: "120 m", "1,4 km". */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}
