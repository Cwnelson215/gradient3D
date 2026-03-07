import { useLandscapeStore } from "../store/landscapeStore";
import { Boundary3D } from "./objects/Boundary3D";
import { House3D } from "./objects/House3D";

export function LandscapeObjects3D() {
  const objects = useLandscapeStore((s) => s.project?.objects ?? []);

  return (
    <>
      {objects
        .filter((o) => o.visible)
        .map((obj) => {
          switch (obj.type) {
            case "boundary":
              return <Boundary3D key={obj.id} obj={obj} />;
            case "house":
              return <House3D key={obj.id} obj={obj} />;
            default:
              return null;
          }
        })}
    </>
  );
}
