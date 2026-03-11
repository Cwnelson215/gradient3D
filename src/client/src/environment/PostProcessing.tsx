// Post-processing effects implemented without @react-three/postprocessing
// due to version incompatibility with @react-three/fiber v8.
// Visual enhancements are handled via:
// - HDRI environment map (Sky.tsx) for realistic reflections
// - ACES Filmic tone mapping (SceneView.tsx) for cinematic color grading
// - ContactShadows (Lights.tsx) for soft ground-contact occlusion
// - High-quality shadow maps on directional light
// No runtime component needed — this file kept for documentation.

export function PostProcessing() {
  return null;
}
