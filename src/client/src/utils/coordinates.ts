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

/** Convert feet to Three.js units (1 foot = 1 unit) */
export function worldTo3D(feetX: number, feetY: number): { x: number; z: number } {
  return { x: feetX, z: feetY };
}

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

export function snapToGrid(worldX: number, worldY: number, gridSpacingFt: number): { x: number; y: number } {
  return {
    x: Math.round(worldX / gridSpacingFt) * gridSpacingFt,
    y: Math.round(worldY / gridSpacingFt) * gridSpacingFt,
  };
}

export { PIXELS_PER_FOOT };
