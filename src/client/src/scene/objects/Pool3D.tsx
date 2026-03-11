import { useMemo } from "react";
import * as THREE from "three";
import type { LandscapeObject } from "../../types/landscape";
import { createStoneTexture, createWaterNormalMap } from "../../utils/proceduralTextures";

interface Props {
  obj: LandscapeObject;
}

export function Pool3D({ obj }: Props) {
  const depth = (obj.properties.depth as number) ?? 6;

  const stoneMaps = useMemo(() => createStoneTexture("concrete"), []);
  const waterNormal = useMemo(() => createWaterNormalMap(), []);

  const wallGeometry = useMemo(() => {
    if (obj.points.length < 3) return null;
    const shape = new THREE.Shape();
    shape.moveTo(obj.points[0][0], -obj.points[0][1]);
    for (let i = 1; i < obj.points.length; i++) {
      shape.lineTo(obj.points[i][0], -obj.points[i][1]);
    }
    shape.closePath();
    const geom = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, [obj.points, depth]);

  const waterGeometry = useMemo(() => {
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

  if (!wallGeometry || !waterGeometry) return null;

  return (
    <group>
      <mesh geometry={wallGeometry} position={[obj.position.x, -depth, obj.position.y]}>
        <meshStandardMaterial
          map={stoneMaps.map}
          normalMap={stoneMaps.normalMap}
          normalScale={new THREE.Vector2(0.3, 0.3)}
          roughness={0.6}
          color="#e0e0e0"
          side={THREE.BackSide}
        />
      </mesh>
      <mesh geometry={waterGeometry} position={[obj.position.x, -0.1, obj.position.y]}>
        <meshPhysicalMaterial
          color={obj.style.fill ?? "#42A5F5"}
          transparent
          opacity={0.8}
          transmission={0.6}
          ior={1.33}
          thickness={depth}
          roughness={0.05}
          metalness={0.1}
          normalMap={waterNormal}
          normalScale={new THREE.Vector2(0.3, 0.3)}
          envMapIntensity={1.0}
        />
      </mesh>
    </group>
  );
}
