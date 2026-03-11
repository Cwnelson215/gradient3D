import { useMemo } from "react";
import * as THREE from "three";
import type { LandscapeObject } from "../../types/landscape";
import { createWaterNormalMap } from "../../utils/proceduralTextures";

interface Props {
  obj: LandscapeObject;
}

export function Pond3D({ obj }: Props) {
  const waterNormal = useMemo(() => createWaterNormalMap(), []);

  const geometry = useMemo(() => {
    if (obj.points.length < 3) return null;
    const shape = new THREE.Shape();
    shape.moveTo(obj.points[0][0], -obj.points[0][1]);
    for (let i = 1; i < obj.points.length; i++) {
      shape.lineTo(obj.points[i][0], -obj.points[i][1]);
    }
    shape.closePath();
    const geom = new THREE.ShapeGeometry(shape);
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, [obj.points]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} position={[obj.position.x, -0.5, obj.position.y]}>
      <meshPhysicalMaterial
        color={obj.style.fill ?? "#2E7D32"}
        transparent
        opacity={0.75}
        transmission={0.4}
        ior={1.33}
        thickness={3}
        roughness={0.15}
        metalness={0.2}
        normalMap={waterNormal}
        normalScale={new THREE.Vector2(0.4, 0.4)}
        envMapIntensity={0.8}
      />
    </mesh>
  );
}
