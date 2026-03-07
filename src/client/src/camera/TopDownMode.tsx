import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

export function TopDownMode() {
  const { camera, set } = useThree();

  useEffect(() => {
    const ortho = new THREE.OrthographicCamera(-60, 60, 60, -60, 0.1, 500);
    ortho.position.set(0, 100, 0);
    ortho.lookAt(0, 0, 0);
    ortho.zoom = 1;
    ortho.updateProjectionMatrix();
    set({ camera: ortho });

    return () => {
      const persp = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      persp.position.set(30, 40, 30);
      set({ camera: persp });
    };
  }, [set]);

  return (
    <OrbitControls
      makeDefault
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
