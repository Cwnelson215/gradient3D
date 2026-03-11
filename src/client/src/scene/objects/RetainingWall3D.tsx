import { useMemo } from "react";
import * as THREE from "three";
import type { LandscapeObject } from "../../types/landscape";
import { createStoneTexture } from "../../utils/proceduralTextures";

interface Props {
  obj: LandscapeObject;
}

export function RetainingWall3D({ obj }: Props) {
  const height = (obj.properties.height as number) ?? 3;
  const width = (obj.properties.width as number) ?? 1;

  const stoneMaps = useMemo(() => createStoneTexture("gravel"), []);

  const meshes = useMemo(() => {
    const segments: JSX.Element[] = [];
    for (let i = 0; i < obj.points.length - 1; i++) {
      const p1 = obj.points[i];
      const p2 = obj.points[i + 1];
      const dx = p2[0] - p1[0];
      const dy = p2[1] - p1[1];
      const len = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const cx = (p1[0] + p2[0]) / 2 + obj.position.x;
      const cz = (p1[1] + p2[1]) / 2 + obj.position.y;

      // Main wall body
      segments.push(
        <mesh
          key={`wall-${i}`}
          position={[cx, height / 2, cz]}
          rotation={[0, -angle, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[len, height, width]} />
          <meshStandardMaterial
            map={stoneMaps.map}
            normalMap={stoneMaps.normalMap}
            normalScale={new THREE.Vector2(0.6, 0.6)}
            roughness={0.8}
            color={obj.style.stroke ?? "#777"}
          />
        </mesh>
      );

      // Cap piece on top (wider)
      segments.push(
        <mesh
          key={`cap-${i}`}
          position={[cx, height + 0.1, cz]}
          rotation={[0, -angle, 0]}
          castShadow
        >
          <boxGeometry args={[len + 0.2, 0.2, width + 0.4]} />
          <meshStandardMaterial
            map={stoneMaps.map}
            normalMap={stoneMaps.normalMap}
            normalScale={new THREE.Vector2(0.4, 0.4)}
            roughness={0.7}
            color="#999"
          />
        </mesh>
      );
    }
    return segments;
  }, [obj.points, obj.position.x, obj.position.y, height, width, obj.style.stroke, stoneMaps]);

  return <group>{meshes}</group>;
}
