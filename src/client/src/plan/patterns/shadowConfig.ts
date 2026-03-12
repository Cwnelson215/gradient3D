import type { ObjectType } from "../../types/landscape";

interface ShadowProps {
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
}

const shadowMap: Partial<Record<ObjectType, ShadowProps>> = {
  house: { shadowColor: "#000", shadowBlur: 10, shadowOffsetX: 4, shadowOffsetY: 4, shadowOpacity: 0.4 },
  "retaining-wall": { shadowColor: "#000", shadowBlur: 6, shadowOffsetX: 3, shadowOffsetY: 3, shadowOpacity: 0.35 },
  fence: { shadowColor: "#000", shadowBlur: 6, shadowOffsetX: 3, shadowOffsetY: 3, shadowOpacity: 0.3 },
  tree: { shadowColor: "#000", shadowBlur: 12, shadowOffsetX: 6, shadowOffsetY: 6, shadowOpacity: 0.3 },
  shrub: { shadowColor: "#000", shadowBlur: 6, shadowOffsetX: 3, shadowOffsetY: 3, shadowOpacity: 0.25 },
};

export function getShadowProps(objectType: ObjectType): ShadowProps {
  return shadowMap[objectType] ?? {};
}
