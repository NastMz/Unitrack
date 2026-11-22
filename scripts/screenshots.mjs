// Captures the README screenshots from a running instance of the app.
//
//   node scripts/screenshots.mjs [baseUrl] [outDir]
//
// Defaults: http://localhost:8180 (docker compose) and docs/screenshots.
// Uses a locally installed Chrome through playwright-core (no browser download).
// A fixed demo clock (`?ahora=`) keeps the timetables in the captures stable.
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright-core';

const base = (process.argv[2] ?? 'http://localhost:8180').replace(/\/$/, '');
const outDir = resolve(process.argv[3] ?? 'docs/screenshots');
const CLOCK = '?ahora=2026-11-23T06:20';
const CHROME =
  process.env.CHROME_PATH ??
  (process.platform === 'win32'
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : '/usr/bin/google-chrome');

const phone = { viewport: { width: 412, height: 892 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const desktop = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 };

const shots = [
  { file: 'mapa.png', device: phone, hash: '#/' },
  { file: 'rutas.png', device: phone, hash: '#/rutas' },
  { file: 'ruta.png', device: phone, hash: '#/ruta/grama-postobon' },
  { file: 'ruta-recorrido.png', device: phone, hash: '#/ruta/grama-postobon', scrollPanel: 520 },
  { file: 'paradero.png', device: phone, hash: '#/paradero/yamaha-jordan' },
  { file: 'avisos.png', device: phone, hash: '#/avisos' },
  { file: 'escritorio.png', device: desktop, hash: '#/ruta/terminal' },
];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
try {
  for (const shot of shots) {
    const context = await browser.newContext({ ...shot.device, colorScheme: 'light', locale: 'es-CO' });
    const page = await context.newPage();
    await page.goto(`${base}/${CLOCK}${shot.hash}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForSelector('.transit-map-svg');
    if (shot.scrollPanel) await page.locator('.app-panel').evaluate((el, y) => el.scrollTo(0, y), shot.scrollPanel);
    await page.waitForTimeout(300);
    await page.screenshot({ path: resolve(outDir, shot.file) });
    console.log(`captured ${shot.file}`);
    await context.close();
  }
} finally {
  await browser.close();
}
