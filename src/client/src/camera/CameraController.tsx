import { useLandscapeStore } from "../store/landscapeStore";
import { OrbitMode } from "./OrbitMode";
import { FirstPersonMode } from "./FirstPersonMode";
import { TopDownMode } from "./TopDownMode";

export function CameraController() {
  const mode = useLandscapeStore((s) => s.cameraMode);

  switch (mode) {
    case "orbit":
      return <OrbitMode />;
    case "firstPerson":
      return <FirstPersonMode />;
    case "topDown":
      return <TopDownMode />;
  }
}
