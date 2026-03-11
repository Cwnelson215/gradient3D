import { useMemo } from "react";
import * as THREE from "three";
import { useLandscapeStore } from "../store/landscapeStore";
import { createGrassTexture } from "../utils/proceduralTextures";

export function GroundPlane() {
  const property = useLandscapeStore((s) => s.project?.property);
  const objects = useLandscapeStore((s) => s.project?.objects ?? []);
  const widthFt = property?.widthFt ?? 100;
  const depthFt = property?.depthFt ?? 100;
  const gridSpacingFt = property?.gridSpacingFt ?? 10;

  // Collect water feature shapes for cutouts
  const waterObjects = useMemo(
    () => objects.filter((o) => o.visible && (o.type === "pool" || o.type === "pond") && o.points.length >= 3),
    [objects],
  );

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
    // Create ground as a Shape so we can punch holes for water features.
    // After rotateX(-PI/2), shapeY becomes -Z. So to get Z from 0..depthFt,
    // we need shapeY from 0..-depthFt.
    const groundShape = new THREE.Shape();
    groundShape.moveTo(0, 0);
    groundShape.lineTo(widthFt, 0);
    groundShape.lineTo(widthFt, -depthFt);
    groundShape.lineTo(0, -depthFt);
    groundShape.closePath();

    // Punch holes for each water feature.
    // In the 3D components, pool/pond shapes use:
    //   shapeX = obj.points[i][0], shapeY = -obj.points[i][1]
    //   then rotateX(-PI/2), so world X = shapeX + pos.x, world Z = shapeY + pos.y... wait no.
    //   After rotateX(-PI/2): worldX = shapeX, worldZ = -shapeY = obj.points[i][1]
    //   Then mesh position adds: worldX += pos.x, worldZ += pos.y
    //   So final: worldX = obj.points[i][0] + pos.x, worldZ = obj.points[i][1] + pos.y
    //
    // For our ground shape (also rotateX(-PI/2)):
    //   worldX = groundShapeX, worldZ = -groundShapeY
    //   So groundShapeX = worldX, groundShapeY = -worldZ
    for (const obj of waterObjects) {
      const hole = new THREE.Path();
      const wx0 = obj.points[0][0] + obj.position.x;
      const wz0 = obj.points[0][1] + obj.position.y;
      hole.moveTo(wx0, -wz0);
      for (let i = 1; i < obj.points.length; i++) {
        const wx = obj.points[i][0] + obj.position.x;
        const wz = obj.points[i][1] + obj.position.y;
        hole.lineTo(wx, -wz);
      }
      hole.closePath();
      groundShape.holes.push(hole);
    }

    const geom = new THREE.ShapeGeometry(groundShape, 12);
    geom.rotateX(-Math.PI / 2);

    // Add subtle vertex displacement for natural ground undulation
    const pos = geom.attributes.position;
    let seed = 1234;
    for (let i = 0; i < pos.count; i++) {
      seed = (seed * 16807) % 2147483647;
      const displacement = ((seed / 2147483647) - 0.5) * 0.1;
      const y = pos.getY(i);
      (pos as THREE.BufferAttribute).setY(i, y + displacement);
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();

    // Recompute UVs: map world X/Z to 0..1
    const uv = geom.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      (uv as THREE.BufferAttribute).setXY(i, x / widthFt, z / depthFt);
    }
    uv.needsUpdate = true;

    return geom;
  }, [widthFt, depthFt, waterObjects]);

  return (
    <group>
      {/* Ground plane with grass texture and cutouts for water features */}
      <mesh
        position={[0, 0, 0]}
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
      <lineSegments position={[widthFt / 2, 0.01, depthFt / 2]} rotation={[-Math.PI / 2, 0, 0]}>
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
