import { Sky as DreiSky, Environment } from "@react-three/drei";

export function Sky() {
  return (
    <>
      <DreiSky
        distance={450000}
        sunPosition={[100, 50, 100]}
        inclination={0.6}
        azimuth={0.25}
      />
      <Environment preset="park" background={false} />
    </>
  );
}
