import * as THREE from "three";
import type { ObjectStyle, ObjectCategory } from "../../types/landscape";

const cache = new Map<string, THREE.MeshStandardMaterial>();

const roughnessMap: Record<ObjectCategory, number> = {
  softscape: 0.9,
  hardscape: 0.7,
  water: 0.3,
  structure: 0.5,
};

export function createMaterial(
  style: ObjectStyle,
  category: ObjectCategory
): THREE.MeshStandardMaterial {
  const fill = style.fill && style.fill !== "transparent" ? style.fill : style.stroke ?? "#888888";
  const opacity = style.opacity ?? 1;
  const key = `${fill}_${opacity}_${category}`;

  const cached = cache.get(key);
  if (cached) return cached;

  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(fill),
    roughness: roughnessMap[category],
    metalness: 0.1,
    transparent: opacity < 1,
    opacity,
  });

  cache.set(key, mat);
  return mat;
}

export function createWaterMaterial(): THREE.MeshStandardMaterial {
  const key = "_water_";
  const cached = cache.get(key);
  if (cached) return cached;

  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#4a90d9"),
    roughness: 0.2,
    metalness: 0.1,
    transparent: true,
    opacity: 0.6,
  });
  cache.set(key, mat);
  return mat;
}

export function clearMaterialCache(): void {
  cache.clear();
}
