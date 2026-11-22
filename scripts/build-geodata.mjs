// Builds the bundled basemap and the street-following route shapes.
//
//   node scripts/build-geodata.mjs <osm-extract.json>
//
// Input: an Overpass JSON extract (see scripts/fetch-osm.mjs) and src/data/network.json.
// Output: src/data/basemap.json (simplified layers in local meters) and
//         src/data/shapes.json (one polyline and per-leg lengths per route direction).
// Route shapes are the shortest street path between consecutive stops, weighted
// towards main roads. One-way restrictions are ignored, so shapes are approximate.
// Data © OpenStreetMap contributors, available under the ODbL.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { project, simplify, polylineLength, distance } from '../src/lib/geo.ts';

const root = resolve(import.meta.dirname, '..');
const osmPath = process.argv[2];
if (!osmPath) throw new Error('Usage: node scripts/build-geodata.mjs <osm-extract.json>');

const osm = JSON.parse(await readFile(osmPath, 'utf8'));
const network = JSON.parse(await readFile(resolve(root, 'src/data/network.json'), 'utf8'));

// Area shown on the map: the stops plus a margin, rounded to a tidy frame.
const CLIP = { south: 4.048, north: 4.168, west: -73.684, east: -73.556 };
const projection = {
  lat0: Number(((CLIP.south + CLIP.north) / 2).toFixed(4)),
  lon0: Number(((CLIP.west + CLIP.east) / 2).toFixed(4)),
};
const toXY = (lat, lon) => project(projection, { lat, lon });
const corner = toXY(CLIP.north, CLIP.west);
const opposite = toXY(CLIP.south, CLIP.east);
const frame = {
  x: Math.round(corner.x),
  y: Math.round(corner.y),
  width: Math.round(opposite.x - corner.x),
  height: Math.round(opposite.y - corner.y),
};
const inside = (p, margin = 0) =>
  p.x >= frame.x - margin &&
  p.x <= frame.x + frame.width + margin &&
  p.y >= frame.y - margin &&
  p.y <= frame.y + frame.height + margin;

const flat = (points) => points.flatMap((p) => [Math.round(p.x), Math.round(p.y)]);

/** Splits a polyline into the runs that fall inside the frame (with a margin). */
function clipRuns(points, margin = 150) {
  const runs = [];
  let run = [];
  for (const p of points) {
    if (inside(p, margin)) run.push(p);
    else if (run.length) {
      runs.push(run);
      run = [];
    }
  }
  if (run.length) runs.push(run);
  return runs.filter((r) => r.length > 1);
}

function ringArea(points) {
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

const ROAD_CLASS = {
  motorway: 'major', trunk: 'major', primary: 'major', secondary: 'major',
  motorway_link: 'major', trunk_link: 'major', primary_link: 'major', secondary_link: 'major',
  tertiary: 'mid', tertiary_link: 'mid', unclassified: 'mid',
  residential: 'minor', living_street: 'minor',
};
const TOLERANCE = { major: 3, mid: 5, minor: 7 };
// Routing cost multipliers: buses prefer avenues over neighbourhood streets.
const COST = { major: 1, mid: 1.3, minor: 1.9 };

const basemap = {
  attribution: '© OpenStreetMap contributors',
  projection,
  frame,
  roads: { major: [], mid: [], minor: [] },
  roadNames: [],
  water: { lines: [], areas: [] },
  rivers: [],
  parks: [],
  campus: [],
  places: [],
};

// Graph for routing.
const nodes = new Map(); // id -> { p, edges: [[id, length, cost]], cls:Set }
function addNode(id, p, cls) {
  let n = nodes.get(id);
  if (!n) {
    n = { p, edges: [], cls: new Set() };
    nodes.set(id, n);
  }
  n.cls.add(cls);
  return n;
}

const seenPlaces = new Set();
for (const el of osm.elements) {
  const tags = el.tags ?? {};
  if (el.type === 'node') {
    const p = toXY(el.lat, el.lon);
    const name = tags.name?.trim();
    if (!name || !inside(p) || /^comuna\b/i.test(name) || seenPlaces.has(name)) continue;
    seenPlaces.add(name);
    basemap.places.push({ name, x: Math.round(p.x), y: Math.round(p.y) });
    continue;
  }
  if (!el.geometry) continue;
  const points = el.geometry.map((g) => toXY(g.lat, g.lon));

  if (tags.highway && ROAD_CLASS[tags.highway]) {
    const cls = ROAD_CLASS[tags.highway];
    for (let i = 0; i < points.length; i += 1) {
      const node = addNode(el.nodes[i], points[i], cls);
      if (i > 0) {
        const prevId = el.nodes[i - 1];
        const length = distance(points[i - 1], points[i]);
        node.edges.push([prevId, length, length * COST[cls]]);
        nodes.get(prevId).edges.push([el.nodes[i], length, length * COST[cls]]);
      }
    }
    for (const run of clipRuns(points)) basemap.roads[cls].push(flat(simplify(run, TOLERANCE[cls])));
    if (cls === 'major' && tags.name && polylineLength(points) > 900 && inside(points[0])) {
      basemap.roadNames.push({ name: tags.name, path: flat(simplify(points, 12)) });
    }
  } else if (tags.waterway) {
    for (const run of clipRuns(points, 400)) {
      const line = flat(simplify(run, 8));
      basemap.water.lines.push({ kind: tags.waterway === 'river' ? 'river' : 'stream', path: line });
      if (tags.waterway === 'river' && tags.name && polylineLength(run) > 1200) {
        basemap.rivers.push({ name: tags.name, path: line });
      }
    }
  } else if (tags.natural === 'water' || tags.leisure === 'park' || tags.amenity === 'university') {
    if (!points.some((p) => inside(p))) continue;
    const area = ringArea(points);
    if (tags.amenity === 'university') {
      if (/universidad de los llanos/i.test(tags.name ?? '') && area > 20_000) {
        basemap.campus.push({ name: tags.name, path: flat(simplify(points, 4)) });
      }
    } else if (area > 1_500) {
      const target = tags.natural === 'water' ? basemap.water.areas : basemap.parks;
      target.push(flat(simplify(points, 5)));
    }
  }
}

// Keep only the longest name segment per road name to avoid repeated labels.
const bestRoad = new Map();
for (const r of basemap.roadNames) {
  const len = polylineLength(r.path.reduce((acc, v, i) => (i % 2 ? acc : [...acc, { x: v, y: r.path[i + 1] }]), []));
  if (!bestRoad.has(r.name) || bestRoad.get(r.name).len < len) bestRoad.set(r.name, { ...r, len });
}
basemap.roadNames = [...bestRoad.values()].map(({ name, path }) => ({ name, path }));
const bestRiver = new Map();
for (const r of basemap.rivers) {
  if (!bestRiver.has(r.name) || bestRiver.get(r.name).path.length < r.path.length) bestRiver.set(r.name, r);
}
basemap.rivers = [...bestRiver.values()];

// --- Routing -------------------------------------------------------------------
function snap(stop) {
  const p = toXY(stop.lat, stop.lon);
  let best = null;
  let bestMain = null;
  for (const [id, n] of nodes) {
    const d = distance(p, n.p);
    if (!best || d < best.d) best = { id, d };
    if ((n.cls.has('major') || n.cls.has('mid')) && (!bestMain || d < bestMain.d)) bestMain = { id, d };
  }
  return bestMain && bestMain.d < 60 ? bestMain : best;
}

function shortestPath(from, to) {
  const dist = new Map([[from, 0]]);
  const prev = new Map();
  const heap = [[0, from]];
  const push = (item) => {
    heap.push(item);
    let i = heap.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (heap[parent][0] <= heap[i][0]) break;
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };
  while (heap.length) {
    const [d, id] = pop();
    if (id === to) break;
    if (d > (dist.get(id) ?? Infinity)) continue;
    for (const [next, , cost] of nodes.get(id).edges) {
      const nd = d + cost;
      if (nd < (dist.get(next) ?? Infinity)) {
        dist.set(next, nd);
        prev.set(next, id);
        push([nd, next]);
      }
    }
  }
  if (!dist.has(to)) throw new Error(`No street path between nodes ${from} and ${to}`);
  const path = [to];
  while (path[0] !== from) path.unshift(prev.get(path[0]));
  return path.map((id) => nodes.get(id).p);
}

const stopsById = new Map(network.stops.map((s) => [s.id, s]));
const snapped = new Map(network.stops.map((s) => [s.id, snap(s)]));
const farSnaps = [...snapped].filter(([, s]) => s.d > 40).map(([id, s]) => `${id} (${Math.round(s.d)} m)`);
if (farSnaps.length) console.warn(`Stops snapped further than 40 m from a street: ${farSnaps.join(', ')}`);

const shapes = {};
for (const route of network.routes) {
  for (const direction of ['inbound', 'outbound']) {
    const ids = route[direction].stops;
    const points = [];
    const legs = [];
    for (let i = 1; i < ids.length; i += 1) {
      const segment = shortestPath(snapped.get(ids[i - 1]).id, snapped.get(ids[i]).id);
      const start = toXY(stopsById.get(ids[i - 1]).lat, stopsById.get(ids[i - 1]).lon);
      const end = toXY(stopsById.get(ids[i]).lat, stopsById.get(ids[i]).lon);
      const full = [start, ...segment, end];
      legs.push(Math.round(polylineLength(full)));
      points.push(...(points.length ? full.slice(1) : full));
    }
    shapes[`${route.id}:${direction}`] = { path: flat(simplify(points, 2.5)), legs };
  }
}

await writeFile(resolve(root, 'src/data/basemap.json'), `${JSON.stringify(basemap)}\n`);
await writeFile(resolve(root, 'src/data/shapes.json'), `${JSON.stringify(shapes)}\n`);
const count = (k) => basemap.roads[k].reduce((n, l) => n + l.length / 2, 0);
console.log(
  `basemap: ${count('major')}+${count('mid')}+${count('minor')} road points, ${basemap.places.length} places, ` +
    `${basemap.parks.length} parks, ${basemap.campus.length} campus areas; shapes: ${Object.keys(shapes).length}`,
);
for (const [key, s] of Object.entries(shapes)) console.log(key, (s.legs.reduce((a, b) => a + b, 0) / 1000).toFixed(1), 'km');
