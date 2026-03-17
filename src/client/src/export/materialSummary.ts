import type { LandscapeObject } from "../types/landscape";
import { polygonArea, polylineLength } from "../utils/coordinates";
import { objectRegistry } from "../types/objectRegistry";

export interface MaterialItem {
  type: string;
  label: string;
  count: number;
  totalArea?: number;
  totalLength?: number;
}

export function computeMaterialSummary(objects: LandscapeObject[]): MaterialItem[] {
  const grouped = new Map<string, { objects: LandscapeObject[]; label: string }>();

  for (const obj of objects) {
    if (obj.type === "annotation") continue;
    const existing = grouped.get(obj.type);
    if (existing) {
      existing.objects.push(obj);
    } else {
      const reg = objectRegistry[obj.type];
      grouped.set(obj.type, { objects: [obj], label: reg?.label ?? obj.type });
    }
  }

  const items: MaterialItem[] = [];

  for (const [type, { objects: objs, label }] of grouped) {
    const item: MaterialItem = { type, label, count: objs.length };

    const first = objs[0];
    if (first.geometry === "polygon") {
      item.totalArea = objs.reduce((sum, o) => {
        if (o.points.length >= 3) return sum + polygonArea(o.points);
        return sum;
      }, 0);
    } else if (first.geometry === "line") {
      item.totalLength = objs.reduce((sum, o) => {
        if (o.points.length >= 2) return sum + polylineLength(o.points);
        return sum;
      }, 0);
    }

    items.push(item);
  }

  return items.sort((a, b) => a.label.localeCompare(b.label));
}
