import { Line } from "react-konva";
import type { LandscapeObject } from "../../types/landscape";
import { PIXELS_PER_FOOT, polygonCentroid } from "../../utils/coordinates";

export interface SnapGuide {
  axis: "x" | "y";
  value: number; // world coordinate
}

function getObjectEdges(obj: LandscapeObject): { cx: number; cy: number; minX: number; maxX: number; minY: number; maxY: number } {
  const xs = obj.points.map((p) => p[0] + obj.position.x);
  const ys = obj.points.map((p) => p[1] + obj.position.y);
  if (xs.length === 0) return { cx: obj.position.x, cy: obj.position.y, minX: obj.position.x, maxX: obj.position.x, minY: obj.position.y, maxY: obj.position.y };

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  let cx: number, cy: number;
  if (obj.geometry === "polygon" && obj.points.length >= 3) {
    const centroid = polygonCentroid(obj.points);
    cx = centroid[0] + obj.position.x;
    cy = centroid[1] + obj.position.y;
  } else {
    cx = (minX + maxX) / 2;
    cy = (minY + maxY) / 2;
  }

  return { cx, cy, minX, maxX, minY, maxY };
}

export function computeSnapGuides(
  movingObj: LandscapeObject,
  allObjects: LandscapeObject[],
  threshold: number
): SnapGuide[] {
  const guides: SnapGuide[] = [];
  const moving = getObjectEdges(movingObj);
  const movingValues = {
    x: [moving.cx, moving.minX, moving.maxX],
    y: [moving.cy, moving.minY, moving.maxY],
  };

  for (const other of allObjects) {
    if (other.id === movingObj.id || !other.visible) continue;
    const o = getObjectEdges(other);
    const otherValues = {
      x: [o.cx, o.minX, o.maxX],
      y: [o.cy, o.minY, o.maxY],
    };

    for (const mv of movingValues.x) {
      for (const ov of otherValues.x) {
        if (Math.abs(mv - ov) < threshold) {
          guides.push({ axis: "x", value: ov });
        }
      }
    }

    for (const mv of movingValues.y) {
      for (const ov of otherValues.y) {
        if (Math.abs(mv - ov) < threshold) {
          guides.push({ axis: "y", value: ov });
        }
      }
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return guides.filter((g) => {
    const key = `${g.axis}:${g.value.toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function applySnap(
  position: { x: number; y: number },
  guides: SnapGuide[]
): { x: number; y: number } {
  return position;
}

export function SnapGuideLayer({
  guides,
  scale,
  offsetX,
  offsetY,
}: {
  guides: SnapGuide[];
  scale: number;
  offsetX: number;
  offsetY: number;
}) {
  if (guides.length === 0) return null;

  const pxScale = PIXELS_PER_FOOT * scale;
  const extent = 5000;

  return (
    <>
      {guides.map((g, i) => {
        if (g.axis === "x") {
          const px = g.value * pxScale + offsetX;
          return (
            <Line
              key={`snap-${i}`}
              points={[px, -extent, px, extent]}
              stroke="#4a9eff"
              strokeWidth={0.5}
              dash={[4, 4]}
              opacity={0.6}
            />
          );
        } else {
          const py = g.value * pxScale + offsetY;
          return (
            <Line
              key={`snap-${i}`}
              points={[-extent, py, extent, py]}
              stroke="#4a9eff"
              strokeWidth={0.5}
              dash={[4, 4]}
              opacity={0.6}
            />
          );
        }
      })}
    </>
  );
}
