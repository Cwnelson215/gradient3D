import { useMemo } from "react";
import * as THREE from "three";
import type { LandscapeObject } from "../../types/landscape";
import { createSoilTexture } from "../../utils/proceduralTextures";

interface Props {
  obj: LandscapeObject;
}

export function Garden3D({ obj }: Props) {
  const soilMaps = useMemo(() => createSoilTexture(), []);

  const geometry = useMemo(() => {
    if (obj.points.length < 3) return null;
    const shape = new THREE.Shape();
    shape.moveTo(obj.points[0][0], -obj.points[0][1]);
    for (let i = 1; i < obj.points.length; i++) {
      shape.lineTo(obj.points[i][0], -obj.points[i][1]);
    }
    shape.closePath();
    const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.15, bevelEnabled: false });
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, [obj.points]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} position={[obj.position.x, 0, obj.position.y]} receiveShadow castShadow>
      <meshStandardMaterial
        map={soilMaps.map}
        normalMap={soilMaps.normalMap}
        normalScale={new THREE.Vector2(0.6, 0.6)}
        roughness={0.95}
        color={obj.style.fill ?? "#8B6914"}
      />
    </mesh>
  );
}
