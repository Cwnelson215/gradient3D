import * as THREE from "three";
import type { LandscapeObject } from "../../../types/landscape";
import { createMaterial } from "../materials";

export function buildTree(obj: LandscapeObject): THREE.Group {
  const group = new THREE.Group();
  group.name = obj.name || "tree";

  const height = (obj.properties.height as number) ?? 20;
  const canopyRadius = obj.radius ?? (obj.properties.radius as number) ?? 5;
  const canopyShape = (obj.properties.canopyShape as string) ?? "sphere";

  const cx = obj.points[0][0] + obj.position.x;
  const cz = -(obj.points[0][1] + obj.position.y);

  // Trunk — tapered cylinder (40% of total height)
  const trunkH = height * 0.4;
  const trunkR = canopyRadius * 0.12;
  const trunkGeo = new THREE.CylinderGeometry(
    trunkR * 0.7,
    trunkR,
    trunkH,
    8
  );
  const trunkMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#5a3a1a"),
    roughness: 0.9,
    metalness: 0,
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.set(cx, trunkH / 2, cz);
  group.add(trunk);

  // Canopy
  const canopyH = height - trunkH;
  const canopyMat = createMaterial(obj.style, obj.category);
  let canopyGeo: THREE.BufferGeometry;

  if (canopyShape === "cone") {
    canopyGeo = new THREE.ConeGeometry(canopyRadius, canopyH, 12);
  } else {
    canopyGeo = new THREE.SphereGeometry(canopyRadius, 16, 12);
  }

  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(cx, trunkH + canopyH / 2, cz);
  group.add(canopy);

  return group;
}
