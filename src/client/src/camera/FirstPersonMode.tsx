import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import { useLandscapeStore } from "../store/landscapeStore";

const SPEED = 20;
const EYE_HEIGHT = 5.5;

export function FirstPersonMode() {
  const { camera } = useThree();
  const keys = useRef<Set<string>>(new Set());
  const controlsRef = useRef<any>(null);

  const property = useLandscapeStore((s) => s.project?.property);
  const widthFt = property?.widthFt ?? 100;
  const depthFt = property?.depthFt ?? 100;

  useEffect(() => {
    // Start near the center of the property
    camera.position.set(widthFt / 2, EYE_HEIGHT, depthFt * 0.7);
    camera.lookAt(widthFt / 2, EYE_HEIGHT, depthFt / 2);

    const onKeyDown = (e: KeyboardEvent) => keys.current.add(e.code);
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.code);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      keys.current.clear();
    };
  }, [camera, widthFt, depthFt]);

  useFrame((_, delta) => {
    const dir = new THREE.Vector3();
    const right = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();
    right.crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();

    const move = new THREE.Vector3();
    if (keys.current.has("KeyW")) move.add(dir);
    if (keys.current.has("KeyS")) move.sub(dir);
    if (keys.current.has("KeyD")) move.add(right);
    if (keys.current.has("KeyA")) move.sub(right);

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(SPEED * delta);
      camera.position.add(move);
    }

    // Clamp to property bounds and fix height
    camera.position.x = Math.max(0, Math.min(widthFt, camera.position.x));
    camera.position.z = Math.max(0, Math.min(depthFt, camera.position.z));
    camera.position.y = EYE_HEIGHT;
  });

  return <PointerLockControls ref={controlsRef} makeDefault />;
}
