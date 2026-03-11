import type { KonvaEventObject } from "konva/lib/Node";
import { canvasToWorld, snapToGrid, PIXELS_PER_FOOT } from "../../utils/coordinates";

export interface LineDrawState {
  points: [number, number][];
  previewPoint: [number, number] | null;
}

export const initialLineDrawState: LineDrawState = {
  points: [],
  previewPoint: null,
};

export function handleLineClick(
  e: KonvaEventObject<MouseEvent>,
  state: LineDrawState,
  offsetX: number,
  offsetY: number,
  scale: number,
  gridSpacingFt: number
): { state: LineDrawState; finished: boolean } {
  const stage = e.target.getStage();
  if (!stage) return { state, finished: false };
  const pos = stage.getPointerPosition();
  if (!pos) return { state, finished: false };

  const world = canvasToWorld(pos.x, pos.y, offsetX, offsetY, scale);
  const snapped = snapToGrid(world.x, world.y, gridSpacingFt);
  const pt: [number, number] = [snapped.x, snapped.y];

  return {
    state: { ...state, points: [...state.points, pt] },
    finished: false,
  };
}

export function handleLineDoubleClick(
  state: LineDrawState
): { state: LineDrawState; finished: boolean } {
  if (state.points.length < 2) return { state, finished: false };
  // Remove the last point (added by the preceding click event)
  const points = state.points.slice(0, -1);
  if (points.length < 2) return { state, finished: false };
  return {
    state: { points, previewPoint: null },
    finished: true,
  };
}

export function handleLineMouseMove(
  e: KonvaEventObject<MouseEvent>,
  state: LineDrawState,
  offsetX: number,
  offsetY: number,
  scale: number,
  gridSpacingFt: number
): LineDrawState {
  if (state.points.length === 0) return state;
  const stage = e.target.getStage();
  if (!stage) return state;
  const pos = stage.getPointerPosition();
  if (!pos) return state;

  const world = canvasToWorld(pos.x, pos.y, offsetX, offsetY, scale);
  const snapped = snapToGrid(world.x, world.y, gridSpacingFt);
  return { ...state, previewPoint: [snapped.x, snapped.y] };
}

export function handleLineKeyDown(
  e: KeyboardEvent,
  state: LineDrawState
): { state: LineDrawState; finished: boolean } | null {
  if (e.key === "Enter" && state.points.length >= 2) {
    return { state: { ...state, previewPoint: null }, finished: true };
  }
  if (e.key === "Escape") {
    return { state: initialLineDrawState, finished: false };
  }
  return null;
}
