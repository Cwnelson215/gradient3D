import { useMemo } from "react";
import * as THREE from "three";
import type { LandscapeObject } from "../../types/landscape";

interface Props {
  obj: LandscapeObject;
}

const TUBE_RADIUS = 0.15;

export function Irrigation3D({ obj }: Props) {
  const tubeGeometry = useMemo(() => {
    if (obj.points.length < 2) return null;
    const pts = obj.points.map(
      (p) => new THREE.Vector3(p[0] + obj.position.x, 0.1, p[1] + obj.position.y)
    );
    const curve = new THREE.CatmullRomCurve3(pts, false);
    return new THREE.TubeGeometry(curve, obj.points.length * 8, TUBE_RADIUS, 6, false);
  }, [obj.points, obj.position.x, obj.position.y]);

  if (!tubeGeometry) return null;

  return (
    <mesh geometry={tubeGeometry} castShadow>
      <meshStandardMaterial
        color={obj.style.stroke ?? "#2196F3"}
        roughness={0.4}
        metalness={0.05}
        envMapIntensity={0.5}
      />
    </mesh>
  );
}
