import type { Network } from './network';
import type { DirectionKey, Route, RouteShape } from './types';

/**
 * Timetable logic.
 *
 * The source data only lists departure times from the first stop of each
 * direction. Times at intermediate stops are estimates: street distance at an
 * average urban bus speed plus a short dwell at every stop.
 * Villavicencio uses UTC−5 all year (no daylight saving), so local time is
 * derived with a fixed offset and does not depend on the device time zone.
 */

export const AVERAGE_SPEED_KMH = 20;
export const DWELL_SECONDS = 30;
/** ISO weekdays with service: Monday (1) to Saturday (6). */
export const SERVICE_DAYS: ReadonlySet<number> = new Set([1, 2, 3, 4, 5, 6]);
const UTC_OFFSET_MINUTES = -5 * 60;
const MINUTES_PER_DAY = 24 * 60;

export interface LocalTime {
  /** ISO weekday, Monday = 1 … Sunday = 7. */
  weekday: number;
  /** Minutes since local midnight, with fractional seconds. */
  minutes: number;
  /** Local calendar date `YYYY-MM-DD`. */
  date: string;
}

/** Converts an instant to Villavicencio local time. */
export function toLocalTime(instant: Date): LocalTime {
  const shifted = new Date(instant.getTime() + UTC_OFFSET_MINUTES * 60_000);
  const day = shifted.getUTCDay();
  return {
    weekday: day === 0 ? 7 : day,
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes() + shifted.getUTCSeconds() / 60,
    date: shifted.toISOString().slice(0, 10),
  };
}

/** Parses `HH:MM` into minutes after midnight. */
export function parseClock(value: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) throw new Error(`Invalid clock time: ${value}`);
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) throw new Error(`Invalid clock time: ${value}`);
  return hours * 60 + minutes;
}

/** Formats minutes after midnight as `7:05 a. m.` (Colombian Spanish style). */
export function formatClock(minutes: number): string {
  const total = ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h24 < 12 ? 'a. m.' : 'p. m.';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/**
 * Minutes from the first stop to each stop of a direction, rounded to whole minutes.
 * `legs[i]` is the street distance in meters between stop `i` and stop `i + 1`.
 */
export function stopOffsets(legs: readonly number[], speedKmh = AVERAGE_SPEED_KMH, dwellSeconds = DWELL_SECONDS): number[] {
  const metersPerMinute = (speedKmh * 1000) / 60;
  const offsets = [0];
  let elapsed = 0;
  for (const meters of legs) {
    elapsed += meters / metersPerMinute + dwellSeconds / 60;
    offsets.push(Math.round(elapsed));
  }
  return offsets;
}

export function isServiceDay(weekday: number): boolean {
  return SERVICE_DAYS.has(weekday);
}

/** Estimated passing times (minutes after midnight) at every stop for one departure. */
export function tripTimes(departure: string, offsets: readonly number[]): number[] {
  const start = parseClock(departure);
  return offsets.map((o) => start + o);
}

export interface UpcomingBus {
  route: Route;
  direction: DirectionKey;
  /** Scheduled departure from the first stop, `HH:MM`. */
  departure: string;
  /** Estimated time at the stop, minutes after local midnight of its day. */
  at: number;
  /** 0 = today, 1 = tomorrow, … */
  dayOffset: number;
  /** ISO weekday of the service day. */
  weekday: number;
  /** Whole minutes from now until the bus reaches the stop. */
  waitMinutes: number;
}

export type ShapeLookup = (route: Route, direction: DirectionKey) => RouteShape | undefined;

/**
 * Next buses that will pass a stop after `now`, soonest first.
 * Arrivals at the last stop of a direction are excluded: the trip ends there.
 * Looks ahead up to a week so a Sunday query still finds Monday's first bus.
 */
export function nextBusesAt(
  network: Network,
  shapeOf: ShapeLookup,
  stopId: string,
  now: Date,
  limit = 5,
): UpcomingBus[] {
  const local = toLocalTime(now);
  const results: UpcomingBus[] = [];
  const services = network
    .servicesAt(stopId)
    .filter((s) => s.index < s.route[s.direction].stops.length - 1)
    .map((s) => {
      const shape = shapeOf(s.route, s.direction);
      const offsets = shape ? stopOffsets(shape.legs) : [];
      return { ...s, offset: offsets[s.index] ?? 0 };
    });
  for (let dayOffset = 0; dayOffset < 8 && results.length < limit; dayOffset += 1) {
    const weekday = ((local.weekday - 1 + dayOffset) % 7) + 1;
    if (!isServiceDay(weekday)) continue;
    const dayResults: UpcomingBus[] = [];
    for (const service of services) {
      for (const departure of service.route[service.direction].departures) {
        const at = parseClock(departure) + service.offset;
        const wait = dayOffset * MINUTES_PER_DAY + at - local.minutes;
        if (wait < 0) continue;
        dayResults.push({
          route: service.route,
          direction: service.direction,
          departure,
          at,
          dayOffset,
          weekday,
          waitMinutes: Math.floor(wait),
        });
      }
    }
    dayResults.sort((a, b) => a.at - b.at || a.route.code.localeCompare(b.route.code));
    results.push(...dayResults);
  }
  return results.slice(0, limit);
}

/** Index of the next departure of a direction today, or -1 if none is left (or no service today). */
export function nextDepartureIndex(departures: readonly string[], now: Date): number {
  const local = toLocalTime(now);
  if (!isServiceDay(local.weekday)) return -1;
  return departures.findIndex((d) => parseClock(d) >= Math.floor(local.minutes));
}

const WEEKDAY_NAMES = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

export function weekdayName(weekday: number): string {
  return WEEKDAY_NAMES[(weekday - 1) % 7];
}

/** Short relative label for a wait: "Llegando", "en 12 min", "en 1 h 05 min", "mañana", "el lunes". */
export function formatWait(bus: Pick<UpcomingBus, 'waitMinutes' | 'dayOffset' | 'weekday'>): string {
  if (bus.dayOffset === 1) return 'mañana';
  if (bus.dayOffset > 1) return `el ${weekdayName(bus.weekday)}`;
  if (bus.waitMinutes <= 1) return 'llegando';
  if (bus.waitMinutes < 60) return `en ${bus.waitMinutes} min`;
  const h = Math.floor(bus.waitMinutes / 60);
  const m = bus.waitMinutes % 60;
  return `en ${h} h ${String(m).padStart(2, '0')} min`;
}
