import type { KonvaEventObject } from "konva/lib/Node";
import { canvasToWorld, PIXELS_PER_FOOT } from "../../utils/coordinates";
import type { LandscapeObject } from "../../types/landscape";

/** Simple point-in-polygon (ray casting) */
function pointInPolygon(
  px: number,
  py: number,
  points: [number, number][],
  objPos: { x: number; y: number }
): boolean {
  let inside = false;
  const pts = points.map(
    (p) => [p[0] + objPos.x, p[1] + objPos.y] as [number, number]
  );

  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0],
      yi = pts[i][1];
    const xj = pts[j][0],
      yj = pts[j][1];
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Distance from point to line segment */
function pointToSegmentDist(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}

/** Check if point is near a polyline (within threshold in feet) */
function pointNearLine(
  px: number,
  py: number,
  points: [number, number][],
  objPos: { x: number; y: number },
  thresholdFt: number
): boolean {
  for (let i = 0; i < points.length - 1; i++) {
    const dist = pointToSegmentDist(
      px,
      py,
      points[i][0] + objPos.x,
      points[i][1] + objPos.y,
      points[i + 1][0] + objPos.x,
      points[i + 1][1] + objPos.y
    );
    if (dist <= thresholdFt) return true;
  }
  return false;
}

/** Check if point is within a circle (point object) */
function pointInCircle(
  px: number,
  py: number,
  center: [number, number],
  objPos: { x: number; y: number },
  radius: number
): boolean {
  const dx = px - (center[0] + objPos.x);
  const dy = py - (center[1] + objPos.y);
  return Math.sqrt(dx * dx + dy * dy) <= radius;
}

const LINE_HIT_THRESHOLD_FT = 2;

export function hitTest(
  e: KonvaEventObject<MouseEvent>,
  objects: LandscapeObject[],
  offsetX: number,
  offsetY: number,
  scale: number
): string | null {
  const stage = e.target.getStage();
  if (!stage) return null;
  const pos = stage.getPointerPosition();
  if (!pos) return null;

  const world = canvasToWorld(pos.x, pos.y, offsetX, offsetY, scale);

  // Check in reverse z-order (top first)
  const sorted = [...objects]
    .filter((o) => o.visible)
    .sort((a, b) => b.zIndex - a.zIndex);

  for (const obj of sorted) {
    if (obj.geometry === "point") {
      const r = obj.radius ?? (obj.properties.radius as number) ?? 3;
      if (obj.points.length > 0 && pointInCircle(world.x, world.y, obj.points[0], obj.position, r)) {
        return obj.id;
      }
    } else if (obj.geometry === "line") {
      if (pointNearLine(world.x, world.y, obj.points, obj.position, LINE_HIT_THRESHOLD_FT)) {
        return obj.id;
      }
    } else {
      if (pointInPolygon(world.x, world.y, obj.points, obj.position)) {
        return obj.id;
      }
    }
  }
  return null;
}

export interface DragState {
  objectId: string;
  startWorld: { x: number; y: number };
  startPos: { x: number; y: number };
}

export function startDrag(
  e: KonvaEventObject<MouseEvent>,
  obj: LandscapeObject,
  offsetX: number,
  offsetY: number,
  scale: number
): DragState | null {
  if (obj.locked) return null;
  const stage = e.target.getStage();
  if (!stage) return null;
  const pos = stage.getPointerPosition();
  if (!pos) return null;

  const world = canvasToWorld(pos.x, pos.y, offsetX, offsetY, scale);
  return {
    objectId: obj.id,
    startWorld: world,
    startPos: { ...obj.position },
  };
}

export function updateDrag(
  e: KonvaEventObject<MouseEvent>,
  drag: DragState,
  offsetX: number,
  offsetY: number,
  scale: number
): { x: number; y: number } | null {
  const stage = e.target.getStage();
  if (!stage) return null;
  const pos = stage.getPointerPosition();
  if (!pos) return null;

  const world = canvasToWorld(pos.x, pos.y, offsetX, offsetY, scale);
  return {
    x: drag.startPos.x + (world.x - drag.startWorld.x),
    y: drag.startPos.y + (world.y - drag.startWorld.y),
  };
}
