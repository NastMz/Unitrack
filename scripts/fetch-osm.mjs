// Downloads the OpenStreetMap extract used to build the bundled basemap.
// Run only when refreshing the geodata: `node scripts/fetch-osm.mjs [out.json]`.
// The app itself never contacts OpenStreetMap or any tile server.
// Data © OpenStreetMap contributors, available under the ODbL.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const BBOX = '4.040,-73.690,4.175,-73.550';
const QUERY = `[out:json][timeout:120];
(
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link)$"](${BBOX});
  way["waterway"~"^(river|stream|canal)$"](${BBOX});
  way["natural"="water"](${BBOX});
  way["leisure"="park"](${BBOX});
  way["amenity"="university"](${BBOX});
  node["place"~"^(suburb|neighbourhood|quarter)$"](${BBOX});
);
out geom qt;`;

const out = resolve(process.argv[2] ?? '.cache/osm-villavicencio.json');
const response = await fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': 'unitrack-geodata-build' },
  body: new URLSearchParams({ data: QUERY }),
});
if (!response.ok) throw new Error(`Overpass request failed: ${response.status} ${response.statusText}`);
await mkdir(dirname(out), { recursive: true });
await writeFile(out, await response.text());
console.log(`OSM extract written to ${out}`);
