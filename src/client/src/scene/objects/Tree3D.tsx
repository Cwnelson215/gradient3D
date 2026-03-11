import { useMemo } from "react";
import * as THREE from "three";
import type { LandscapeObject } from "../../types/landscape";
import { createBarkTexture, createGrassTexture } from "../../utils/proceduralTextures";

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

export function Tree3D({ obj }: Props) {
  if (obj.points.length === 0) return null;

  const r = obj.radius ?? (obj.properties.radius as number) ?? 5;
  const height = (obj.properties.height as number) ?? 20;
  const trunkRadius = Math.max(0.3, r * 0.15);
  const trunkHeight = height * 0.4;
  const canopyRadius = r;
  const px = obj.points[0][0] + obj.position.x;
  const pz = obj.points[0][1] + obj.position.y;
  const baseColor = obj.style.fill ?? "#3a7d2c";

  const barkMaps = useMemo(() => createBarkTexture(), []);

  // Curved trunk using TubeGeometry
  const trunkGeom = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.15, trunkHeight * 0.3, 0.1),
      new THREE.Vector3(-0.1, trunkHeight * 0.7, -0.05),
      new THREE.Vector3(0, trunkHeight, 0),
    ]);
    return new THREE.TubeGeometry(curve, 12, trunkRadius, 8, false);
  }, [trunkRadius, trunkHeight]);

  // Multi-sphere canopy for organic look
  const canopySpheres = useMemo(() => {
    const rng = seededRandom(hashId(obj.id));
    const spheres: { pos: [number, number, number]; radius: number; color: string }[] = [];
    const count = 5 + Math.floor(rng() * 4);
    for (let i = 0; i < count; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * canopyRadius * 0.5;
      const yOff = (rng() - 0.3) * canopyRadius * 0.6;
      const sr = canopyRadius * (0.5 + rng() * 0.4);
      // Vary green color
      const r2 = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);
      const variation = rng() * 30 - 15;
      const c = `rgb(${Math.max(0, Math.min(255, r2 + variation))},${Math.max(0, Math.min(255, g + variation))},${Math.max(0, Math.min(255, b + variation))})`;
      spheres.push({
        pos: [Math.cos(angle) * dist, yOff, Math.sin(angle) * dist],
        radius: sr,
        color: c,
      });
    }
    return spheres;
  }, [obj.id, canopyRadius, baseColor]);

  return (
    <group position={[px, 0, pz]}>
      {/* Trunk */}
      <mesh geometry={trunkGeom} castShadow>
        <meshStandardMaterial
          map={barkMaps.map}
          normalMap={barkMaps.normalMap}
          normalScale={new THREE.Vector2(0.8, 0.8)}
          roughness={0.9}
          color="#5a3a1a"
        />
      </mesh>
      {/* Canopy - multi-sphere cluster */}
      <group position={[0, trunkHeight + canopyRadius * 0.7, 0]}>
        {canopySpheres.map((s, i) => (
          <mesh key={i} position={s.pos} castShadow>
            <sphereGeometry args={[s.radius, 12, 10]} />
            <meshPhysicalMaterial
              color={s.color}
              roughness={0.8}
              transmission={0.1}
              thickness={2}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
