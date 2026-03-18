const PIXELS_PER_FOOT = 8;

export interface GridLevel {
  spacingFt: number;
  label: string;
  stroke: string;
  strokeWidth: number;
}

/** @deprecated Use getGridLevels(gridSpacingFt) instead */
export const FINE_GRID_LEVELS: GridLevel[] = [
  { spacingFt: 5,      label: "5 ft",   stroke: "#888",    strokeWidth: 0.4  },
  { spacingFt: 1,      label: "1 ft",   stroke: "#757575", strokeWidth: 0.3  },
  { spacingFt: 1 / 2,  label: "6 in",   stroke: "#636363", strokeWidth: 0.25 },
  { spacingFt: 1 / 12, label: "1 in",   stroke: "#525252", strokeWidth: 0.2  },
];

const NICE_VALUES: { spacingFt: number; label: string }[] = [
  { spacingFt: 500,    label: "500 ft" },
  { spacingFt: 200,    label: "200 ft" },
  { spacingFt: 100,    label: "100 ft" },
  { spacingFt: 50,     label: "50 ft"  },
  { spacingFt: 20,     label: "20 ft"  },
  { spacingFt: 10,     label: "10 ft"  },
  { spacingFt: 5,      label: "5 ft"   },
  { spacingFt: 2,      label: "2 ft"   },
  { spacingFt: 1,      label: "1 ft"   },
  { spacingFt: 1 / 2,  label: "6 in"   },
  { spacingFt: 1 / 12, label: "1 in"   },
];

// Styling gradient: index 0 = coarsest visible fine level (most prominent)
const STYLE_GRADIENT: { stroke: string; strokeWidth: number }[] = [
  { stroke: "#888", strokeWidth: 0.4  },
  { stroke: "#7e7e7e", strokeWidth: 0.35 },
  { stroke: "#757575", strokeWidth: 0.3  },
  { stroke: "#6c6c6c", strokeWidth: 0.28 },
  { stroke: "#636363", strokeWidth: 0.25 },
  { stroke: "#5a5a5a", strokeWidth: 0.22 },
  { stroke: "#525252", strokeWidth: 0.2  },
];

export function getGridLevels(gridSpacingFt: number): GridLevel[] {
  // Build a clean subdivision chain: each level must evenly divide the one above it.
  // This prevents overlapping patterns (e.g., 50 and 20 both visible under a 100 grid).
  const chain: { spacingFt: number; label: string }[] = [];
  let parent = gridSpacingFt;
  for (const v of NICE_VALUES) {
    if (v.spacingFt >= parent) continue;
    const ratio = parent / v.spacingFt;
    if (Math.abs(ratio - Math.round(ratio)) < 1e-9) {
      chain.push(v);
      parent = v.spacingFt;
    }
  }
  return chain.map((v, i) => ({
    spacingFt: v.spacingFt,
    label: v.label,
    stroke: STYLE_GRADIENT[Math.min(i, STYLE_GRADIENT.length - 1)].stroke,
    strokeWidth: STYLE_GRADIENT[Math.min(i, STYLE_GRADIENT.length - 1)].strokeWidth,
  }));
}

export const MIN_PIXEL_THRESHOLD = 40;

export function getFinestVisibleIncrement(scale: number, majorSpacingFt: number): number {
  const levels = getGridLevels(majorSpacingFt);
  let finest = majorSpacingFt;
  for (const level of levels) {
    if (level.spacingFt * PIXELS_PER_FOOT * scale >= MIN_PIXEL_THRESHOLD) {
      finest = level.spacingFt;
    }
  }
  return finest;
}

export function worldToCanvas(
  worldX: number,
  worldY: number,
  offsetX: number,
  offsetY: number,
  scale: number
): { x: number; y: number } {
  return {
    x: worldX * PIXELS_PER_FOOT * scale + offsetX,
    y: worldY * PIXELS_PER_FOOT * scale + offsetY,
  };
}

export function canvasToWorld(
  canvasX: number,
  canvasY: number,
  offsetX: number,
  offsetY: number,
  scale: number
): { x: number; y: number } {
  return {
    x: (canvasX - offsetX) / (PIXELS_PER_FOOT * scale),
    y: (canvasY - offsetY) / (PIXELS_PER_FOOT * scale),
  };
}

export const SNAP_INCREMENT_FT = 1 / 12; // kept for backward compat

export function polygonCentroid(points: [number, number][]): [number, number] {
  if (points.length === 0) return [0, 0];
  let cx = 0;
  let cy = 0;
  let area = 0;

  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const cross = points[i][0] * points[j][1] - points[j][0] * points[i][1];
    area += cross;
    cx += (points[i][0] + points[j][0]) * cross;
    cy += (points[i][1] + points[j][1]) * cross;
  }

  area /= 2;
  if (Math.abs(area) < 1e-10) {
    const sx = points.reduce((s, p) => s + p[0], 0) / points.length;
    const sy = points.reduce((s, p) => s + p[1], 0) / points.length;
    return [sx, sy];
  }

  cx /= 6 * area;
  cy /= 6 * area;
  return [cx, cy];
}

export function polygonArea(points: [number, number][]): number {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i][0] * points[j][1];
    area -= points[j][0] * points[i][1];
  }
  return Math.abs(area / 2);
}

export function snapToGrid(worldX: number, worldY: number, gridSpacingFt: number, scale: number): { x: number; y: number } {
  const increment = getFinestVisibleIncrement(scale, gridSpacingFt);
  return {
    x: Math.round(worldX / increment) * increment,
    y: Math.round(worldY / increment) * increment,
  };
}

export function snapToExistingPoint(
  gridSnapped: { x: number; y: number },
  objects: { points: [number, number][]; position: { x: number; y: number } }[],
  currentDrawingPoints: [number, number][],
  scale: number,
  thresholdPx: number = 12
): { x: number; y: number } {
  const thresholdWorld = thresholdPx / (PIXELS_PER_FOOT * scale);
  let bestDist = thresholdWorld;
  let bestPoint = gridSnapped;

  for (const obj of objects) {
    for (const pt of obj.points) {
      const wx = pt[0] + obj.position.x;
      const wy = pt[1] + obj.position.y;
      const dx = gridSnapped.x - wx;
      const dy = gridSnapped.y - wy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) {
        bestDist = dist;
        bestPoint = { x: wx, y: wy };
      }
    }
  }

  for (const pt of currentDrawingPoints) {
    const dx = gridSnapped.x - pt[0];
    const dy = gridSnapped.y - pt[1];
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < bestDist) {
      bestDist = dist;
      bestPoint = { x: pt[0], y: pt[1] };
    }
  }

  return bestPoint;
}

export function polylineLength(points: [number, number][]): number {
  let len = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1][0] - points[i][0];
    const dy = points[i + 1][1] - points[i][1];
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return len;
}

export { PIXELS_PER_FOOT };
