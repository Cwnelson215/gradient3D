import { useLandscapeStore } from "../store/landscapeStore";
import type { CameraMode } from "../types/landscape";

const modes: { id: CameraMode; label: string }[] = [
  { id: "orbit", label: "Orbit" },
  { id: "firstPerson", label: "First Person" },
  { id: "topDown", label: "Top Down" },
];

export function ModeSelector() {
  const currentMode = useLandscapeStore((s) => s.cameraMode);
  const setCameraMode = useLandscapeStore((s) => s.setCameraMode);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 12,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 2,
        pointerEvents: "auto",
        background: "#111",
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      {modes.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => setCameraMode(id)}
          style={{
            padding: "8px 20px",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontFamily: "monospace",
            background: currentMode === id ? "#4a9eff" : "transparent",
            color: currentMode === id ? "#fff" : "#999",
            transition: "all 0.15s",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
