import * as THREE from "three";
import type { LandscapeObject } from "../../../types/landscape";
import { createMaterial } from "../materials";

export function buildRetainingWall(obj: LandscapeObject): THREE.Group {
  const group = new THREE.Group();
  group.name = obj.name || "retaining-wall";

  const height = (obj.properties.height as number) ?? 3;
  const width = (obj.properties.width as number) ?? 1;
  const mat = createMaterial(obj.style, obj.category);

  const worldPts = obj.points.map(
    ([x, y]) =>
      new THREE.Vector3(x + obj.position.x, 0, -(y + obj.position.y))
  );

  for (let i = 0; i < worldPts.length - 1; i++) {
    const a = worldPts[i];
    const b = worldPts[i + 1];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.01) continue;

    const angle = Math.atan2(dz, dx);
    const cx = (a.x + b.x) / 2;
    const cz = (a.z + b.z) / 2;

    const geo = new THREE.BoxGeometry(len, height, width);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(cx, height / 2, cz);
    mesh.rotation.y = -angle;
    group.add(mesh);
  }

  return group;
}
