import { useMemo } from "react";
import * as THREE from "three";
import { useLandscapeStore } from "../store/landscapeStore";

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
    // Offset so grid aligns with property origin
    helper.position.set(widthFt / 2, 0.01, depthFt / 2);
    return helper;
  }, [widthFt, depthFt, gridSpacingFt]);

  return (
    <group>
      {/* Ground plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[widthFt / 2, 0, depthFt / 2]}
        receiveShadow
      >
        <planeGeometry args={[widthFt, depthFt]} />
        <meshStandardMaterial color="#4a7c3f" roughness={0.9} />
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
