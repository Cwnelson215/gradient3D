import { useMemo } from "react";
import * as THREE from "three";
import type { LandscapeObject } from "../../types/landscape";

interface Props {
  obj: LandscapeObject;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function Shrub3D({ obj }: Props) {
  if (obj.points.length === 0) return null;

  const r = obj.radius ?? (obj.properties.radius as number) ?? 2;
  const height = (obj.properties.height as number) ?? 4;
  const px = obj.points[0][0] + obj.position.x;
  const pz = obj.points[0][1] + obj.position.y;
  const baseColor = obj.style.fill ?? "#4a8c3a";

  const spheres = useMemo(() => {
    const rng = seededRandom(hashId(obj.id));
    const result: { pos: [number, number, number]; radius: number; color: string }[] = [];
    const count = 3 + Math.floor(rng() * 3);
    for (let i = 0; i < count; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * r * 0.4;
      const yOff = rng() * height * 0.2;
      const sr = r * (0.5 + rng() * 0.4);
      const rVal = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);
      const v = rng() * 25 - 12;
      result.push({
        pos: [Math.cos(angle) * dist, yOff, Math.sin(angle) * dist],
        radius: sr,
        color: `rgb(${Math.max(0, Math.min(255, rVal + v))},${Math.max(0, Math.min(255, g + v))},${Math.max(0, Math.min(255, b + v))})`,
      });
    }
    return result;
  }, [obj.id, r, height, baseColor]);

  return (
    <group position={[px, 0, pz]}>
      {spheres.map((s, i) => (
        <mesh
          key={i}
          position={s.pos}
          scale={[1, (height / r) * 0.5, 1]}
          castShadow
        >
          <sphereGeometry args={[s.radius, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color={s.color}
            roughness={0.85}
            transmission={0.05}
            thickness={1.5}
          />
        </mesh>
      ))}
    </group>
  );
}
