import { useState } from "react";
import { useLandscapeStore } from "../store/landscapeStore";
import type { PlanTool, ObjectCategory } from "../types/landscape";
import { getRegistryByCategory } from "../types/objectRegistry";

const categoryLabels: Record<ObjectCategory, string> = {
  structure: "Structure",
  hardscape: "Hardscape",
  softscape: "Softscape",
  water: "Water",
};

const categoryOrder: ObjectCategory[] = ["structure", "hardscape", "softscape", "water"];

const topTools: { key: PlanTool; label: string }[] = [
  { key: "select", label: "Select" },
  { key: "pan", label: "Pan" },
  { key: "measure", label: "Measure" },
];

export function PlanToolbar() {
  const activeTool = useLandscapeStore((s) => s.activeTool);
  const setActiveTool = useLandscapeStore((s) => s.setActiveTool);
  const [openCategory, setOpenCategory] = useState<ObjectCategory | null>(null);

  const grouped = getRegistryByCategory();

  const handleCategoryClick = (cat: ObjectCategory) => {
    setOpenCategory(openCategory === cat ? null : cat);
  };

  const handleToolSelect = (tool: PlanTool) => {
    setActiveTool(tool);
    setOpenCategory(null);
  };

  // Check if active tool belongs to a category
  const activeCategoryTool = (cat: ObjectCategory) =>
    grouped[cat].some((e) => e.tool === activeTool);

  return (
    <div style={container}>
      {topTools.map((t) => (
        <button
          key={t.key}
          onClick={() => { handleToolSelect(t.key); }}
          style={{
            ...btn,
            background: activeTool === t.key ? "#4a9eff" : "#222",
            color: activeTool === t.key ? "#fff" : "#999",
          }}
        >
          {t.label}
        </button>
      ))}

      <div style={separator} />

      {categoryOrder.map((cat) => (
        <div key={cat} style={{ position: "relative" }}>
          <button
            onClick={() => handleCategoryClick(cat)}
            style={{
              ...btn,
              background: activeCategoryTool(cat) ? "#4a9eff" : openCategory === cat ? "#333" : "#222",
              color: activeCategoryTool(cat) ? "#fff" : openCategory === cat ? "#fff" : "#999",
            }}
          >
            {categoryLabels[cat]} ▾
          </button>

          {openCategory === cat && (
            <div style={dropdown}>
              {grouped[cat].map((entry) => (
                <button
                  key={entry.tool}
                  onClick={() => handleToolSelect(entry.tool)}
                  style={{
                    ...dropdownItem,
                    background: activeTool === entry.tool ? "#4a9eff" : "transparent",
                    color: activeTool === entry.tool ? "#fff" : "#ccc",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: entry.geometry === "point" ? "50%" : 1,
                      background: entry.defaultStyle.fill === "transparent"
                        ? entry.defaultStyle.stroke
                        : entry.defaultStyle.fill,
                      marginRight: 8,
                      flexShrink: 0,
                    }}
                  />
                  {entry.label}
                </button>
              ))}
            </div>
          )}
        </div>
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
  whiteSpace: "nowrap",
};

const separator: React.CSSProperties = {
  width: 1,
  background: "#444",
  margin: "0 4px",
};

const dropdown: React.CSSProperties = {
  position: "absolute",
  top: "100%",
  left: 0,
  marginTop: 4,
  background: "#222",
  borderRadius: 6,
  padding: 4,
  minWidth: 150,
  zIndex: 200,
  boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
};

const dropdownItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  width: "100%",
  padding: "6px 10px",
  border: "none",
  borderRadius: 3,
  cursor: "pointer",
  fontFamily: "monospace",
  fontSize: 12,
  textAlign: "left",
};
