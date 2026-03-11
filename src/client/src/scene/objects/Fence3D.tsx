import { useMemo } from "react";
import * as THREE from "three";
import type { LandscapeObject } from "../../types/landscape";
import { createWoodTexture } from "../../utils/proceduralTextures";

interface Props {
  obj: LandscapeObject;
}

export function Fence3D({ obj }: Props) {
  const height = (obj.properties.height as number) ?? 6;
  const postSize = 0.3;
  const boardThickness = 0.15;
  const boardWidth = 0.5;
  const boardSpacing = 0.15;

  const woodMaps = useMemo(() => createWoodTexture(), []);

  const postGeometry = useMemo(
    () => new THREE.BoxGeometry(postSize, height, postSize),
    [height]
  );

  // Build rail and picket geometry between each pair of points
  const segments = useMemo(() => {
    const result: JSX.Element[] = [];

    for (let i = 0; i < obj.points.length - 1; i++) {
      const p1 = obj.points[i];
      const p2 = obj.points[i + 1];
      const dx = (p2[0] - p1[0]);
      const dy = (p2[1] - p1[1]);
      const len = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const cx = (p1[0] + p2[0]) / 2 + obj.position.x;
      const cz = (p1[1] + p2[1]) / 2 + obj.position.y;

      // Top rail
      result.push(
        <mesh
          key={`rail-top-${i}`}
          position={[cx, height * 0.95, cz]}
          rotation={[0, -angle, 0]}
          castShadow
        >
          <boxGeometry args={[len, boardThickness, boardThickness * 1.5]} />
          <meshStandardMaterial
            map={woodMaps.map}
            normalMap={woodMaps.normalMap}
            normalScale={new THREE.Vector2(0.5, 0.5)}
            roughness={0.7}
            color="#8B6914"
          />
        </mesh>
      );

      // Bottom rail
      result.push(
        <mesh
          key={`rail-bot-${i}`}
          position={[cx, height * 0.25, cz]}
          rotation={[0, -angle, 0]}
          castShadow
        >
          <boxGeometry args={[len, boardThickness, boardThickness * 1.5]} />
          <meshStandardMaterial
            map={woodMaps.map}
            normalMap={woodMaps.normalMap}
            normalScale={new THREE.Vector2(0.5, 0.5)}
            roughness={0.7}
            color="#8B6914"
          />
        </mesh>
      );

      // Picket boards
      const numPickets = Math.floor(len / (boardWidth + boardSpacing));
      const dirX = dx / len;
      const dirZ = dy / len;
      for (let j = 0; j < numPickets; j++) {
        const t = (j + 0.5) / numPickets;
        const bx = p1[0] + dx * t + obj.position.x;
        const bz = p1[1] + dy * t + obj.position.y;
        result.push(
          <mesh
            key={`picket-${i}-${j}`}
            position={[bx, height * 0.55, bz]}
            rotation={[0, -angle, 0]}
            castShadow
          >
            <boxGeometry args={[boardWidth, height * 0.65, boardThickness]} />
            <meshStandardMaterial
              map={woodMaps.map}
              normalMap={woodMaps.normalMap}
              normalScale={new THREE.Vector2(0.5, 0.5)}
              roughness={0.7}
              color="#8B6914"
            />
          </mesh>
        );
      }
    }
    return result;
  }, [obj.points, obj.position.x, obj.position.y, height, woodMaps]);

  return (
    <group>
      {/* Posts at each point */}
      {obj.points.map((p, i) => (
        <mesh
          key={`post-${i}`}
          geometry={postGeometry}
          position={[p[0] + obj.position.x, height / 2, p[1] + obj.position.y]}
          castShadow
        >
          <meshStandardMaterial
            map={woodMaps.map}
            normalMap={woodMaps.normalMap}
            normalScale={new THREE.Vector2(0.5, 0.5)}
            roughness={0.7}
            color="#6B5210"
          />
        </mesh>
      ))}
      {segments}
    </group>
  );
}
