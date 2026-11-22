import type { DirectionKey, NetworkData, Route, RouteShape, Stop } from './types';

export const DIRECTIONS: readonly DirectionKey[] = ['inbound', 'outbound'];

/** Id of the campus stop every route starts or ends at. */
export const CAMPUS_STOP_ID = 'unillanos';

export interface StopService {
  route: Route;
  direction: DirectionKey;
  /** Position of the stop in that direction's sequence. */
  index: number;
}

/** Read-only indexed view over the network seed. */
export class Network {
  readonly stops: readonly Stop[];
  readonly routes: readonly Route[];
  private readonly stopsById: Map<string, Stop>;
  private readonly routesById: Map<string, Route>;
  private readonly servicesByStop: Map<string, StopService[]>;

  constructor(data: NetworkData) {
    this.stops = data.stops;
    this.routes = data.routes;
    this.stopsById = new Map(data.stops.map((s) => [s.id, s]));
    this.routesById = new Map(data.routes.map((r) => [r.id, r]));
    this.servicesByStop = new Map();
    for (const route of data.routes) {
      for (const direction of DIRECTIONS) {
        route[direction].stops.forEach((stopId, index) => {
          const list = this.servicesByStop.get(stopId) ?? [];
          list.push({ route, direction, index });
          this.servicesByStop.set(stopId, list);
        });
      }
    }
  }

  stop(id: string): Stop | undefined {
    return this.stopsById.get(id);
  }

  route(id: string): Route | undefined {
    return this.routesById.get(id);
  }

  /** Every (route, direction) passing through the stop. */
  servicesAt(stopId: string): StopService[] {
    return this.servicesByStop.get(stopId) ?? [];
  }

  /** Distinct routes serving the stop, in network order. */
  routesAt(stopId: string): Route[] {
    const ids = new Set(this.servicesAt(stopId).map((s) => s.route.id));
    return this.routes.filter((r) => ids.has(r.id));
  }

  stopsOf(route: Route, direction: DirectionKey): Stop[] {
    return route[direction].stops.map((id) => this.stopsById.get(id)).filter((s): s is Stop => !!s);
  }
}

/** Human label for a direction, e.g. "Hacia Unillanos" / "Hacia Porfía". */
export function directionLabel(route: Route, direction: DirectionKey): string {
  return direction === 'inbound' ? 'Hacia Unillanos' : `Hacia ${route.name}`;
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Checks the referential and structural integrity of the seed.
 * Returns a list of human-readable problems; an empty list means the data is sound.
 */
export function validateNetwork(data: NetworkData, shapes?: Record<string, RouteShape>): string[] {
  const problems: string[] = [];
  const stopIds = new Set<string>();
  for (const stop of data.stops) {
    if (stopIds.has(stop.id)) problems.push(`duplicate stop id ${stop.id}`);
    stopIds.add(stop.id);
    if (!stop.name.trim()) problems.push(`stop ${stop.id} has no name`);
    if (!Number.isFinite(stop.lat) || !Number.isFinite(stop.lon)) problems.push(`stop ${stop.id} has bad coordinates`);
  }
  const used = new Set<string>();
  const routeIds = new Set<string>();
  for (const route of data.routes) {
    if (routeIds.has(route.id)) problems.push(`duplicate route id ${route.id}`);
    routeIds.add(route.id);
    if (!/^[A-Z]{3}$/.test(route.code)) problems.push(`route ${route.id} has a bad code ${route.code}`);
    if (!/^#[0-9a-f]{6}$/i.test(route.color)) problems.push(`route ${route.id} has a bad color`);
    for (const direction of DIRECTIONS) {
      const { stops, departures } = route[direction];
      const label = `${route.id}:${direction}`;
      if (stops.length < 2) problems.push(`${label} needs at least two stops`);
      if (new Set(stops).size !== stops.length) problems.push(`${label} repeats a stop`);
      for (const id of stops) {
        if (!stopIds.has(id)) problems.push(`${label} references unknown stop ${id}`);
        used.add(id);
      }
      const campusAt = direction === 'inbound' ? stops[stops.length - 1] : stops[0];
      if (campusAt !== CAMPUS_STOP_ID) problems.push(`${label} must ${direction === 'inbound' ? 'end' : 'start'} at the campus`);
      if (departures.length === 0) problems.push(`${label} has no departures`);
      departures.forEach((time, i) => {
        if (!TIME_PATTERN.test(time)) problems.push(`${label} has a bad departure time ${time}`);
        else if (i > 0 && departures[i - 1] >= time) problems.push(`${label} departures are not strictly increasing`);
      });
      if (shapes) {
        const shape = shapes[label];
        if (!shape) problems.push(`${label} has no shape`);
        else if (shape.legs.length !== stops.length - 1) problems.push(`${label} shape legs do not match its stops`);
        else if (shape.legs.some((m) => !(m > 0))) problems.push(`${label} has a zero-length leg`);
      }
    }
    const inbound = route.inbound.stops;
    const outbound = route.outbound.stops;
    if (inbound.join() !== [...outbound].reverse().join()) problems.push(`${route.id} directions are not mirror images`);
  }
  for (const id of stopIds) if (!used.has(id)) problems.push(`stop ${id} is not served by any route`);
  return problems;
}
