import * as THREE from "three";
import type { LandscapeObject } from "../../../types/landscape";
import { polygonToShape } from "../coordinates";
import { createMaterial } from "../materials";

const WALL_HEIGHT = 10;
const PEAK_HEIGHT = 14;
const OVERHANG = 1;

export function buildHouse(obj: LandscapeObject): THREE.Group {
  const group = new THREE.Group();
  group.name = obj.name || "house";

  const mat = createMaterial(obj.style, obj.category);

  // Walls — extruded polygon
  const shape = polygonToShape(obj.points, obj.position.x, obj.position.y);
  const wallGeo = new THREE.ExtrudeGeometry(shape, {
    depth: WALL_HEIGHT,
    bevelEnabled: false,
  });
  wallGeo.rotateX(-Math.PI / 2);
  const walls = new THREE.Mesh(wallGeo, mat);
  group.add(walls);

  // Simple gable roof — compute bounding box of shape for roof sizing
  const pts = obj.points.map(([x, y]) => [
    x + obj.position.x,
    -(y + obj.position.y),
  ]);
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const [x, z] of pts) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }

  const w = maxX - minX + OVERHANG * 2;
  const d = maxZ - minZ + OVERHANG * 2;
  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;

  // Roof as a triangular prism (custom BufferGeometry)
  const roofGeo = buildGableRoof(w, d, WALL_HEIGHT, PEAK_HEIGHT);
  const roofMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#8B6C5C"),
    roughness: 0.8,
    metalness: 0.1,
  });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(cx, 0, cz);
  group.add(roof);

  return group;
}

function buildGableRoof(
  width: number,
  depth: number,
  wallH: number,
  peakH: number
): THREE.BufferGeometry {
  const hw = width / 2;
  const hd = depth / 2;

  // 6 vertices: 4 at eave level, 2 at ridge
  const verts = new Float32Array([
    // bottom-left, bottom-right, top-right, top-left (at wall height)
    -hw, wallH, -hd,  // 0
     hw, wallH, -hd,  // 1
     hw, wallH,  hd,  // 2
    -hw, wallH,  hd,  // 3
    // ridge line
    0, peakH, -hd,    // 4
    0, peakH,  hd,    // 5
  ]);

  // 8 triangles (2 per slope face + 2 per gable end)
  const indices = [
    // left slope
    0, 4, 5,
    0, 5, 3,
    // right slope
    1, 2, 5,
    1, 5, 4,
    // front gable
    0, 1, 4,
    // back gable
    2, 3, 5,
  ];

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}
