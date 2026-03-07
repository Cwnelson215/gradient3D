import type { KonvaEventObject } from "konva/lib/Node";
import { canvasToWorld, PIXELS_PER_FOOT } from "../../utils/coordinates";

export interface DrawState {
  points: [number, number][];
  previewPoint: [number, number] | null;
}

export const initialDrawState: DrawState = {
  points: [],
  previewPoint: null,
};

const CLOSE_THRESHOLD_PX = 12;

export function handleDrawClick(
  e: KonvaEventObject<MouseEvent>,
  state: DrawState,
  offsetX: number,
  offsetY: number,
  scale: number
): { state: DrawState; closed: boolean } {
  const stage = e.target.getStage();
  if (!stage) return { state, closed: false };

  const pos = stage.getPointerPosition();
  if (!pos) return { state, closed: false };

  const world = canvasToWorld(pos.x, pos.y, offsetX, offsetY, scale);
  const pt: [number, number] = [world.x, world.y];

  // Check if clicking near first point to close
  if (state.points.length >= 3) {
    const first = state.points[0];
    const firstCanvas = {
      x: first[0] * PIXELS_PER_FOOT * scale + offsetX,
      y: first[1] * PIXELS_PER_FOOT * scale + offsetY,
    };
    const dx = pos.x - firstCanvas.x;
    const dy = pos.y - firstCanvas.y;
    if (Math.sqrt(dx * dx + dy * dy) < CLOSE_THRESHOLD_PX) {
      return { state: { ...state, previewPoint: null }, closed: true };
    }
  }

  return {
    state: { ...state, points: [...state.points, pt] },
    closed: false,
  };
}

export function handleDrawMouseMove(
  e: KonvaEventObject<MouseEvent>,
  state: DrawState,
  offsetX: number,
  offsetY: number,
  scale: number
): DrawState {
  if (state.points.length === 0) return state;

  const stage = e.target.getStage();
  if (!stage) return state;
  const pos = stage.getPointerPosition();
  if (!pos) return state;

  const world = canvasToWorld(pos.x, pos.y, offsetX, offsetY, scale);
  return { ...state, previewPoint: [world.x, world.y] };
}
