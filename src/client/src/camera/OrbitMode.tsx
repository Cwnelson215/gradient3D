import { OrbitControls } from "@react-three/drei";
import { useLandscapeStore } from "../store/landscapeStore";

export function OrbitMode() {
  const property = useLandscapeStore((s) => s.project?.property);
  const widthFt = property?.widthFt ?? 100;
  const depthFt = property?.depthFt ?? 100;
  const maxDim = Math.max(widthFt, depthFt);

  return (
    <OrbitControls
      makeDefault
      target={[widthFt / 2, 0, depthFt / 2]}
      maxPolarAngle={Math.PI / 2.1}
      minDistance={5}
      maxDistance={maxDim * 2}
    />
  );
}
