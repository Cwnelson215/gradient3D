import { useMemo } from "react";
import * as THREE from "three";
import type { LandscapeObject } from "../../types/landscape";
import { createBrickTexture } from "../../utils/proceduralTextures";

interface Props {
  obj: LandscapeObject;
}

const WALL_HEIGHT = 10;

export function House3D({ obj }: Props) {
  const brickMaps = useMemo(() => createBrickTexture(obj.style.fill ?? "#8B7355"), [obj.style.fill]);

  const geometry = useMemo(() => {
    if (obj.points.length < 3) return null;

    const shape = new THREE.Shape();
    shape.moveTo(obj.points[0][0], -obj.points[0][1]);
    for (let i = 1; i < obj.points.length; i++) {
      shape.lineTo(obj.points[i][0], -obj.points[i][1]);
    }
    shape.closePath();

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: WALL_HEIGHT,
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0.1,
      bevelSegments: 1,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, [obj.points]);

  // Gable roof geometry
  const roofGeometry = useMemo(() => {
    if (obj.points.length < 3) return null;

    // Compute bounding box of points
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const p of obj.points) {
      minX = Math.min(minX, p[0]);
      maxX = Math.max(maxX, p[0]);
      minZ = Math.min(minZ, p[1]);
      maxZ = Math.max(maxZ, p[1]);
    }
    const w = maxX - minX;
    const d = maxZ - minZ;
    const overhang = 1.5;
    const roofHeight = Math.min(w, d) * 0.3;

    // Simple gable roof shape (triangle cross-section extruded along length)
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-d / 2 - overhang, 0);
    roofShape.lineTo(0, roofHeight);
    roofShape.lineTo(d / 2 + overhang, 0);
    roofShape.closePath();

    const geom = new THREE.ExtrudeGeometry(roofShape, {
      depth: w + overhang * 2,
      bevelEnabled: false,
    });
    geom.translate(0, 0, -w / 2 - overhang);
    geom.rotateY(-Math.PI / 2);

    return { geom, cx: (minX + maxX) / 2, cz: (minZ + maxZ) / 2 };
  }, [obj.points]);

  if (!geometry) return null;

  return (
    <group>
      {/* Walls */}
      <mesh
        geometry={geometry}
        position={[obj.position.x, 0, obj.position.y]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={brickMaps.map}
          normalMap={brickMaps.normalMap}
          normalScale={new THREE.Vector2(0.5, 0.5)}
          roughness={0.7}
          color={obj.style.fill ?? "#8B7355"}
        />
      </mesh>
      {/* Roof */}
      {roofGeometry && (
        <mesh
          geometry={roofGeometry.geom}
          position={[
            roofGeometry.cx + obj.position.x,
            WALL_HEIGHT,
            roofGeometry.cz + obj.position.y,
          ]}
          castShadow
        >
          <meshStandardMaterial color="#5a3a2a" roughness={0.8} />
        </mesh>
      )}
    </group>
  );
}
