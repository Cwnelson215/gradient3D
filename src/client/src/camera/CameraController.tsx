import { useTerrainStore } from "../store/terrainStore";
import { OrbitMode } from "./OrbitMode";
import { FirstPersonMode } from "./FirstPersonMode";
import { TopDownMode } from "./TopDownMode";

export function CameraController() {
  const mode = useTerrainStore((s) => s.mode);

  switch (mode) {
    case "orbit":
      return <OrbitMode />;
    case "firstPerson":
      return <FirstPersonMode />;
    case "topDown":
      return <TopDownMode />;
  }
}
