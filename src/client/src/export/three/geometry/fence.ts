import * as THREE from "three";
import type { LandscapeObject } from "../../../types/landscape";
import { createMaterial } from "../materials";

const POST_SIZE = 4 / 12; // 4 inches in feet
const RAIL_HEIGHT = 2 / 12;
const RAIL_DEPTH = 1.5 / 12;
const PICKET_WIDTH = 3.5 / 12;
const PICKET_DEPTH = 0.75 / 12;
const PICKET_GAP = 2 / 12;

export function buildFence(obj: LandscapeObject): THREE.Group {
  const group = new THREE.Group();
  group.name = obj.name || "fence";

  const height = (obj.properties.height as number) ?? 6;
  const style = (obj.properties.fenceStyle as string) ?? "privacy";
  const mat = createMaterial(obj.style, obj.category);

  const worldPts = obj.points.map(
    ([x, y]) =>
      new THREE.Vector3(x + obj.position.x, 0, -(y + obj.position.y))
  );

  // Posts at each vertex
  for (const pt of worldPts) {
    const postGeo = new THREE.BoxGeometry(POST_SIZE, height, POST_SIZE);
    const post = new THREE.Mesh(postGeo, mat);
    post.position.set(pt.x, height / 2, pt.z);
    group.add(post);
  }

  // Rails + optional pickets between consecutive vertices
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

    // 2-3 horizontal rails
    const railYs = height <= 4
      ? [height * 0.33, height * 0.67]
      : [height * 0.2, height * 0.5, height * 0.85];

    for (const ry of railYs) {
      const railGeo = new THREE.BoxGeometry(len, RAIL_HEIGHT, RAIL_DEPTH);
      const rail = new THREE.Mesh(railGeo, mat);
      rail.position.set(cx, ry, cz);
      rail.rotation.y = -angle;
      group.add(rail);
    }

    // Privacy pickets
    if (style === "privacy") {
      const step = PICKET_WIDTH + PICKET_GAP;
      const count = Math.floor(len / step);
      const nx = dx / len;
      const nz = dz / len;

      for (let p = 0; p < count; p++) {
        const t = (p + 0.5) * step;
        const px = a.x + nx * t;
        const pz = a.z + nz * t;
        const picketGeo = new THREE.BoxGeometry(
          PICKET_WIDTH,
          height,
          PICKET_DEPTH
        );
        const picket = new THREE.Mesh(picketGeo, mat);
        picket.position.set(px, height / 2, pz);
        picket.rotation.y = -angle;
        group.add(picket);
      }
    }
  }

  return group;
}
