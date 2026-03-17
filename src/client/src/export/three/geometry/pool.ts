import * as THREE from "three";
import type { LandscapeObject } from "../../../types/landscape";
import { polygonToShape } from "../coordinates";
import { createMaterial, createWaterMaterial } from "../materials";

export function buildPool(obj: LandscapeObject): THREE.Group {
  const group = new THREE.Group();
  group.name = obj.name || "pool";

  const depth = (obj.properties.depth as number) ?? 6;

  // Pool walls — extrude downward
  const shape = polygonToShape(obj.points, obj.position.x, obj.position.y);
  const wallGeo = new THREE.ExtrudeGeometry(shape, {
    depth: depth,
    bevelEnabled: false,
  });
  // Rotate so extrusion goes downward (-Y)
  wallGeo.rotateX(Math.PI / 2);

  const mat = createMaterial(obj.style, obj.category);
  const walls = new THREE.Mesh(wallGeo, mat);
  group.add(walls);

  // Water surface plane at -0.5ft
  const waterShape = polygonToShape(obj.points, obj.position.x, obj.position.y);
  const waterGeo = new THREE.ShapeGeometry(waterShape);
  // ShapeGeometry is in XY plane; rotate to XZ
  waterGeo.rotateX(-Math.PI / 2);

  const waterMat = createWaterMaterial();
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = -0.5;
  group.add(water);

  return group;
}
