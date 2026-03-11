import { useMemo } from "react";
import * as THREE from "three";
import type { LandscapeObject } from "../../types/landscape";
import { createGrassTexture } from "../../utils/proceduralTextures";

interface Props {
  obj: LandscapeObject;
}

export function Lawn3D({ obj }: Props) {
  const grassMaps = useMemo(() => createGrassTexture(), []);

  const geometry = useMemo(() => {
    if (obj.points.length < 3) return null;
    const shape = new THREE.Shape();
    shape.moveTo(obj.points[0][0], -obj.points[0][1]);
    for (let i = 1; i < obj.points.length; i++) {
      shape.lineTo(obj.points[i][0], -obj.points[i][1]);
    }
    shape.closePath();
    const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: false });
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, [obj.points]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} position={[obj.position.x, 0, obj.position.y]} receiveShadow>
      <meshStandardMaterial
        map={grassMaps.map}
        normalMap={grassMaps.normalMap}
        normalScale={new THREE.Vector2(0.5, 0.5)}
        roughnessMap={grassMaps.roughnessMap}
        roughness={0.85}
        color={obj.style.fill ?? "#4CAF50"}
      />
    </mesh>
  );
}
