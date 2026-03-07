import { create } from "zustand";
import { TerrainParams, BrushSettings, CameraMode } from "../types/terrain";
import { generateHeightmap } from "../terrain/heightmap";
import { applyBrush as applyBrushOp } from "../terrain/sculpting";

interface TerrainState {
  heightmap: Float32Array;
  params: TerrainParams;
  brushSettings: BrushSettings;
  mode: CameraMode;
  waterLevel: number;
  regenerate: (params?: Partial<TerrainParams>) => void;
  applyBrush: (wx: number, wz: number) => void;
  setMode: (mode: CameraMode) => void;
  setBrush: (settings: Partial<BrushSettings>) => void;
  setWaterLevel: (level: number) => void;
}

const defaultParams: TerrainParams = {
  widthSegments: 128,
  heightSegments: 128,
  worldWidth: 100,
  worldHeight: 100,
  scale: 50,
  octaves: 6,
  amplitude: 15,
  persistence: 0.5,
  seed: 42,
};

export const useTerrainStore = create<TerrainState>((set, get) => ({
  heightmap: generateHeightmap(defaultParams),
  params: defaultParams,
  brushSettings: {
    tool: "raise",
    size: 5,
    strength: 0.3,
  },
  mode: "orbit",
  waterLevel: 0,

  regenerate: (overrides) => {
    const params = { ...get().params, ...overrides };
    set({ params, heightmap: generateHeightmap(params) });
  },

  applyBrush: (wx, wz) => {
    const { heightmap, brushSettings, params } = get();
    applyBrushOp(heightmap, wx, wz, brushSettings, params);
    set({ heightmap: new Float32Array(heightmap) });
  },

  setMode: (mode) => set({ mode }),

  setBrush: (settings) =>
    set((s) => ({ brushSettings: { ...s.brushSettings, ...settings } })),

  setWaterLevel: (waterLevel) => set({ waterLevel }),
}));
