import { BrushSettings, TerrainGrid } from "../types/terrain";
import { worldToGrid, gaussianWeight, sampleHeight } from "./utils";

export function applyBrush(
  heightmap: Float32Array,
  cx: number,
  cz: number,
  brush: BrushSettings,
  grid: TerrainGrid
): void {
  const [gcx, gcz] = worldToGrid(cx, cz, grid);
  const gridRadius =
    (brush.size / grid.worldWidth) * grid.widthSegments;
  const cols = grid.widthSegments + 1;
  const rows = grid.heightSegments + 1;

  const minX = Math.max(0, Math.floor(gcx - gridRadius));
  const maxX = Math.min(cols - 1, Math.ceil(gcx + gridRadius));
  const minZ = Math.max(0, Math.floor(gcz - gridRadius));
  const maxZ = Math.min(rows - 1, Math.ceil(gcz + gridRadius));

  const centerHeight =
    brush.tool === "flatten"
      ? sampleHeight(heightmap, cx, cz, grid)
      : 0;

  for (let z = minZ; z <= maxZ; z++) {
    for (let x = minX; x <= maxX; x++) {
      const dist = Math.sqrt((x - gcx) ** 2 + (z - gcz) ** 2);
      if (dist > gridRadius) continue;

      const weight = gaussianWeight(dist, gridRadius);
      const idx = z * cols + x;

      switch (brush.tool) {
        case "raise":
          heightmap[idx] += brush.strength * weight;
          break;
        case "lower":
          heightmap[idx] -= brush.strength * weight;
          break;
        case "flatten":
          heightmap[idx] += (centerHeight - heightmap[idx]) * weight * brush.strength * 0.1;
          break;
        case "smooth": {
          let sum = 0;
          let count = 0;
          for (let dz = -1; dz <= 1; dz++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              const nz = z + dz;
              if (nx >= 0 && nx < cols && nz >= 0 && nz < rows) {
                sum += heightmap[nz * cols + nx];
                count++;
              }
            }
          }
          const avg = sum / count;
          heightmap[idx] += (avg - heightmap[idx]) * weight * brush.strength * 0.3;
          break;
        }
      }
    }
  }
}
