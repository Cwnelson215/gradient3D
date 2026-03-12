const PIXELS_PER_FOOT = 8;

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

export const SNAP_INCREMENT_FT = 1 / 12;

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
  const finePixelSpacing = SNAP_INCREMENT_FT * PIXELS_PER_FOOT * scale;
  const increment = finePixelSpacing >= 5 ? SNAP_INCREMENT_FT : gridSpacingFt;
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
