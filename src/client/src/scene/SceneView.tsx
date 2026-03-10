import { Canvas } from "@react-three/fiber";
import { GroundPlane } from "../terrain/GroundPlane";
import { Sky } from "../environment/Sky";
import { Lights } from "../environment/Lights";
import { CameraController } from "../camera/CameraController";
import { LandscapeObjects3D } from "./LandscapeObjects3D";
import { useLandscapeStore } from "../store/landscapeStore";

export function SceneView() {
  const property = useLandscapeStore((s) => s.project?.property);
  const widthFt = property?.widthFt ?? 100;
  const depthFt = property?.depthFt ?? 100;
  const maxDim = Math.max(widthFt, depthFt);

  return (
    <Canvas
      camera={{
        position: [widthFt / 2 + maxDim * 0.4, maxDim * 0.5, depthFt / 2 + maxDim * 0.4],
        fov: 60,
        near: 0.1,
        far: 2000,
      }}
      shadows
      style={{ width: "100%", height: "100%" }}
    >
      <CameraController />
      <Sky />
      <Lights />
      <GroundPlane />
      <LandscapeObjects3D />
    </Canvas>
  );
}
