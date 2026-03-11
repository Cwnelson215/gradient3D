import { useLandscapeStore } from "../store/landscapeStore";
import { Boundary3D } from "./objects/Boundary3D";
import { House3D } from "./objects/House3D";
import { Fence3D } from "./objects/Fence3D";
import { Pathway3D } from "./objects/Pathway3D";
import { Driveway3D } from "./objects/Driveway3D";
import { Patio3D } from "./objects/Patio3D";
import { RetainingWall3D } from "./objects/RetainingWall3D";
import { Tree3D } from "./objects/Tree3D";
import { Shrub3D } from "./objects/Shrub3D";
import { FlowerBed3D } from "./objects/FlowerBed3D";
import { Garden3D } from "./objects/Garden3D";
import { Lawn3D } from "./objects/Lawn3D";
import { Pond3D } from "./objects/Pond3D";
import { Pool3D } from "./objects/Pool3D";
import { Irrigation3D } from "./objects/Irrigation3D";
import type { LandscapeObject } from "../types/landscape";

const componentMap: Record<string, React.ComponentType<{ obj: LandscapeObject }>> = {
  boundary: Boundary3D,
  house: House3D,
  fence: Fence3D,
  pathway: Pathway3D,
  driveway: Driveway3D,
  patio: Patio3D,
  "retaining-wall": RetainingWall3D,
  tree: Tree3D,
  shrub: Shrub3D,
  "flower-bed": FlowerBed3D,
  garden: Garden3D,
  lawn: Lawn3D,
  pond: Pond3D,
  pool: Pool3D,
  irrigation: Irrigation3D,
};

export function LandscapeObjects3D() {
  const objects = useLandscapeStore((s) => s.project?.objects ?? []);

  return (
    <>
      {objects
        .filter((o) => o.visible)
        .map((obj) => {
          const Component = componentMap[obj.type];
          if (!Component) return null;
          return <Component key={obj.id} obj={obj} />;
        })}
    </>
  );
}
