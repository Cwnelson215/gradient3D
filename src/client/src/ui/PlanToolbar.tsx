import { useLandscapeStore } from "../store/landscapeStore";
import type { PlanTool } from "../types/landscape";

const tools: { key: PlanTool; label: string }[] = [
  { key: "select", label: "Select" },
  { key: "pan", label: "Pan" },
  { key: "drawBoundary", label: "Boundary" },
  { key: "drawHouse", label: "House" },
];

export function PlanToolbar() {
  const activeTool = useLandscapeStore((s) => s.activeTool);
  const setActiveTool = useLandscapeStore((s) => s.setActiveTool);

  return (
    <div style={container}>
      {tools.map((t) => (
        <button
          key={t.key}
          onClick={() => setActiveTool(t.key)}
          style={{
            ...btn,
            background: activeTool === t.key ? "#4a9eff" : "#222",
            color: activeTool === t.key ? "#fff" : "#999",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

const container: React.CSSProperties = {
  position: "absolute",
  top: 8,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: 4,
  zIndex: 100,
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
