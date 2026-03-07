export interface TerrainGrid {
  widthSegments: number;
  heightSegments: number;
  worldWidth: number;
  worldHeight: number;
}

export interface TerrainParams extends TerrainGrid {
  scale: number;
  octaves: number;
  amplitude: number;
  persistence: number;
  seed: number;
}

export type Tool = "raise" | "lower" | "flatten" | "smooth";

export interface BrushSettings {
  tool: Tool;
  size: number;
  strength: number;
}

export type CameraMode = "orbit" | "firstPerson" | "topDown";
