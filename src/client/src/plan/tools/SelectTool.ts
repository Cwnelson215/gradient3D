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
    if (pointInPolygon(world.x, world.y, obj.points, obj.position)) {
      return obj.id;
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
