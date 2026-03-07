import { useLandscapeStore } from "../store/landscapeStore";
import type { ViewMode } from "../types/landscape";

const modes: { key: ViewMode; label: string }[] = [
  { key: "plan", label: "2D Plan" },
  { key: "view3d", label: "3D View" },
  { key: "split", label: "Split" },
];

export function ViewModeToggle() {
  const viewMode = useLandscapeStore((s) => s.viewMode);
  const setViewMode = useLandscapeStore((s) => s.setViewMode);

  return (
    <div style={container}>
      {modes.map((m) => (
        <button
          key={m.key}
          onClick={() => setViewMode(m.key)}
          style={{
            ...btn,
            background: viewMode === m.key ? "#4a9eff" : "#222",
            color: viewMode === m.key ? "#fff" : "#999",
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

const container: React.CSSProperties = {
  position: "absolute",
  top: 8,
  right: 8,
  display: "flex",
  gap: 4,
  zIndex: 1100,
  pointerEvents: "auto",
};

const btn: React.CSSProperties = {
  padding: "6px 14px",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontFamily: "monospace",
  fontSize: 12,
};
