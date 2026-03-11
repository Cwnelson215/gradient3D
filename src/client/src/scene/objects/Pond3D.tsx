import { useMemo } from "react";
import * as THREE from "three";
import type { LandscapeObject } from "../../types/landscape";
import { createWaterNormalMap, createStoneTexture } from "../../utils/proceduralTextures";

interface Props {
  obj: LandscapeObject;
}

export function Pond3D({ obj }: Props) {
  const depth = (obj.properties.depth as number) ?? 3;

  const waterNormal = useMemo(() => createWaterNormalMap(), []);
  const stoneMaps = useMemo(() => createStoneTexture("concrete"), []);

  const shape = useMemo(() => {
    if (obj.points.length < 3) return null;
    const s = new THREE.Shape();
    s.moveTo(obj.points[0][0], -obj.points[0][1]);
    for (let i = 1; i < obj.points.length; i++) {
      s.lineTo(obj.points[i][0], -obj.points[i][1]);
    }
    s.closePath();
    return s;
  }, [obj.points]);

  // Walls extruded downward into the ground
  const wallGeometry = useMemo(() => {
    if (!shape) return null;
    const geom = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    geom.rotateX(-Math.PI / 2);
    geom.translate(0, -depth, 0);
    return geom;
  }, [shape, depth]);

  // Water surface at ground level
  const waterGeometry = useMemo(() => {
    if (!shape) return null;
    const geom = new THREE.ShapeGeometry(shape);
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, [shape]);

  // Floor at the bottom
  const floorGeometry = useMemo(() => {
    if (!shape) return null;
    const geom = new THREE.ShapeGeometry(shape);
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, [shape]);

  if (!wallGeometry || !waterGeometry) return null;

  const posX = obj.position.x;
  const posZ = obj.position.y;

  return (
    <group>
      {/* Pond walls going into the ground */}
      <mesh geometry={wallGeometry} position={[posX, 0, posZ]}>
        <meshStandardMaterial
          map={stoneMaps.map}
          normalMap={stoneMaps.normalMap}
          normalScale={new THREE.Vector2(0.2, 0.2)}
          roughness={0.8}
          color="#6b5b3e"
          side={THREE.BackSide}
        />
      </mesh>

      {/* Pond floor */}
      {floorGeometry && (
        <mesh geometry={floorGeometry} position={[posX, -depth + 0.01, posZ]}>
          <meshStandardMaterial
            color="#4a3f2e"
            roughness={0.9}
          />
        </mesh>
      )}

      {/* Water surface slightly below ground */}
      <mesh geometry={waterGeometry} position={[posX, -0.3, posZ]}>
        <meshPhysicalMaterial
          color={obj.style.fill ?? "#2E7D32"}
          transparent
          opacity={0.75}
          transmission={0.4}
          ior={1.33}
          thickness={depth - 0.3}
          roughness={0.15}
          metalness={0.2}
          normalMap={waterNormal}
          normalScale={new THREE.Vector2(0.4, 0.4)}
          envMapIntensity={0.8}
        />
      </mesh>
    </group>
  );
}
