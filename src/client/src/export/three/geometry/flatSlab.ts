import * as THREE from "three";
import type { LandscapeObject, ObjectType } from "../../../types/landscape";
import { polygonToShape } from "../coordinates";
import { createMaterial } from "../materials";

const slabHeights: Partial<Record<ObjectType, number>> = {
  pathway: 0.3,
  driveway: 0.4,
  patio: 0.35,
  lawn: 0.02,
  "flower-bed": 0.5,
  garden: 0.4,
};

export function buildFlatSlab(obj: LandscapeObject): THREE.Mesh {
  const height = slabHeights[obj.type] ?? 0.3;
  const shape = polygonToShape(obj.points, obj.position.x, obj.position.y);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false,
  });
  // ExtrudeGeometry extrudes along +Z; rotate so extrusion goes up (+Y)
  geo.rotateX(-Math.PI / 2);

  const mat = createMaterial(obj.style, obj.category);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = obj.name || obj.type;
  return mesh;
}
