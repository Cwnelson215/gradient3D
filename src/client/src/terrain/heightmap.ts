import { createNoise2D } from "simplex-noise";
import { TerrainParams } from "../types/terrain";

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateHeightmap(params: TerrainParams): Float32Array {
  const { widthSegments, heightSegments, scale, octaves, amplitude, persistence, seed } = params;
  const rng = seededRandom(seed);
  const noise2D = createNoise2D(rng);

  const cols = widthSegments + 1;
  const rows = heightSegments + 1;
  const heightmap = new Float32Array(cols * rows);

  for (let z = 0; z < rows; z++) {
    for (let x = 0; x < cols; x++) {
      let value = 0;
      let freq = 1 / scale;
      let amp = 1;
      let maxAmp = 0;

      for (let o = 0; o < octaves; o++) {
        value += noise2D(x * freq, z * freq) * amp;
        maxAmp += amp;
        freq *= 2;
        amp *= persistence;
      }

      heightmap[z * cols + x] = (value / maxAmp) * amplitude;
    }
  }

  return heightmap;
}
