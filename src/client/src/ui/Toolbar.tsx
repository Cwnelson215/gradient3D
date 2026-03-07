import { useTerrainStore } from "../store/terrainStore";
import { Tool } from "../types/terrain";

const tools: { id: Tool; label: string }[] = [
  { id: "raise", label: "Raise" },
  { id: "lower", label: "Lower" },
  { id: "flatten", label: "Flatten" },
  { id: "smooth", label: "Smooth" },
];

const buttonStyle: React.CSSProperties = {
  padding: "8px 16px",
  border: "1px solid #555",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 14,
  fontFamily: "monospace",
  transition: "all 0.15s",
};

export function Toolbar() {
  const currentTool = useTerrainStore((s) => s.brushSettings.tool);
  const setBrush = useTerrainStore((s) => s.setBrush);

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 4,
        pointerEvents: "auto",
      }}
    >
      {tools.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => setBrush({ tool: id })}
          style={{
            ...buttonStyle,
            background: currentTool === id ? "#4a9eff" : "#222",
            color: currentTool === id ? "#fff" : "#ccc",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
