import { useMemo } from "react";
import * as THREE from "three";
import type { LandscapeObject } from "../../types/landscape";

interface Props {
  obj: LandscapeObject;
}

const WALL_HEIGHT = 10;

export function House3D({ obj }: Props) {
  const geometry = useMemo(() => {
    if (obj.points.length < 3) return null;

    const shape = new THREE.Shape();
    // Negate Y so that after rotateX(-PI/2), shape Y maps to +Z (matching 2D coords)
    shape.moveTo(obj.points[0][0], -obj.points[0][1]);
    for (let i = 1; i < obj.points.length; i++) {
      shape.lineTo(obj.points[i][0], -obj.points[i][1]);
    }
    shape.closePath();

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: WALL_HEIGHT,
      bevelEnabled: false,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Rotate from XY extrude to XZ (walls going up)
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, [obj.points]);

  if (!geometry) return null;

  return (
    <mesh
      geometry={geometry}
      position={[obj.position.x, 0, obj.position.y]}
    >
      <meshStandardMaterial
        color={obj.style.fill ?? "#8B7355"}
        opacity={obj.style.opacity ?? 0.8}
        transparent
      />
    </mesh>
  );
}
