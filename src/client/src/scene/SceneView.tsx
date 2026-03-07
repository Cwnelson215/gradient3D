import { Canvas } from "@react-three/fiber";
import { Terrain } from "../terrain/Terrain";
import { Sky } from "../environment/Sky";
import { Water } from "../environment/Water";
import { Lights } from "../environment/Lights";
import { CameraController } from "../camera/CameraController";
import { LandscapeObjects3D } from "./LandscapeObjects3D";

export function SceneView() {
  return (
    <Canvas
      camera={{ position: [30, 40, 30], fov: 60, near: 0.1, far: 1000 }}
      shadows
      style={{ width: "100%", height: "100%" }}
    >
      <CameraController />
      <Sky />
      <Lights />
      <Terrain />
      <Water />
      <LandscapeObjects3D />
    </Canvas>
  );
}
