import { create } from "zustand";
import { produce } from "immer";
import { v4 as uuidv4 } from "uuid";
import type {
  LandscapeObject,
  ProjectState,
  PropertyConfig,
  ViewMode,
  PlanTool,
  CameraMode,
  ObjectType,
  ObjectStyle,
} from "../types/landscape";

interface LandscapeStore {
  project: ProjectState | null;
  viewMode: ViewMode;
  activeTool: PlanTool;
  selectedObjectId: string | null;
  cameraMode: CameraMode;

  initProject: (config: PropertyConfig) => void;
  setViewMode: (mode: ViewMode) => void;
  setActiveTool: (tool: PlanTool) => void;
  selectObject: (id: string | null) => void;
  setCameraMode: (mode: CameraMode) => void;

  addObject: (
    type: ObjectType,
    name: string,
    points: [number, number][],
    style?: ObjectStyle,
    properties?: Record<string, unknown>
  ) => string;
  updateObject: (id: string, updates: Partial<LandscapeObject>) => void;
  removeObject: (id: string) => void;
}

const defaultStyles: Record<ObjectType, ObjectStyle> = {
  boundary: {
    stroke: "#ffcc00",
    strokeWidth: 2,
    fill: "transparent",
    opacity: 1,
  },
  house: {
    stroke: "#666666",
    strokeWidth: 2,
    fill: "#8B7355",
    opacity: 0.8,
  },
};

export const useLandscapeStore = create<LandscapeStore>((set, get) => ({
  project: null,
  viewMode: "plan",
  activeTool: "select",
  selectedObjectId: null,
  cameraMode: "orbit",

  initProject: (config) => {
    set({
      project: {
        property: config,
        objects: [],
      },
      viewMode: "plan",
      activeTool: "select",
      selectedObjectId: null,
    });
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  selectObject: (id) => set({ selectedObjectId: id }),
  setCameraMode: (mode) => set({ cameraMode: mode }),

  addObject: (type, name, points, style, properties) => {
    const id = uuidv4();
    const obj: LandscapeObject = {
      id,
      type,
      name,
      points,
      position: { x: 0, y: 0 },
      rotation: 0,
      properties: properties ?? {},
      style: { ...defaultStyles[type], ...style },
      locked: false,
      visible: true,
      zIndex: (get().project?.objects.length ?? 0) + 1,
    };

    set(
      produce((state: LandscapeStore) => {
        if (state.project) {
          state.project.objects.push(obj);
        }
      })
    );

    return id;
  },

  updateObject: (id, updates) => {
    set(
      produce((state: LandscapeStore) => {
        if (!state.project) return;
        const idx = state.project.objects.findIndex((o) => o.id === id);
        if (idx !== -1) {
          Object.assign(state.project.objects[idx], updates);
        }
      })
    );
  },

  removeObject: (id) => {
    set(
      produce((state: LandscapeStore) => {
        if (!state.project) return;
        state.project.objects = state.project.objects.filter(
          (o) => o.id !== id
        );
        if (state.selectedObjectId === id) {
          state.selectedObjectId = null;
        }
      })
    );
  },
}));
