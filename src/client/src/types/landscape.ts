export type ObjectType =
  | "boundary"
  | "house"
  | "fence"
  | "pathway"
  | "driveway"
  | "patio"
  | "retaining-wall"
  | "tree"
  | "shrub"
  | "flower-bed"
  | "garden"
  | "lawn"
  | "pond"
  | "pool"
  | "irrigation";

export type GeometryMode = "polygon" | "line" | "point";
export type ObjectCategory = "structure" | "hardscape" | "softscape" | "water";

export type ViewMode = "plan" | "view3d" | "split";

export type PlanTool =
  | "select"
  | "pan"
  | "measure"
  | "drawBoundary"
  | "drawHouse"
  | "drawFence"
  | "drawPathway"
  | "drawDriveway"
  | "drawPatio"
  | "drawRetainingWall"
  | "drawTree"
  | "drawShrub"
  | "drawFlowerBed"
  | "drawGarden"
  | "drawLawn"
  | "drawPond"
  | "drawPool"
  | "drawIrrigation";

export type CameraMode = "orbit" | "firstPerson" | "topDown";

export interface ObjectStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  dash?: number[];
}

export interface LandscapeObject {
  id: string;
  type: ObjectType;
  geometry: GeometryMode;
  category: ObjectCategory;
  name: string;
  /** Polygon/line vertices in world coordinates (feet) as [x, y] pairs */
  points: [number, number][];
  /** For point objects: radius in feet */
  radius?: number;
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
