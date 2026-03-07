import { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import type { LandscapeObject } from "../../types/landscape";

interface Props {
  obj: LandscapeObject;
}

const POST_HEIGHT = 4;
const POST_RADIUS = 0.15;

export function Boundary3D({ obj }: Props) {
  const postGeometry = useMemo(
    () => new THREE.CylinderGeometry(POST_RADIUS, POST_RADIUS, POST_HEIGHT, 8),
    []
  );

  const linePoints = useMemo(() => {
    const pts: [number, number, number][] = obj.points.map((p) => [
      p[0] + obj.position.x,
      POST_HEIGHT / 2,
      p[1] + obj.position.y,
    ]);
    if (pts.length > 0) pts.push([...pts[0]]);
    return pts;
  }, [obj.points, obj.position.x, obj.position.y]);

  return (
    <group>
      {obj.points.map((p, i) => (
        <mesh
          key={i}
          geometry={postGeometry}
          position={[p[0] + obj.position.x, POST_HEIGHT / 2, p[1] + obj.position.y]}
        >
          <meshStandardMaterial color="#8B6914" />
        </mesh>
      ))}
      {linePoints.length >= 2 && (
        <Line
          points={linePoints}
          color={obj.style.stroke ?? "#ffcc00"}
          lineWidth={2}
        />
      )}
    </group>
  );
}
