import * as THREE from "three";
import type { PropertyConfig } from "../../../types/landscape";

export function buildGroundPlane(property: PropertyConfig): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(property.widthFt, property.depthFt);
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#3a5a2a"),
    roughness: 0.95,
    metalness: 0,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(property.widthFt / 2, -0.01, -property.depthFt / 2);
  mesh.name = "ground";
  return mesh;
}
