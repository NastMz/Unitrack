import type { Point } from '../lib/geo';

/** Visible world rectangle in projected meters (an SVG viewBox). */
export interface View {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface CameraLimits {
  /** World area the camera center must stay inside. */
  world: View;
  /** Narrowest visible width in meters (max zoom). */
  minWidth: number;
  /** Widest visible width in meters (min zoom). */
  maxWidth: number;
}

/** Meters per screen pixel for a view shown in a viewport. */
export function metersPerPixel(view: View, viewport: Size): number {
  return viewport.width > 0 ? view.width / viewport.width : 1;
}

/** Converts a viewport pixel position into world coordinates. */
export function screenToWorld(view: View, viewport: Size, screen: Point): Point {
  return {
    x: view.x + (screen.x / viewport.width) * view.width,
    y: view.y + (screen.y / viewport.height) * view.height,
  };
}

/** Converts a world position into viewport pixels. */
export function worldToScreen(view: View, viewport: Size, world: Point): Point {
  return {
    x: ((world.x - view.x) / view.width) * viewport.width,
    y: ((world.y - view.y) / view.height) * viewport.height,
  };
}

/** Keeps zoom within limits and the view center inside the world rectangle. */
export function clampView(view: View, limits: CameraLimits): View {
  const aspect = view.height / view.width;
  const width = Math.min(limits.maxWidth, Math.max(limits.minWidth, view.width));
  const height = width * aspect;
  const cx = Math.min(limits.world.x + limits.world.width, Math.max(limits.world.x, view.x + view.width / 2));
  const cy = Math.min(limits.world.y + limits.world.height, Math.max(limits.world.y, view.y + view.height / 2));
  return { x: cx - width / 2, y: cy - height / 2, width, height };
}

/**
 * Smallest view with the viewport's aspect ratio that contains every point,
 * with `padding` pixels of margin on each side and at least `minWidth` meters wide.
 */
export function fitView(points: readonly Point[], viewport: Size, padding = 32, minWidth = 800): View {
  if (points.length === 0 || viewport.width <= 0 || viewport.height <= 0) {
    return { x: 0, y: 0, width: minWidth, height: minWidth };
  }
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const innerW = Math.max(1, viewport.width - 2 * padding);
  const innerH = Math.max(1, viewport.height - 2 * padding);
  const scale = Math.max((maxX - minX) / innerW, (maxY - minY) / innerH, minWidth / viewport.width);
  const width = viewport.width * scale;
  const height = viewport.height * scale;
  return { x: (minX + maxX) / 2 - width / 2, y: (minY + maxY) / 2 - height / 2, width, height };
}

/** Zooms by `factor` (>1 zooms in) keeping the world point `anchor` fixed on screen. */
export function zoomAt(view: View, factor: number, anchor: Point): View {
  const width = view.width / factor;
  const height = view.height / factor;
  return {
    x: anchor.x - (anchor.x - view.x) / factor,
    y: anchor.y - (anchor.y - view.y) / factor,
    width,
    height,
  };
}

/** Moves the view by a screen-pixel delta (dragging right reveals the west). */
export function panBy(view: View, viewport: Size, dxPixels: number, dyPixels: number): View {
  const mpp = metersPerPixel(view, viewport);
  return { ...view, x: view.x - dxPixels * mpp, y: view.y - dyPixels * mpp };
}

/** Re-shapes a view to a new viewport aspect ratio around the same center and scale. */
export function resizeView(view: View, from: Size, to: Size): View {
  if (from.width <= 0 || to.width <= 0 || to.height <= 0) return view;
  const mpp = view.width / from.width;
  const cx = view.x + view.width / 2;
  const cy = view.y + view.height / 2;
  const width = to.width * mpp;
  const height = to.height * mpp;
  return { x: cx - width / 2, y: cy - height / 2, width, height };
}

export interface Label {
  id: string;
  x: number;
  y: number;
  text: string;
  /** Higher priority labels are placed first. */
  priority: number;
}

/**
 * Greedy label placement: keeps labels that fit in the view and do not overlap
 * an already placed label, estimating text boxes from character count.
 */
export function placeLabels(labels: readonly Label[], view: View, viewport: Size, fontPx: number): Label[] {
  const placed: Array<{ label: Label; box: [number, number, number, number] }> = [];
  const sorted = [...labels].sort((a, b) => b.priority - a.priority || a.text.localeCompare(b.text));
  for (const label of sorted) {
    const p = worldToScreen(view, viewport, label);
    const w = label.text.length * fontPx * 0.56 + 8;
    const h = fontPx + 6;
    const box: [number, number, number, number] = [p.x - w / 2, p.y - h / 2, p.x + w / 2, p.y + h / 2];
    if (box[0] < 0 || box[1] < 0 || box[2] > viewport.width || box[3] > viewport.height) continue;
    const overlaps = placed.some(({ box: o }) => box[0] < o[2] && box[2] > o[0] && box[1] < o[3] && box[3] > o[1]);
    if (!overlaps) placed.push({ label, box });
  }
  return placed.map((p) => p.label);
}

/** A round scale-bar length (1, 2 or 5 × 10ⁿ meters) close to `targetPx` pixels. */
export function niceScale(metersPerPx: number, targetPx = 90): { meters: number; px: number; label: string } {
  const raw = metersPerPx * targetPx;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].find((s) => s * power >= raw * 0.75) ?? 10;
  const meters = step * power;
  const label = meters >= 1000 ? `${String(meters / 1000).replace('.', ',')} km` : `${meters} m`;
  return { meters, px: meters / metersPerPx, label };
}

/** Returns the flat path reversed when it runs right-to-left, so text along it reads upright. */
export function readablePath(flat: readonly number[]): number[] {
  if (flat.length < 4 || flat[0] <= flat[flat.length - 2]) return [...flat];
  const out: number[] = [];
  for (let i = flat.length - 2; i >= 0; i -= 2) out.push(flat[i], flat[i + 1]);
  return out;
}
