import { ContactShadows } from "@react-three/drei";

export function Lights() {
  return (
    <>
      {/* Primary sun light */}
      <directionalLight
        position={[50, 80, 30]}
        intensity={2.5}
        color="#fff5e1"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={200}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-bias={-0.0005}
      />
      {/* Cool fill light from opposite direction */}
      <directionalLight
        position={[-40, 40, -30]}
        intensity={0.3}
        color="#b0c4de"
      />
      {/* Hemisphere for sky/ground ambient */}
      <hemisphereLight
        args={["#87CEEB", "#3a5f0b", 0.15]}
      />
      {/* Soft contact shadows on ground */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.4}
        scale={200}
        blur={2}
        far={50}
      />
    </>
  );
}
