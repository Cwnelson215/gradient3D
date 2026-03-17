import * as THREE from "three";
import type { LandscapeObject, PropertyConfig } from "../../types/landscape";
import { clearMaterialCache } from "./materials";
import { buildGroundPlane } from "./geometry/groundPlane";
import { buildHouse } from "./geometry/house";
import { buildFence } from "./geometry/fence";
import { buildRetainingWall } from "./geometry/retainingWall";
import { buildFlatSlab } from "./geometry/flatSlab";
import { buildTree } from "./geometry/tree";
import { buildShrub } from "./geometry/shrub";
import { buildPool } from "./geometry/pool";
import { buildPond } from "./geometry/pond";

const SKIP_TYPES = new Set(["boundary", "irrigation", "annotation"]);

const SLAB_TYPES = new Set([
  "pathway",
  "driveway",
  "patio",
  "lawn",
  "flower-bed",
  "garden",
]);

export function buildScene(
  objects: LandscapeObject[],
  property: PropertyConfig
): THREE.Scene {
  clearMaterialCache();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#b8d4e8");

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);

  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(-30, 50, 40);
  scene.add(dir);

  // Ground
  scene.add(buildGroundPlane(property));

  // Objects — filter visible, sort by zIndex
  const visible = objects
    .filter((o) => o.visible && !SKIP_TYPES.has(o.type))
    .sort((a, b) => a.zIndex - b.zIndex);

  for (const obj of visible) {
    let mesh: THREE.Object3D | null = null;

    if (SLAB_TYPES.has(obj.type)) {
      mesh = buildFlatSlab(obj);
    } else {
      switch (obj.type) {
        case "house":
          mesh = buildHouse(obj);
          break;
        case "fence":
          mesh = buildFence(obj);
          break;
        case "retaining-wall":
          mesh = buildRetainingWall(obj);
          break;
        case "tree":
          mesh = buildTree(obj);
          break;
        case "shrub":
          mesh = buildShrub(obj);
          break;
        case "pool":
          mesh = buildPool(obj);
          break;
        case "pond":
          mesh = buildPond(obj);
          break;
      }
    }

    if (mesh) {
      // Apply object rotation around its centroid
      if (obj.rotation) {
        mesh.rotation.y = -obj.rotation;
      }
      scene.add(mesh);
    }
  }

  return scene;
}
