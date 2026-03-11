import polygonClipping from "polygon-clipping";
import type { Polygon } from "polygon-clipping";
import type { LandscapeObject, ObjectType } from "../types/landscape";

/**
 * Convert a LandscapeObject's points (with position offset) to a polygon-clipping Polygon.
 * polygon-clipping expects [[[x,y], ...]] (array of rings, first is outer).
 */
function toClipPolygon(obj: LandscapeObject): Polygon {
  return [obj.points.map((p) => [p[0] + obj.position.x, p[1] + obj.position.y])];
}

/**
 * Check if two polygons overlap (their intersection is non-empty).
 */
function polygonsOverlap(a: Polygon, b: Polygon): boolean {
  const result = polygonClipping.intersection(a, b);
  return result.length > 0;
}

/**
 * Given a new set of points and the existing objects, find all same-type objects
 * that overlap and merge them into a single set of points.
 *
 * Returns:
 * - mergedPoints: the union polygon points (or original if no overlap)
 * - consumedIds: IDs of existing objects that were merged (should be removed)
 */
export function mergeWithOverlapping(
  newPoints: [number, number][],
  type: ObjectType,
  objects: LandscapeObject[]
): { mergedPoints: [number, number][]; consumedIds: string[] } {
  const newPoly: Polygon = [newPoints.map((p) => [p[0], p[1]])];
  const sameType = objects.filter((o) => o.type === type);

  // Find all overlapping objects
  const overlapping = sameType.filter((obj) => {
    const objPoly = toClipPolygon(obj);
    return polygonsOverlap(newPoly, objPoly);
  });

  if (overlapping.length === 0) {
    return { mergedPoints: newPoints, consumedIds: [] };
  }

  // Union all overlapping polygons with the new one
  const allPolygons: Polygon[] = [newPoly, ...overlapping.map(toClipPolygon)];
  let merged = allPolygons[0];
  for (let i = 1; i < allPolygons.length; i++) {
    const result = polygonClipping.union(merged, allPolygons[i]);
    if (result.length > 0) {
      // Take the first (largest) polygon from the result
      merged = result[0];
    }
  }

  // The outer ring is the first ring of the merged polygon
  const outerRing = merged[0];
  const mergedPoints: [number, number][] = outerRing.map((p) => [p[0], p[1]]);

  return {
    mergedPoints,
    consumedIds: overlapping.map((o) => o.id),
  };
}
