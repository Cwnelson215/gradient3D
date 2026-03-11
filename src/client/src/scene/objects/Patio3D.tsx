import { useMemo } from "react";
import * as THREE from "three";
import type { LandscapeObject } from "../../types/landscape";
import { createStoneTexture } from "../../utils/proceduralTextures";

interface Props {
  obj: LandscapeObject;
}

export function Patio3D({ obj }: Props) {
  const stoneMaps = useMemo(() => createStoneTexture("flagstone"), []);

  const geometry = useMemo(() => {
    if (obj.points.length < 3) return null;
    const shape = new THREE.Shape();
    shape.moveTo(obj.points[0][0], -obj.points[0][1]);
    for (let i = 1; i < obj.points.length; i++) {
      shape.lineTo(obj.points[i][0], -obj.points[i][1]);
    }
    shape.closePath();
    const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: false });
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, [obj.points]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} position={[obj.position.x, 0, obj.position.y]} receiveShadow castShadow>
      <meshStandardMaterial
        map={stoneMaps.map}
        normalMap={stoneMaps.normalMap}
        normalScale={new THREE.Vector2(0.5, 0.5)}
        roughness={0.6}
        color={obj.style.fill ?? "#c4a882"}
      />
    </mesh>
  );
}
