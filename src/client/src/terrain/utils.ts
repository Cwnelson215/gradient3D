import { TerrainGrid } from "../types/terrain";

export function worldToGrid(
  wx: number,
  wz: number,
  grid: TerrainGrid
): [number, number] {
  const gx = ((wx + grid.worldWidth / 2) / grid.worldWidth) * grid.widthSegments;
  const gz = ((wz + grid.worldHeight / 2) / grid.worldHeight) * grid.heightSegments;
  return [gx, gz];
}

export function gridToWorld(
  gx: number,
  gz: number,
  grid: TerrainGrid
): [number, number] {
  const wx = (gx / grid.widthSegments) * grid.worldWidth - grid.worldWidth / 2;
  const wz = (gz / grid.heightSegments) * grid.worldHeight - grid.worldHeight / 2;
  return [wx, wz];
}

export function sampleHeight(
  heightmap: Float32Array,
  wx: number,
  wz: number,
  grid: TerrainGrid
): number {
  const [gx, gz] = worldToGrid(wx, wz, grid);
  const x0 = Math.floor(gx);
  const z0 = Math.floor(gz);
  const x1 = Math.min(x0 + 1, grid.widthSegments);
  const z1 = Math.min(z0 + 1, grid.heightSegments);

  const fx = gx - x0;
  const fz = gz - z0;

  const cols = grid.widthSegments + 1;
  const h00 = heightmap[z0 * cols + x0] || 0;
  const h10 = heightmap[z0 * cols + x1] || 0;
  const h01 = heightmap[z1 * cols + x0] || 0;
  const h11 = heightmap[z1 * cols + x1] || 0;

  const h0 = h00 * (1 - fx) + h10 * fx;
  const h1 = h01 * (1 - fx) + h11 * fx;
  return h0 * (1 - fz) + h1 * fz;
}

export function gaussianWeight(dist: number, radius: number): number {
  const sigma = radius / 3;
  return Math.exp(-(dist * dist) / (2 * sigma * sigma));
}
