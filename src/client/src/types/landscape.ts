export type ObjectType = "boundary" | "house";

export type ViewMode = "plan" | "view3d" | "split";

export type PlanTool = "select" | "pan" | "drawBoundary" | "drawHouse";

export interface ObjectStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

export interface LandscapeObject {
  id: string;
  type: ObjectType;
  name: string;
  /** Polygon vertices in world coordinates (feet) as [x, y] pairs */
  points: [number, number][];
  position: { x: number; y: number };
  rotation: number;
  properties: Record<string, unknown>;
  style: ObjectStyle;
  locked: boolean;
  visible: boolean;
  zIndex: number;
}

export interface PropertyConfig {
  widthFt: number;
  depthFt: number;
  backgroundImage?: string;
  gridSpacingFt: number;
}

export interface ProjectState {
  property: PropertyConfig;
  objects: LandscapeObject[];
}
