import { useMemo } from "react";
import * as THREE from "three";
import { useLandscapeStore } from "../store/landscapeStore";
import { createGrassTexture } from "../utils/proceduralTextures";

export function GroundPlane() {
  const property = useLandscapeStore((s) => s.project?.property);
  const widthFt = property?.widthFt ?? 100;
  const depthFt = property?.depthFt ?? 100;
  const gridSpacingFt = property?.gridSpacingFt ?? 10;

  const gridHelper = useMemo(() => {
    const divisionsX = Math.round(widthFt / gridSpacingFt);
    const divisionsZ = Math.round(depthFt / gridSpacingFt);
    const divisions = Math.max(divisionsX, divisionsZ);
    const size = Math.max(widthFt, depthFt);
    const helper = new THREE.GridHelper(size, divisions, "#555555", "#333333");
    helper.position.set(widthFt / 2, 0.01, depthFt / 2);
    return helper;
  }, [widthFt, depthFt, gridSpacingFt]);

  const grassMaps = useMemo(() => createGrassTexture(), []);

  const geometry = useMemo(() => {
    const segsX = Math.ceil(widthFt / 2);
    const segsZ = Math.ceil(depthFt / 2);
    const geom = new THREE.PlaneGeometry(widthFt, depthFt, segsX, segsZ);
    // Subtle vertex displacement for natural ground undulation
    const pos = geom.attributes.position;
    let seed = 1234;
    for (let i = 0; i < pos.count; i++) {
      seed = (seed * 16807) % 2147483647;
      const displacement = ((seed / 2147483647) - 0.5) * 0.1;
      (pos as THREE.BufferAttribute).setZ(i, pos.getZ(i) + displacement);
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();
    return geom;
  }, [widthFt, depthFt]);

  return (
    <group>
      {/* Ground plane with grass texture */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[widthFt / 2, 0, depthFt / 2]}
        receiveShadow
        geometry={geometry}
      >
        <meshStandardMaterial
          map={grassMaps.map}
          normalMap={grassMaps.normalMap}
          normalScale={new THREE.Vector2(0.5, 0.5)}
          roughnessMap={grassMaps.roughnessMap}
          roughness={0.85}
        />
      </mesh>

      {/* Grid overlay */}
      <primitive object={gridHelper} />

      {/* Property boundary outline */}
      <lineSegments>
        <edgesGeometry
          args={[
            new THREE.PlaneGeometry(widthFt, depthFt),
          ]}
        />
        <lineBasicMaterial color="#888888" />
      </lineSegments>
    </group>
  );
}
