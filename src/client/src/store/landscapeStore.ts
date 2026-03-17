import { create } from "zustand";
import { persist } from "zustand/middleware";
import { produce } from "immer";
import { v4 as uuidv4 } from "uuid";
import type {
  LandscapeObject,
  ProjectState,
  PropertyConfig,
  ViewMode,
  PlanTool,
  ObjectType,
  ObjectStyle,
} from "../types/landscape";
import { objectRegistry } from "../types/objectRegistry";

const MAX_UNDO = 50;

interface LandscapeStore {
  project: ProjectState | null;
  viewMode: ViewMode;
  activeTool: PlanTool;
  selectedObjectId: string | null;
  hoveredObjectId: string | null;

  // Undo/redo stacks (not persisted)
  undoStack: ProjectState[];
  redoStack: ProjectState[];

  // Clipboard (not persisted)
  clipboard: LandscapeObject | null;

  // View state (shared across components)
  viewScale: number;
  viewOffset: { x: number; y: number };
  cursorWorldPos: { x: number; y: number } | null;

  initProject: (config: PropertyConfig) => void;
  loadProject: (project: ProjectState) => void;
  setViewMode: (mode: ViewMode) => void;
  setActiveTool: (tool: PlanTool) => void;
  selectObject: (id: string | null) => void;
  setHoveredObjectId: (id: string | null) => void;

  addObject: (
    type: ObjectType,
    name: string,
    points: [number, number][],
    style?: ObjectStyle,
    properties?: Record<string, unknown>,
    radius?: number
  ) => string;
  updateObject: (id: string, updates: Partial<LandscapeObject>) => void;
  removeObject: (id: string) => void;

  // Visibility/lock
  toggleObjectVisibility: (id: string) => void;
  toggleObjectLock: (id: string) => void;
  reorderObject: (id: string, newZIndex: number) => void;

  // Copy/paste/duplicate
  copyObject: (id: string) => void;
  pasteObject: () => void;
  duplicateObject: (id: string) => void;

  // View controls
  setViewScale: (scale: number) => void;
  setViewOffset: (offset: { x: number; y: number }) => void;
  setCursorWorldPos: (pos: { x: number; y: number } | null) => void;

  undo: () => void;
  redo: () => void;
}

function snapshot(state: LandscapeStore): void {
  if (!state.project) return;
  const copy = JSON.parse(JSON.stringify(state.project)) as ProjectState;
  state.undoStack = [...state.undoStack.slice(-(MAX_UNDO - 1)), copy];
  state.redoStack = [];
}

export const useLandscapeStore = create<LandscapeStore>()(
  persist(
    (set, get) => ({
      project: null,
      viewMode: "plan",
      activeTool: "select",
      selectedObjectId: null,
      hoveredObjectId: null,
      undoStack: [],
      redoStack: [],
      clipboard: null,
      viewScale: 1,
      viewOffset: { x: 40, y: 40 },
      cursorWorldPos: null,

      initProject: (config) => {
        set({
          project: { property: config, objects: [] },
          viewMode: "plan",
          activeTool: "select",
          selectedObjectId: null,
          undoStack: [],
          redoStack: [],
        });
      },

      loadProject: (project) => {
        set({
          project: JSON.parse(JSON.stringify(project)),
          viewMode: "plan",
          activeTool: "select",
          selectedObjectId: null,
          undoStack: [],
          redoStack: [],
        });
      },

      setViewMode: (mode) => set({ viewMode: mode }),
      setActiveTool: (tool) => set({ activeTool: tool }),
      selectObject: (id) => set({ selectedObjectId: id }),
      setHoveredObjectId: (id) => set({ hoveredObjectId: id }),

      addObject: (type, name, points, style, properties, radius) => {
        const id = uuidv4();
        const reg = objectRegistry[type];
        const obj: LandscapeObject = {
          id,
          type,
          geometry: reg.geometry,
          category: reg.category,
          name,
          points,
          radius,
          position: { x: 0, y: 0 },
          rotation: 0,
          properties: { ...reg.defaultProperties, ...properties },
          style: { ...reg.defaultStyle, ...style },
          locked: false,
          visible: true,
          zIndex: (get().project?.objects.length ?? 0) + 1,
        };

        set(
          produce((state: LandscapeStore) => {
            snapshot(state);
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
            snapshot(state);
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
            snapshot(state);
            state.project.objects = state.project.objects.filter(
              (o) => o.id !== id
            );
            if (state.selectedObjectId === id) {
              state.selectedObjectId = null;
            }
          })
        );
      },

      toggleObjectVisibility: (id) => {
        set(
          produce((state: LandscapeStore) => {
            if (!state.project) return;
            const obj = state.project.objects.find((o) => o.id === id);
            if (obj) obj.visible = !obj.visible;
          })
        );
      },

      toggleObjectLock: (id) => {
        set(
          produce((state: LandscapeStore) => {
            if (!state.project) return;
            const obj = state.project.objects.find((o) => o.id === id);
            if (obj) obj.locked = !obj.locked;
          })
        );
      },

      reorderObject: (id, newZIndex) => {
        set(
          produce((state: LandscapeStore) => {
            if (!state.project) return;
            const obj = state.project.objects.find((o) => o.id === id);
            if (obj) obj.zIndex = newZIndex;
          })
        );
      },

      copyObject: (id) => {
        const obj = get().project?.objects.find((o) => o.id === id);
        if (obj) {
          set({ clipboard: JSON.parse(JSON.stringify(obj)) });
        }
      },

      pasteObject: () => {
        const { clipboard, project } = get();
        if (!clipboard || !project) return;
        const newObj: LandscapeObject = {
          ...JSON.parse(JSON.stringify(clipboard)),
          id: uuidv4(),
          position: {
            x: clipboard.position.x + 2,
            y: clipboard.position.y + 2,
          },
          zIndex: project.objects.length + 1,
          name: `${clipboard.name} copy`,
        };
        set(
          produce((state: LandscapeStore) => {
            snapshot(state);
            if (state.project) {
              state.project.objects.push(newObj);
              state.selectedObjectId = newObj.id;
            }
          })
        );
      },

      duplicateObject: (id) => {
        const { project } = get();
        if (!project) return;
        const obj = project.objects.find((o) => o.id === id);
        if (!obj) return;
        const newObj: LandscapeObject = {
          ...JSON.parse(JSON.stringify(obj)),
          id: uuidv4(),
          position: {
            x: obj.position.x + 2,
            y: obj.position.y + 2,
          },
          zIndex: project.objects.length + 1,
          name: `${obj.name} copy`,
        };
        set(
          produce((state: LandscapeStore) => {
            snapshot(state);
            if (state.project) {
              state.project.objects.push(newObj);
              state.selectedObjectId = newObj.id;
            }
          })
        );
      },

      setViewScale: (scale) => set({ viewScale: scale }),
      setViewOffset: (offset) => set({ viewOffset: offset }),
      setCursorWorldPos: (pos) => set({ cursorWorldPos: pos }),

      undo: () => {
        set(
          produce((state: LandscapeStore) => {
            if (state.undoStack.length === 0 || !state.project) return;
            const current = JSON.parse(JSON.stringify(state.project)) as ProjectState;
            state.redoStack.push(current);
            state.project = state.undoStack.pop()!;
            state.selectedObjectId = null;
          })
        );
      },

      redo: () => {
        set(
          produce((state: LandscapeStore) => {
            if (state.redoStack.length === 0 || !state.project) return;
            const current = JSON.parse(JSON.stringify(state.project)) as ProjectState;
            state.undoStack.push(current);
            state.project = state.redoStack.pop()!;
            state.selectedObjectId = null;
          })
        );
      },
    }),
    {
      name: "gradient-project",
      partialize: (state) => ({ project: state.project }),
    }
  )
);
