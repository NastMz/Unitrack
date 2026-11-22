import { Network } from '../domain/network';
import type { Alert, DirectionKey, NetworkData, Route, RouteShape } from '../domain/types';
import { project, type Point } from '../lib/geo';
import alertsJson from './alerts.json';
import basemapJson from './basemap.json';
import networkJson from './network.json';
import shapesJson from './shapes.json';

/** Pre-projected, simplified OpenStreetMap layers (see scripts/build-geodata.mjs). */
export interface Basemap {
  attribution: string;
  projection: { lat0: number; lon0: number };
  frame: { x: number; y: number; width: number; height: number };
  roads: { major: number[][]; mid: number[][]; minor: number[][] };
  roadNames: Array<{ name: string; path: number[] }>;
  water: { lines: Array<{ kind: 'river' | 'stream'; path: number[] }>; areas: number[][] };
  rivers: Array<{ name: string; path: number[] }>;
  parks: number[][];
  campus: Array<{ name: string; path: number[] }>;
  places: Array<{ name: string; x: number; y: number }>;
}

export const basemap = basemapJson as Basemap;
export const networkData = networkJson as NetworkData;
export const network = new Network(networkData);
export const shapes = shapesJson as Record<string, RouteShape>;
export const alerts = alertsJson as Alert[];

export function shapeOf(route: Route, direction: DirectionKey): RouteShape | undefined {
  return shapes[`${route.id}:${direction}`];
}

const stopPoints = new Map<string, Point>(
  network.stops.map((s) => [s.id, project(basemap.projection, s)]),
);

/** Projected position of a stop in map meters. */
export function stopPoint(stopId: string): Point {
  const p = stopPoints.get(stopId);
  if (!p) throw new Error(`Unknown stop ${stopId}`);
  return p;
}
