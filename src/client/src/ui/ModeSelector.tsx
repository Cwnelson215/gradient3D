import { useTerrainStore } from "../store/terrainStore";
import { CameraMode } from "../types/terrain";

const modes: { id: CameraMode; label: string }[] = [
  { id: "orbit", label: "Orbit" },
  { id: "firstPerson", label: "First Person" },
  { id: "topDown", label: "Top Down" },
];

export function ModeSelector() {
  const currentMode = useTerrainStore((s) => s.mode);
  const setMode = useTerrainStore((s) => s.setMode);

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
          onClick={() => setMode(id)}
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
