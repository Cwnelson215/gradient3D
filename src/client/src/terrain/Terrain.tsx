import { useRef, useMemo, useEffect, useCallback } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useTerrainStore } from "../store/terrainStore";
import { createTerrainMaterial } from "./terrainMaterial";
import { gridToWorld } from "./utils";

export function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null);
  const isDragging = useRef(false);
  const material = useMemo(() => createTerrainMaterial(), []);

  const heightmap = useTerrainStore((s) => s.heightmap);
  const params = useTerrainStore((s) => s.params);
  const mode = useTerrainStore((s) => s.mode);
  const applyBrush = useTerrainStore((s) => s.applyBrush);

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(
      params.worldWidth,
      params.worldHeight,
      params.widthSegments,
      params.heightSegments
    );
  }, [params.worldWidth, params.worldHeight, params.widthSegments, params.heightSegments]);

  useEffect(() => {
    geometry.rotateX(-Math.PI / 2);
    // Flag position attribute for update
    geometry.attributes.position.needsUpdate = true;
  }, [geometry]);

  useFrame(() => {
    if (!meshRef.current) return;
    const geo = meshRef.current.geometry;
    const position = geo.attributes.position;
    const cols = params.widthSegments + 1;

    for (let i = 0; i < position.count; i++) {
      const gz = Math.floor(i / cols);
      const gx = i % cols;
      const [, ] = gridToWorld(gx, gz, params);
      position.setY(i, heightmap[gz * cols + gx]);
    }

    position.needsUpdate = true;
    geo.computeVertexNormals();
  });

  const handlePointer = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (mode !== "orbit") return;
      e.stopPropagation();
      const point = e.point;
      applyBrush(point.x, point.z);
    },
    [mode, applyBrush]
  );

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      onPointerDown={(e) => {
        if (mode !== "orbit") return;
        isDragging.current = true;
        handlePointer(e);
      }}
      onPointerMove={(e) => {
        if (!isDragging.current) return;
        handlePointer(e);
      }}
      onPointerUp={() => {
        isDragging.current = false;
      }}
      onPointerLeave={() => {
        isDragging.current = false;
      }}
    />
  );
}
