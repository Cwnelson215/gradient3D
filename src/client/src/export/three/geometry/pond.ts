import * as THREE from "three";
import type { LandscapeObject } from "../../../types/landscape";
import { polygonToShape } from "../coordinates";
import { createMaterial, createWaterMaterial } from "../materials";

const POND_DEPTH = 2;

export function buildPond(obj: LandscapeObject): THREE.Group {
  const group = new THREE.Group();
  group.name = obj.name || "pond";

  // Pond basin — extrude downward
  const shape = polygonToShape(obj.points, obj.position.x, obj.position.y);
  const basinGeo = new THREE.ExtrudeGeometry(shape, {
    depth: POND_DEPTH,
    bevelEnabled: false,
  });
  basinGeo.rotateX(Math.PI / 2);

  const mat = createMaterial(obj.style, obj.category);
  const basin = new THREE.Mesh(basinGeo, mat);
  group.add(basin);

  // Water surface
  const waterShape = polygonToShape(obj.points, obj.position.x, obj.position.y);
  const waterGeo = new THREE.ShapeGeometry(waterShape);
  waterGeo.rotateX(-Math.PI / 2);

  const waterMat = createWaterMaterial();
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = -0.1;
  group.add(water);

  return group;
}
