import type {
  ObjectType,
  GeometryMode,
  ObjectCategory,
  ObjectStyle,
  PlanTool,
} from "./landscape";

export interface ObjectRegistryEntry {
  type: ObjectType;
  category: ObjectCategory;
  geometry: GeometryMode;
  label: string;
  tool: PlanTool;
  defaultStyle: ObjectStyle;
  defaultProperties: Record<string, unknown>;
}

export const objectRegistry: Record<ObjectType, ObjectRegistryEntry> = {
  boundary: {
    type: "boundary",
    category: "structure",
    geometry: "polygon",
    label: "Boundary",
    tool: "drawBoundary",
    defaultStyle: {
      stroke: "#ffcc00",
      strokeWidth: 2,
      fill: "transparent",
      opacity: 1,
      dash: [8, 4],
    },
    defaultProperties: {},
  },
  house: {
    type: "house",
    category: "structure",
    geometry: "polygon",
    label: "House",
    tool: "drawHouse",
    defaultStyle: {
      stroke: "#666666",
      strokeWidth: 2,
      fill: "#c0b0a0",
      opacity: 0.8,
    },
    defaultProperties: {},
  },
  fence: {
    type: "fence",
    category: "hardscape",
    geometry: "line",
    label: "Fence",
    tool: "drawFence",
    defaultStyle: {
      stroke: "#8B6914",
      strokeWidth: 3,
      fill: "transparent",
      opacity: 1,
    },
    defaultProperties: { height: 6, fenceStyle: "privacy" },
  },
  pathway: {
    type: "pathway",
    category: "hardscape",
    geometry: "polygon",
    label: "Pathway",
    tool: "drawPathway",
    defaultStyle: {
      stroke: "#999999",
      strokeWidth: 1,
      fill: "#c4b5a0",
      opacity: 0.8,
    },
    defaultProperties: {},
  },
  driveway: {
    type: "driveway",
    category: "hardscape",
    geometry: "polygon",
    label: "Driveway",
    tool: "drawDriveway",
    defaultStyle: {
      stroke: "#888888",
      strokeWidth: 1,
      fill: "#b5b5b5",
      opacity: 0.8,
    },
    defaultProperties: {},
  },
  patio: {
    type: "patio",
    category: "hardscape",
    geometry: "polygon",
    label: "Patio",
    tool: "drawPatio",
    defaultStyle: {
      stroke: "#8B7355",
      strokeWidth: 1,
      fill: "#c9b08a",
      opacity: 0.8,
    },
    defaultProperties: {},
  },
  "retaining-wall": {
    type: "retaining-wall",
    category: "hardscape",
    geometry: "line",
    label: "Retaining Wall",
    tool: "drawRetainingWall",
    defaultStyle: {
      stroke: "#777777",
      strokeWidth: 4,
      fill: "transparent",
      opacity: 1,
    },
    defaultProperties: { height: 3, width: 1 },
  },
  tree: {
    type: "tree",
    category: "softscape",
    geometry: "point",
    label: "Tree",
    tool: "drawTree",
    defaultStyle: {
      stroke: "#2d5a1e",
      strokeWidth: 2,
      fill: "#3a7d2c",
      opacity: 0.8,
    },
    defaultProperties: { radius: 5, height: 20, canopyShape: "sphere" },
  },
  shrub: {
    type: "shrub",
    category: "softscape",
    geometry: "point",
    label: "Shrub",
    tool: "drawShrub",
    defaultStyle: {
      stroke: "#2d5a1e",
      strokeWidth: 1,
      fill: "#4a8c3a",
      opacity: 0.8,
    },
    defaultProperties: { radius: 2, height: 4 },
  },
  "flower-bed": {
    type: "flower-bed",
    category: "softscape",
    geometry: "polygon",
    label: "Flower Bed",
    tool: "drawFlowerBed",
    defaultStyle: {
      stroke: "#cc66aa",
      strokeWidth: 1,
      fill: "#e899cc",
      opacity: 0.7,
    },
    defaultProperties: {},
  },
  garden: {
    type: "garden",
    category: "softscape",
    geometry: "polygon",
    label: "Garden",
    tool: "drawGarden",
    defaultStyle: {
      stroke: "#5a3e1b",
      strokeWidth: 1,
      fill: "#7a5930",
      opacity: 0.7,
    },
    defaultProperties: {},
  },
  lawn: {
    type: "lawn",
    category: "softscape",
    geometry: "polygon",
    label: "Lawn",
    tool: "drawLawn",
    defaultStyle: {
      stroke: "#2d7a1e",
      strokeWidth: 1,
      fill: "#5a8a4a",
      opacity: 0.6,
    },
    defaultProperties: {},
  },
  pond: {
    type: "pond",
    category: "water",
    geometry: "polygon",
    label: "Pond",
    tool: "drawPond",
    defaultStyle: {
      stroke: "#1a6b8a",
      strokeWidth: 1,
      fill: "#3a7aaa",
      opacity: 0.6,
    },
    defaultProperties: {},
  },
  pool: {
    type: "pool",
    category: "water",
    geometry: "polygon",
    label: "Pool",
    tool: "drawPool",
    defaultStyle: {
      stroke: "#0d47a1",
      strokeWidth: 2,
      fill: "#5a9ac0",
      opacity: 0.7,
    },
    defaultProperties: { depth: 6 },
  },
  irrigation: {
    type: "irrigation",
    category: "water",
    geometry: "line",
    label: "Irrigation",
    tool: "drawIrrigation",
    defaultStyle: {
      stroke: "#2196F3",
      strokeWidth: 2,
      fill: "transparent",
      opacity: 0.8,
      dash: [4, 4],
    },
    defaultProperties: {},
  },
};

/** Get the ObjectType from a PlanTool (e.g. "drawFence" → "fence") */
export function toolToObjectType(tool: PlanTool): ObjectType | null {
  for (const entry of Object.values(objectRegistry)) {
    if (entry.tool === tool) return entry.type;
  }
  return null;
}

/** Get entries grouped by category */
export function getRegistryByCategory(): Record<ObjectCategory, ObjectRegistryEntry[]> {
  const groups: Record<ObjectCategory, ObjectRegistryEntry[]> = {
    structure: [],
    hardscape: [],
    softscape: [],
    water: [],
  };
  for (const entry of Object.values(objectRegistry)) {
    groups[entry.category].push(entry);
  }
  return groups;
}
