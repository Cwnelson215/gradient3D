import type { KonvaEventObject } from "konva/lib/Node";
import { canvasToWorld, snapToGrid } from "../../utils/coordinates";

export interface MeasureState {
  startPoint: [number, number] | null;
  endPoint: [number, number] | null;
  previewPoint: [number, number] | null;
}

export const initialMeasureState: MeasureState = {
  startPoint: null,
  endPoint: null,
  previewPoint: null,
};

export function handleMeasureClick(
  e: KonvaEventObject<MouseEvent>,
  state: MeasureState,
  offsetX: number,
  offsetY: number,
  scale: number,
  gridSpacingFt: number
): MeasureState {
  const stage = e.target.getStage();
  if (!stage) return state;
  const pos = stage.getPointerPosition();
  if (!pos) return state;

  const world = canvasToWorld(pos.x, pos.y, offsetX, offsetY, scale);
  const snapped = snapToGrid(world.x, world.y, gridSpacingFt);
  const pt: [number, number] = [snapped.x, snapped.y];

  if (!state.startPoint) {
    return { startPoint: pt, endPoint: null, previewPoint: null };
  }
  // Second click: set endpoint, ready to display distance
  return { startPoint: pt, endPoint: null, previewPoint: null };
}

export function handleMeasureMouseMove(
  e: KonvaEventObject<MouseEvent>,
  state: MeasureState,
  offsetX: number,
  offsetY: number,
  scale: number,
  gridSpacingFt: number
): MeasureState {
  if (!state.startPoint) return state;
  const stage = e.target.getStage();
  if (!stage) return state;
  const pos = stage.getPointerPosition();
  if (!pos) return state;

  const world = canvasToWorld(pos.x, pos.y, offsetX, offsetY, scale);
  const snapped = snapToGrid(world.x, world.y, gridSpacingFt);
  return { ...state, previewPoint: [snapped.x, snapped.y] };
}

export function getMeasureDistance(state: MeasureState): number | null {
  const a = state.startPoint;
  const b = state.previewPoint ?? state.endPoint;
  if (!a || !b) return null;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  return Math.sqrt(dx * dx + dy * dy);
}
