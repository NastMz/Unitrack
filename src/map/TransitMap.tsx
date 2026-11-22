import { memo, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useElementSize } from '../app/hooks';
import { basemap, network, shapes, stopPoint } from '../data';
import { CAMPUS_STOP_ID, DIRECTIONS } from '../domain/network';
import type { DirectionKey } from '../domain/types';
import { flatToPath, offsetPolyline, simplify, unflatten, type Point } from '../lib/geo';
import {
  clampView,
  fitView,
  metersPerPixel,
  niceScale,
  panBy,
  placeLabels,
  readablePath,
  resizeView,
  screenToWorld,
  zoomAt,
  type Size,
  type View,
} from './camera';

export type MapFocus =
  | { kind: 'all' }
  | { kind: 'route'; routeId: string; direction: DirectionKey }
  | { kind: 'stop'; stopId: string }
  | { kind: 'point'; point: Point };

interface TransitMapProps {
  focus: MapFocus;
  selectedStopId?: string;
  userPosition?: Point | null;
  onSelectStop: (stopId: string) => void;
  /** Changing this number re-fits the camera even if the focus did not change. */
  refitToken?: number;
}

const frame = basemap.frame;
const LIMITS = {
  world: frame,
  minWidth: 250,
  maxWidth: frame.width * 1.25,
};

// Static layers are built once: they never change with the camera.
const paths = {
  minor: basemap.roads.minor.map((l) => flatToPath(l)).join(''),
  mid: basemap.roads.mid.map((l) => flatToPath(l)).join(''),
  major: basemap.roads.major.map((l) => flatToPath(l)).join(''),
  rivers: basemap.water.lines.filter((l) => l.kind === 'river').map((l) => flatToPath(l.path)).join(''),
  streams: basemap.water.lines.filter((l) => l.kind === 'stream').map((l) => flatToPath(l.path)).join(''),
  waterAreas: basemap.water.areas.map((a) => flatToPath(a, true)).join(''),
  parks: basemap.parks.map((a) => flatToPath(a, true)).join(''),
  campus: basemap.campus.map((a) => flatToPath(a.path, true)).join(''),
};
const routeShapePaths = new Map(Object.entries(shapes).map(([key, s]) => [key, flatToPath(s.path)]));
const smooth = (flat: number[], tolerance: number) => simplify(unflatten(readablePath(flat)), tolerance).flatMap((p) => [p.x, p.y]);
const riverLabels = basemap.rivers.map((r, i) => ({ id: `river-${i}`, name: r.name, d: flatToPath(smooth(r.path, 120)) }));
const roadLabels = basemap.roadNames.map((r, i) => ({ id: `road-${i}`, name: r.name, d: flatToPath(smooth(r.path, 40)) }));

function focusPoints(focus: MapFocus): Point[] {
  switch (focus.kind) {
    case 'all':
      return network.stops.map((s) => stopPoint(s.id));
    case 'route': {
      const shape = shapes[`${focus.routeId}:${focus.direction}`];
      return shape ? unflatten(shape.path) : [];
    }
    case 'stop':
      return network.stop(focus.stopId) ? [stopPoint(focus.stopId)] : [];
    case 'point':
      return [focus.point];
  }
}

const BaseLayers = memo(function BaseLayers() {
  return (
    <g className="map-base">
      <rect className="map-land" x={frame.x} y={frame.y} width={frame.width} height={frame.height} />
      <path className="map-park" d={paths.parks} />
      <path className="map-campus" d={paths.campus} />
      <path className="map-water-area" d={paths.waterAreas} />
      <path className="map-stream" d={paths.streams} />
      <path className="map-river" d={paths.rivers} />
      <path className="map-road map-road--minor" d={paths.minor} />
      <path className="map-road-casing" d={paths.mid} />
      <path className="map-road map-road--mid" d={paths.mid} />
      <path className="map-road-casing map-road-casing--major" d={paths.major} />
      <path className="map-road map-road--major" d={paths.major} />
      <defs>
        {[...riverLabels, ...roadLabels].map((l) => (
          <path key={l.id} id={l.id} d={l.d} />
        ))}
      </defs>
    </g>
  );
});

interface RouteLayerProps {
  activeRouteIds: ReadonlySet<string> | null;
  activeDirection?: DirectionKey;
  /** Meters per pixel, used to space bundled lines a constant number of pixels apart. */
  metersPerPx: number;
}

const LINE_SPACING_PX = 4.5;
const shapePoints = new Map(Object.entries(shapes).map(([key, s]) => [key, unflatten(s.path)]));

/** Draws every route; lines that share streets are spread side by side like a transit diagram. */
const RouteLayer = memo(function RouteLayer({ activeRouteIds, activeDirection, metersPerPx }: RouteLayerProps) {
  const ordered = [...network.routes].sort(
    (a, b) => Number(activeRouteIds?.has(a.id) ?? false) - Number(activeRouteIds?.has(b.id) ?? false),
  );
  // Only bundle when several lines are shown at full strength (overview or a shared stop).
  const bundled = network.routes.filter((r) => !activeRouteIds || activeRouteIds.has(r.id));
  const spread = activeRouteIds?.size === 1 ? [] : bundled;
  return (
    <g className="map-routes">
      {ordered.map((route) => {
        const active = !activeRouteIds || activeRouteIds.has(route.id);
        const direction = activeRouteIds?.has(route.id) && activeDirection ? activeDirection : DIRECTIONS[0];
        const slot = spread.indexOf(route);
        const offset = slot < 0 ? 0 : (slot - (spread.length - 1) / 2) * LINE_SPACING_PX * metersPerPx;
        const points = shapePoints.get(`${route.id}:${direction}`) ?? [];
        const d = offset === 0 ? routeShapePaths.get(`${route.id}:${direction}`) : flatToPath(offsetPolyline(simplify(points, Math.max(2.5, metersPerPx * 2.5)), offset, metersPerPx * 40).flatMap((p) => [Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10]));
        return (
          <g key={route.id} className={active ? 'map-route' : 'map-route map-route--muted'} data-route={route.id}>
            <path className="map-route-casing" d={d} />
            <path className="map-route-line" d={d} style={{ stroke: route.color }} />
          </g>
        );
      })}
    </g>
  );
});

export function TransitMap({ focus, selectedStopId, userPosition, onSelectStop, refitToken = 0 }: TransitMapProps) {
  const [containerRef, size] = useElementSize<HTMLDivElement>();
  const [view, setView] = useState<View | null>(null);
  const lastSize = useRef<Size>({ width: 0, height: 0 });
  const focusKey = JSON.stringify(focus);

  // Fit the camera to the focus whenever it changes (or the map first gets a size).
  useEffect(() => {
    if (size.width === 0 || size.height === 0) return;
    const minWidth = focus.kind === 'stop' || focus.kind === 'point' ? 1400 : 900;
    const padding = Math.min(56, size.width * 0.08);
    setView(clampView(fitView(focusPoints(focus), size, padding, minWidth), LIMITS));
    lastSize.current = size;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey, refitToken, size.width > 0 && size.height > 0]);

  // Keep scale and center when the container is resized.
  useEffect(() => {
    if (!view || size.width === 0 || size.height === 0) return;
    const from = lastSize.current;
    if (from.width === size.width && from.height === size.height) return;
    lastSize.current = size;
    setView((v) => (v ? resizeView(v, from, size) : v));
  }, [size, view]);

  const activeRouteIds = useMemo<ReadonlySet<string> | null>(() => {
    if (focus.kind === 'route') return new Set([focus.routeId]);
    if (focus.kind === 'stop') return new Set(network.routesAt(focus.stopId).map((r) => r.id));
    return null;
  }, [focus]);
  const activeDirection = focus.kind === 'route' ? focus.direction : undefined;

  // ------------------------------------------------------------ interaction
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<{ moved: number; pinch?: number }>({ moved: 0 });

  const localPoint = (e: { clientX: number; clientY: number }): Point => {
    const rect = containerRef.current?.getBoundingClientRect();
    return { x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) };
  };

  const zoomBy = (factor: number, screen?: Point) => {
    setView((v) => {
      if (!v) return v;
      const anchor = screenToWorld(v, size, screen ?? { x: size.width / 2, y: size.height / 2 });
      return clampView(zoomAt(v, factor, anchor), LIMITS);
    });
  };

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = element.getBoundingClientRect();
      const factor = Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0018));
      zoomBy(factor, { x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  });

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest('.map-controls')) return;
    pointers.current.set(e.pointerId, localPoint(e));
    if (pointers.current.size === 1) gesture.current = { moved: 0 };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const previous = pointers.current.get(e.pointerId);
    if (!previous) return;
    const current = localPoint(e);
    pointers.current.set(e.pointerId, current);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      if (gesture.current.pinch) zoomBy(distance / gesture.current.pinch, center);
      gesture.current.pinch = distance;
      gesture.current.moved += 10;
      return;
    }
    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    gesture.current.moved += Math.abs(dx) + Math.abs(dy);
    // Capture only once a drag has started, so plain taps still reach the stop markers.
    if (gesture.current.moved > 6 && !e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
    setView((v) => (v ? clampView(panBy(v, size, dx, dy), LIMITS) : v));
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current.pinch = undefined;
  };

  const selectStop = (stopId: string) => {
    if (gesture.current.moved > 6) return;
    onSelectStop(stopId);
  };

  // ------------------------------------------------------------ rendering
  const mpp = view ? metersPerPixel(view, size) : 1;
  const px = (n: number) => n * mpp;
  const showMinorLabels = mpp < 7;
  const scale = niceScale(mpp);

  const placeLabelsVisible = useMemo(() => {
    if (!view || !showMinorLabels) return [];
    const labels = basemap.places.map((p, i) => ({ id: `place-${i}`, x: p.x, y: p.y, text: p.name, priority: 0 }));
    const stopBoxes = network.stops.map((s) => ({ id: s.id, ...stopPoint(s.id), text: '·····', priority: 10 }));
    return placeLabels([...stopBoxes, ...labels], view, size, 11).filter((l) => l.id.startsWith('place-'));
  }, [view, size, showMinorLabels]);

  const visibleStops = useMemo(() => {
    if (focus.kind === 'route') {
      const route = network.route(focus.routeId);
      return route ? route[focus.direction].stops : [];
    }
    return network.stops.map((s) => s.id);
  }, [focus]);

  const selected = selectedStopId && network.stop(selectedStopId);
  const selectedPoint = selected ? stopPoint(selected.id) : null;

  return (
    <div
      ref={containerRef}
      className="transit-map"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="region"
      aria-label="Mapa de rutas universitarias de Villavicencio"
    >
      {view && (
        <svg
          className="transit-map-svg"
          viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
          width={size.width}
          height={size.height}
          data-zoomed={showMinorLabels ? 'near' : 'far'}
        >
          <BaseLayers />
          <g className="map-labels" style={{ fontSize: px(11) }}>
            {riverLabels.map((l) => (
              <text key={l.id} className="map-label-river" dy={px(-4)}>
                <textPath href={`#${l.id}`} startOffset="50%" textAnchor="middle">
                  {l.name}
                </textPath>
              </text>
            ))}
            {mpp < 4 &&
              roadLabels.map((l) => (
                <text key={l.id} className="map-label-road" dy={px(3.5)} style={{ fontSize: px(9.5) }}>
                  <textPath href={`#${l.id}`} startOffset="50%" textAnchor="middle">
                    {l.name}
                  </textPath>
                </text>
              ))}
            {placeLabelsVisible.map((l) => (
              <text key={l.id} className="map-label-place" x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle">
                {l.text}
              </text>
            ))}
          </g>
          <RouteLayer activeRouteIds={activeRouteIds} activeDirection={activeDirection} metersPerPx={Number(mpp.toPrecision(2))} />
          <g className="map-stops">
            {visibleStops.map((id) => {
              const p = stopPoint(id);
              const campus = id === CAMPUS_STOP_ID;
              const muted = focus.kind === 'stop' && id !== focus.stopId && !network.routesAt(id).some((r) => activeRouteIds?.has(r.id));
              const name = network.stop(id)?.name ?? id;
              return campus ? (
                <g key={id} className="map-campus-stop" onClick={() => selectStop(id)} aria-label={name} role="button">
                  <rect x={p.x - px(11)} y={p.y - px(11)} width={px(22)} height={px(22)} rx={px(4)} />
                  <text x={p.x} y={p.y + px(0.5)} style={{ fontSize: px(13) }} textAnchor="middle" dominantBaseline="middle">
                    U
                  </text>
                </g>
              ) : (
                <circle
                  key={id}
                  className={muted ? 'map-stop map-stop--muted' : 'map-stop'}
                  cx={p.x}
                  cy={p.y}
                  r={px(focus.kind === 'all' ? 4.5 : 6)}
                  onClick={() => selectStop(id)}
                  aria-label={name}
                  role="button"
                >
                  <title>{name}</title>
                </circle>
              );
            })}
          </g>
          {selected && selectedPoint && selected.id !== CAMPUS_STOP_ID && (
            <g className="map-selected" pointerEvents="none">
              <circle cx={selectedPoint.x} cy={selectedPoint.y} r={px(13)} className="map-selected-halo" />
              <circle cx={selectedPoint.x} cy={selectedPoint.y} r={px(7)} className="map-selected-dot" />
            </g>
          )}
          {selected && selectedPoint && (
            <text
              className="map-selected-label"
              x={selectedPoint.x}
              y={selectedPoint.y - px(20)}
              textAnchor="middle"
              style={{ fontSize: px(13) }}
            >
              {selected.name}
            </text>
          )}
          {userPosition && (
            <g className="map-user" pointerEvents="none">
              <circle cx={userPosition.x} cy={userPosition.y} r={px(16)} className="map-user-halo" />
              <circle cx={userPosition.x} cy={userPosition.y} r={px(6)} className="map-user-dot" />
            </g>
          )}
        </svg>
      )}
      <div className="map-controls">
        <button type="button" onClick={() => zoomBy(1.6)} aria-label="Acercar">
          +
        </button>
        <button type="button" onClick={() => zoomBy(1 / 1.6)} aria-label="Alejar">
          −
        </button>
        <button
          type="button"
          onClick={() => size.width && setView(clampView(fitView(focusPoints(focus), size, 40, 900), LIMITS))}
          aria-label="Encuadrar"
          title="Encuadrar"
        >
          ⤢
        </button>
      </div>
      <div className="map-scale" aria-hidden="true">
        <span style={{ width: `${scale.px}px` }} />
        {scale.label}
      </div>
      <div className="map-attribution">© OpenStreetMap contributors</div>
    </div>
  );
}
