import { describe, expect, it } from 'vitest';
import { network, shapeOf } from '../src/data';
import { Network } from '../src/domain/network';
import {
  formatClock,
  formatWait,
  nextBusesAt,
  nextDepartureIndex,
  parseClock,
  stopOffsets,
  toLocalTime,
  tripTimes,
} from '../src/domain/schedule';
import type { NetworkData, RouteShape } from '../src/domain/types';

/** Builds an instant from Villavicencio local time (UTC−5). */
const local = (iso: string) => new Date(`${iso}:00-05:00`);

const tiny: NetworkData = {
  stops: [
    { id: 'a', name: 'A', description: 'a', lat: 4.1, lon: -73.6 },
    { id: 'b', name: 'B', description: 'b', lat: 4.09, lon: -73.6 },
    { id: 'unillanos', name: 'U', description: 'u', lat: 4.08, lon: -73.6 },
  ],
  routes: [
    {
      id: 'r1',
      code: 'RUN',
      name: 'Uno',
      color: '#123456',
      inbound: { stops: ['a', 'b', 'unillanos'], departures: ['06:00', '07:00'] },
      outbound: { stops: ['unillanos', 'b', 'a'], departures: ['12:00'] },
    },
  ],
};
const tinyNetwork = new Network(tiny);
// 2000 m legs at 20 km/h = 6 min, plus 30 s dwell.
const tinyShapes: Record<string, RouteShape> = {
  'r1:inbound': { path: [], legs: [2000, 2000] },
  'r1:outbound': { path: [], legs: [2000, 2000] },
};
const tinyShape = (r: { id: string }, d: string) => tinyShapes[`${r.id}:${d}`];

describe('clock helpers', () => {
  it('parses and formats clock times', () => {
    expect(parseClock('05:10')).toBe(310);
    expect(parseClock('7:05')).toBe(425);
    expect(() => parseClock('24:00')).toThrow();
    expect(() => parseClock('seven')).toThrow();
    expect(formatClock(310)).toBe('5:10 a. m.');
    expect(formatClock(12 * 60)).toBe('12:00 p. m.');
    expect(formatClock(0)).toBe('12:00 a. m.');
    expect(formatClock(20 * 60 + 5)).toBe('8:05 p. m.');
  });

  it('converts instants to Villavicencio local time regardless of device zone', () => {
    const t = toLocalTime(new Date('2026-11-23T12:30:00Z'));
    expect(t).toEqual({ weekday: 1, minutes: 7 * 60 + 30, date: '2026-11-23' });
    expect(toLocalTime(new Date('2026-11-23T03:00:00Z')).weekday).toBe(7);
  });
});

describe('stop offsets', () => {
  it('accumulates street distance at average speed plus dwell time', () => {
    expect(stopOffsets([2000, 2000])).toEqual([0, 7, 13]);
    expect(stopOffsets([])).toEqual([0]);
    expect(stopOffsets([1000], 60, 0)).toEqual([0, 1]);
  });

  it('produces non-decreasing passing times for every bundled route', () => {
    for (const route of network.routes) {
      for (const direction of ['inbound', 'outbound'] as const) {
        const times = tripTimes(route[direction].departures[0], stopOffsets(shapeOf(route, direction)!.legs));
        expect(times).toHaveLength(route[direction].stops.length);
        times.slice(1).forEach((t, i) => expect(t).toBeGreaterThanOrEqual(times[i]));
        // A trip to or from the campus takes between 10 minutes and 1.5 hours.
        const duration = times[times.length - 1] - times[0];
        expect(duration).toBeGreaterThan(10);
        expect(duration).toBeLessThan(90);
      }
    }
  });
});

describe('next buses at a stop', () => {
  it('returns the next pass with its estimated time and wait', () => {
    const buses = nextBusesAt(tinyNetwork, tinyShape, 'b', local('2026-11-23T06:05'), 3);
    expect(buses.map((b) => [b.direction, b.departure, b.at, b.waitMinutes, b.dayOffset])).toEqual([
      ['inbound', '06:00', 367, 2, 0],
      ['inbound', '07:00', 427, 62, 0],
      ['outbound', '12:00', 727, 362, 0],
    ]);
  });

  it('includes a bus that is due right now', () => {
    const [bus] = nextBusesAt(tinyNetwork, tinyShape, 'b', local('2026-11-23T06:07'), 1);
    expect(bus.waitMinutes).toBe(0);
    expect(formatWait(bus)).toBe('llegando');
  });

  it('skips the last stop of a direction because the trip ends there', () => {
    const buses = nextBusesAt(tinyNetwork, tinyShape, 'unillanos', local('2026-11-23T05:00'), 10);
    expect(buses.every((b) => b.direction === 'outbound')).toBe(true);
    expect(buses[0]).toMatchObject({ departure: '12:00', at: 720 });
  });

  it('rolls over to the next service day after the last bus', () => {
    const [bus] = nextBusesAt(tinyNetwork, tinyShape, 'a', local('2026-11-23T21:00'), 1);
    expect(bus).toMatchObject({ departure: '06:00', dayOffset: 1, weekday: 2 });
    expect(formatWait(bus)).toBe('mañana');
  });

  it('has no service on Sundays and finds Monday from Saturday night', () => {
    const [bus] = nextBusesAt(tinyNetwork, tinyShape, 'a', local('2026-11-28T22:00'), 1);
    expect(bus).toMatchObject({ dayOffset: 2, weekday: 1 });
    expect(formatWait(bus)).toBe('el lunes');
    expect(nextBusesAt(tinyNetwork, tinyShape, 'a', local('2026-11-29T05:00'), 1)[0].weekday).toBe(1);
  });

  it('merges every route that serves a shared stop, soonest first', () => {
    const buses = nextBusesAt(network, shapeOf, 'yamaha-jordan', local('2026-11-23T05:00'), 6);
    expect(new Set(buses.map((b) => b.route.id))).toEqual(new Set(['grama-postobon', 'terminal']));
    buses.slice(1).forEach((b, i) => expect(b.at).toBeGreaterThanOrEqual(buses[i].at));
  });

  it('returns nothing for an unknown stop', () => {
    expect(nextBusesAt(network, shapeOf, 'nowhere', local('2026-11-23T05:00'))).toEqual([]);
  });
});

describe('next departure of a direction', () => {
  const departures = ['05:10', '07:20', '13:30'];
  it('finds the first departure at or after now', () => {
    expect(nextDepartureIndex(departures, local('2026-11-23T05:00'))).toBe(0);
    expect(nextDepartureIndex(departures, local('2026-11-23T07:20'))).toBe(1);
    expect(nextDepartureIndex(departures, local('2026-11-23T14:00'))).toBe(-1);
    expect(nextDepartureIndex(departures, local('2026-11-29T05:00'))).toBe(-1);
  });
});

describe('wait labels', () => {
  it('formats short and long waits', () => {
    expect(formatWait({ waitMinutes: 12, dayOffset: 0, weekday: 1 })).toBe('en 12 min');
    expect(formatWait({ waitMinutes: 65, dayOffset: 0, weekday: 1 })).toBe('en 1 h 05 min');
  });
});
