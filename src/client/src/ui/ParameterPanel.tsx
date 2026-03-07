import { useControls, button, folder } from "leva";
import { useTerrainStore } from "../store/terrainStore";
import { useEffect, useRef } from "react";

export function ParameterPanel() {
  const regenerate = useTerrainStore((s) => s.regenerate);
  const setBrush = useTerrainStore((s) => s.setBrush);
  const setWaterLevel = useTerrainStore((s) => s.setWaterLevel);
  const initialParams = useRef(useTerrainStore.getState().params);
  const initialBrush = useRef(useTerrainStore.getState().brushSettings);

  const [terrainValues, setTerrain] = useControls("Terrain", () => ({
    scale: { value: initialParams.current.scale, min: 10, max: 200, step: 1 },
    octaves: { value: initialParams.current.octaves, min: 1, max: 8, step: 1 },
    amplitude: { value: initialParams.current.amplitude, min: 1, max: 50, step: 0.5 },
    persistence: { value: initialParams.current.persistence, min: 0.1, max: 0.9, step: 0.05 },
    seed: { value: initialParams.current.seed, min: 1, max: 9999, step: 1 },
    Regenerate: button(() => {
      regenerate();
    }),
  }), [regenerate]);

  const brushValues = useControls("Brush", {
    size: { value: initialBrush.current.size, min: 1, max: 20, step: 0.5 },
    strength: { value: initialBrush.current.strength, min: 0.05, max: 1, step: 0.05 },
  });

  const waterValues = useControls("Water", {
    level: { value: 0, min: -10, max: 10, step: 0.5 },
  });

  useEffect(() => {
    regenerate({
      scale: terrainValues.scale,
      octaves: terrainValues.octaves,
      amplitude: terrainValues.amplitude,
      persistence: terrainValues.persistence,
      seed: terrainValues.seed,
    });
  }, [
    terrainValues.scale,
    terrainValues.octaves,
    terrainValues.amplitude,
    terrainValues.persistence,
    terrainValues.seed,
    regenerate,
  ]);

  useEffect(() => {
    setBrush({ size: brushValues.size, strength: brushValues.strength });
  }, [brushValues.size, brushValues.strength, setBrush]);

  useEffect(() => {
    setWaterLevel(waterValues.level);
  }, [waterValues.level, setWaterLevel]);

  return null;
}
