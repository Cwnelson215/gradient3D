import { OrbitControls } from "@react-three/drei";

export function OrbitMode() {
  return (
    <OrbitControls
      makeDefault
      maxPolarAngle={Math.PI / 2.1}
      minDistance={10}
      maxDistance={150}
    />
  );
}
