import * as THREE from "three";
import type { LandscapeObject } from "../../../types/landscape";
import { createMaterial } from "../materials";

export function buildShrub(obj: LandscapeObject): THREE.Mesh {
  const height = (obj.properties.height as number) ?? 4;
  const r = obj.radius ?? (obj.properties.radius as number) ?? 2;

  const cx = obj.points[0][0] + obj.position.x;
  const cz = -(obj.points[0][1] + obj.position.y);

  // Hemisphere: sphere with phiStart=0, phiLength=PI (bottom half removed)
  const geo = new THREE.SphereGeometry(r, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  geo.scale(1, height / r, 1);

  const mat = createMaterial(obj.style, obj.category);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(cx, 0, cz);
  mesh.name = obj.name || "shrub";
  return mesh;
}
