import { useTerrainStore } from "../store/terrainStore";

export function Water() {
  const waterLevel = useTerrainStore((s) => s.waterLevel);

  return (
    <mesh rotation-x={-Math.PI / 2} position-y={waterLevel}>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial
        color="#1a6ea0"
        transparent
        opacity={0.6}
        side={2}
      />
    </mesh>
  );
}
