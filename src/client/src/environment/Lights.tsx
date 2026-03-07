export function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[50, 80, 30]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
    </>
  );
}
