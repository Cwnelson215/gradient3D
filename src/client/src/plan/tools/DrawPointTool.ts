import type { KonvaEventObject } from "konva/lib/Node";
import { canvasToWorld, snapToGrid, PIXELS_PER_FOOT } from "../../utils/coordinates";

export interface PointDrawState {
  center: [number, number] | null;
  radius: number;
  dragging: boolean;
}

export const initialPointDrawState: PointDrawState = {
  center: null,
  radius: 0,
  dragging: false,
};

export function handlePointMouseDown(
  e: KonvaEventObject<MouseEvent>,
  state: PointDrawState,
  offsetX: number,
  offsetY: number,
  scale: number,
  gridSpacingFt: number
): PointDrawState {
  const stage = e.target.getStage();
  if (!stage) return state;
  const pos = stage.getPointerPosition();
  if (!pos) return state;

  const world = canvasToWorld(pos.x, pos.y, offsetX, offsetY, scale);
  const snapped = snapToGrid(world.x, world.y, gridSpacingFt);
  return {
    center: [snapped.x, snapped.y],
    radius: 0,
    dragging: true,
  };
}

export function handlePointMouseMove(
  e: KonvaEventObject<MouseEvent>,
  state: PointDrawState,
  offsetX: number,
  offsetY: number,
  scale: number
): PointDrawState {
  if (!state.dragging || !state.center) return state;
  const stage = e.target.getStage();
  if (!stage) return state;
  const pos = stage.getPointerPosition();
  if (!pos) return state;

  const world = canvasToWorld(pos.x, pos.y, offsetX, offsetY, scale);
  const dx = world.x - state.center[0];
  const dy = world.y - state.center[1];
  return { ...state, radius: Math.sqrt(dx * dx + dy * dy) };
}

export function handlePointMouseUp(
  state: PointDrawState,
  defaultRadius: number
): { state: PointDrawState; finished: boolean; center: [number, number] | null; radius: number } {
  if (!state.center) return { state: initialPointDrawState, finished: false, center: null, radius: 0 };

  const radius = state.radius < 1 ? defaultRadius : state.radius;
  return {
    state: initialPointDrawState,
    finished: true,
    center: state.center,
    radius,
  };
}
