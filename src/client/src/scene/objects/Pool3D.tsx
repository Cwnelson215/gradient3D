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
    // Shift geometry down so walls go from y=0 to y=-depth
    geom.translate(0, -depth, 0);
    return geom;
  }, [shape, depth]);

  // Water surface sits slightly below ground level
  const waterGeometry = useMemo(() => {
    if (!shape) return null;
    const geom = new THREE.ShapeGeometry(shape);
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, [shape]);

  // Coping rim: a thin border at ground level
  const copingGeometry = useMemo(() => {
    if (!shape) return null;
    const copingWidth = 0.8;
    // Create outer shape by offsetting outward
    const points = obj.points;
    if (points.length < 3) return null;

    // Compute centroid for offset direction
    let cx = 0, cy = 0;
    for (const [px, py] of points) {
      cx += px;
      cy += py;
    }
    cx /= points.length;
    cy /= points.length;

    // Create outer ring by pushing each point outward from centroid
    const outerPoints: [number, number][] = points.map(([px, py]) => {
      const dx = px - cx;
      const dy = py - cy;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len === 0) return [px, py] as [number, number];
      return [
        px + (dx / len) * copingWidth,
        py + (dy / len) * copingWidth,
      ] as [number, number];
    });

    const outerShape = new THREE.Shape();
    outerShape.moveTo(outerPoints[0][0], -outerPoints[0][1]);
    for (let i = 1; i < outerPoints.length; i++) {
      outerShape.lineTo(outerPoints[i][0], -outerPoints[i][1]);
    }
    outerShape.closePath();

    // Inner hole (the pool opening)
    const hole = new THREE.Path();
    hole.moveTo(points[0][0], -points[0][1]);
    for (let i = 1; i < points.length; i++) {
      hole.lineTo(points[i][0], -points[i][1]);
    }
    hole.closePath();
    outerShape.holes.push(hole);

    const geom = new THREE.ExtrudeGeometry(outerShape, { depth: 0.4, bevelEnabled: false });
    geom.rotateX(-Math.PI / 2);
    geom.translate(0, -0.2, 0);
    return geom;
  }, [obj.points]);

  // Floor at the bottom of the pool
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
      {/* Pool walls going into the ground */}
      <mesh geometry={wallGeometry} position={[posX, 0, posZ]}>
        <meshStandardMaterial
          map={stoneMaps.map}
          normalMap={stoneMaps.normalMap}
          normalScale={new THREE.Vector2(0.3, 0.3)}
          roughness={0.6}
          color="#d0d0d0"
          side={THREE.BackSide}
        />
      </mesh>

      {/* Pool floor */}
      {floorGeometry && (
        <mesh geometry={floorGeometry} position={[posX, -depth + 0.01, posZ]}>
          <meshStandardMaterial
            map={stoneMaps.map}
            normalMap={stoneMaps.normalMap}
            normalScale={new THREE.Vector2(0.2, 0.2)}
            roughness={0.7}
            color="#c8d8e0"
          />
        </mesh>
      )}

      {/* Coping rim at ground level */}
      {copingGeometry && (
        <mesh geometry={copingGeometry} position={[posX, 0, posZ]}>
          <meshStandardMaterial
            map={stoneMaps.map}
            normalMap={stoneMaps.normalMap}
            normalScale={new THREE.Vector2(0.3, 0.3)}
            roughness={0.5}
            color="#e8e0d8"
          />
        </mesh>
      )}

      {/* Water surface slightly below ground */}
      <mesh geometry={waterGeometry} position={[posX, -0.5, posZ]}>
        <meshPhysicalMaterial
          color={obj.style.fill ?? "#42A5F5"}
          transparent
          opacity={0.8}
          transmission={0.6}
          ior={1.33}
          thickness={depth - 0.5}
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
