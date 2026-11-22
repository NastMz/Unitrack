/** Domain model of the university bus network. */

export type DirectionKey = 'inbound' | 'outbound';

export interface Stop {
  id: string;
  name: string;
  description: string;
  lat: number;
  lon: number;
}

/** One direction of a route: the ordered stops and the departure times from its first stop. */
export interface RouteDirection {
  stops: string[];
  /** Departure times from the first stop, `HH:MM` in Villavicencio local time. */
  departures: string[];
}

export interface Route {
  id: string;
  /** Three-letter signage code, e.g. `POR`. */
  code: string;
  name: string;
  /** Line color used on the map and signage. */
  color: string;
  /** Towards the university campus. */
  inbound: RouteDirection;
  /** From the campus back to the neighbourhood. */
  outbound: RouteDirection;
}

export interface NetworkData {
  stops: Stop[];
  routes: Route[];
}

/** Street-following geometry of one route direction, in projected meters. */
export interface RouteShape {
  /** Flat `[x0, y0, x1, y1, ...]` polyline. */
  path: number[];
  /** Street length in meters between consecutive stops (`stops.length - 1` items). */
  legs: number[];
}

export type ShapeKey = `${string}:${DirectionKey}`;

export type AlertKind = 'desvio' | 'horario' | 'suspension' | 'novedad';

export interface Alert {
  id: string;
  kind: AlertKind;
  title: string;
  body: string;
  /** Publication date, ISO `YYYY-MM-DD`. */
  published: string;
  /** Optional validity window, ISO dates, inclusive. */
  validFrom?: string;
  validUntil?: string;
  /** Affected route ids; empty means the whole network. */
  routes: string[];
}
