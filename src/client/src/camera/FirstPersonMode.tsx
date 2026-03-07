import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import { useTerrainStore } from "../store/terrainStore";
import { sampleHeight } from "../terrain/utils";

const SPEED = 20;
const EYE_HEIGHT = 3;

export function FirstPersonMode() {
  const { camera } = useThree();
  const keys = useRef<Set<string>>(new Set());
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    // Start at the edge of the terrain, looking inward, at proper ground height
    const { heightmap, params } = useTerrainStore.getState();
    const startX = params.worldWidth * 0.4;
    const startZ = params.worldHeight * 0.4;
    const h = sampleHeight(heightmap, startX, startZ, params);
    camera.position.set(startX, h + EYE_HEIGHT, startZ);
    camera.lookAt(0, h + EYE_HEIGHT, 0);

    const onKeyDown = (e: KeyboardEvent) => keys.current.add(e.code);
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.code);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      keys.current.clear();
    };
  }, [camera]);

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

    const { heightmap, params } = useTerrainStore.getState();
    const h = sampleHeight(heightmap, camera.position.x, camera.position.z, params);
    camera.position.y = h + EYE_HEIGHT;
  });

  return <PointerLockControls ref={controlsRef} makeDefault />;
}
