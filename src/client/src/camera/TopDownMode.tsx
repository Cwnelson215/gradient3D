import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useLandscapeStore } from "../store/landscapeStore";

export function TopDownMode() {
  const { set } = useThree();
  const property = useLandscapeStore((s) => s.project?.property);
  const widthFt = property?.widthFt ?? 100;
  const depthFt = property?.depthFt ?? 100;

  // Add 10% padding
  const halfW = (widthFt * 1.1) / 2;
  const halfD = (depthFt * 1.1) / 2;
  const maxHalf = Math.max(halfW, halfD);

  useEffect(() => {
    const ortho = new THREE.OrthographicCamera(
      -maxHalf, maxHalf, maxHalf, -maxHalf, 0.1, 500
    );
    ortho.position.set(widthFt / 2, 100, depthFt / 2);
    ortho.lookAt(widthFt / 2, 0, depthFt / 2);
    ortho.zoom = 1;
    ortho.updateProjectionMatrix();
    set({ camera: ortho });

    return () => {
      const persp = new THREE.PerspectiveCamera(
        60, window.innerWidth / window.innerHeight, 0.1, 2000
      );
      persp.position.set(widthFt / 2 + 40, 50, depthFt / 2 + 40);
      set({ camera: persp });
    };
  }, [set, widthFt, depthFt, maxHalf]);

  return (
    <OrbitControls
      makeDefault
      target={[widthFt / 2, 0, depthFt / 2]}
      enableRotate={false}
      minZoom={0.3}
      maxZoom={5}
      mouseButtons={{
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
    />
  );
}
