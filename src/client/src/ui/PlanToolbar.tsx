import { useState } from "react";
import { useLandscapeStore } from "../store/landscapeStore";
import type { PlanTool, ObjectCategory } from "../types/landscape";
import { getRegistryByCategory } from "../types/objectRegistry";
import { colors, font, spacing, radius, shadow, transition } from "./theme";
import {
  CursorIcon,
  HandIcon,
  RulerIcon,
  HouseIcon,
  SquareIcon,
  LeafIcon,
  DropletIcon,
  TextIcon,
  ChevronDownIcon,
} from "./icons";

const categoryLabels: Record<ObjectCategory, string> = {
  structure: "Structure",
  hardscape: "Hardscape",
  softscape: "Softscape",
  water: "Water",
};

const categoryIcons: Record<ObjectCategory, React.ReactNode> = {
  structure: <HouseIcon size={14} />,
  hardscape: <SquareIcon size={14} />,
  softscape: <LeafIcon size={14} />,
  water: <DropletIcon size={14} />,
};

const categoryOrder: ObjectCategory[] = ["structure", "hardscape", "softscape", "water"];

const topTools: { key: PlanTool; label: string; icon: React.ReactNode }[] = [
  { key: "select", label: "Select", icon: <CursorIcon size={14} /> },
  { key: "pan", label: "Pan", icon: <HandIcon size={14} /> },
  { key: "measure", label: "Measure", icon: <RulerIcon size={14} /> },
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

  const activeCategoryTool = (cat: ObjectCategory) =>
    grouped[cat].some((e) => e.tool === activeTool);

  return (
    <div style={container}>
      {topTools.map((t) => (
        <button
          key={t.key}
          onClick={() => handleToolSelect(t.key)}
          style={{
            ...btn,
            background: activeTool === t.key ? colors.accent : colors.surface,
            color: activeTool === t.key ? "#fff" : colors.textMuted,
            borderColor: activeTool === t.key ? colors.accent : colors.border,
          }}
        >
          {t.icon}
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
              background: activeCategoryTool(cat) ? colors.accent : openCategory === cat ? colors.surfaceHover : colors.surface,
              color: activeCategoryTool(cat) ? "#fff" : openCategory === cat ? colors.text : colors.textMuted,
              borderColor: activeCategoryTool(cat) ? colors.accent : openCategory === cat ? colors.border : colors.border,
            }}
          >
            {categoryIcons[cat]}
            {categoryLabels[cat]}
            <ChevronDownIcon size={12} />
          </button>

          {openCategory === cat && (
            <div style={dropdown}>
              {grouped[cat].map((entry) => (
                <button
                  key={entry.tool}
                  onClick={() => handleToolSelect(entry.tool)}
                  style={{
                    ...dropdownItem,
                    background: activeTool === entry.tool ? colors.accent : "transparent",
                    color: activeTool === entry.tool ? "#fff" : colors.text,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: entry.geometry === "point" ? "50%" : 2,
                      background: entry.defaultStyle.fill === "transparent"
                        ? entry.defaultStyle.stroke
                        : entry.defaultStyle.fill,
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

      {/* Annotation tool */}
      <button
        onClick={() => handleToolSelect("drawAnnotation")}
        style={{
          ...btn,
          background: activeTool === "drawAnnotation" ? colors.accent : colors.surface,
          color: activeTool === "drawAnnotation" ? "#fff" : colors.textMuted,
          borderColor: activeTool === "drawAnnotation" ? colors.accent : colors.border,
        }}
      >
        <TextIcon size={14} />
        Note
      </button>
    </div>
  );
}

const container: React.CSSProperties = {
  position: "absolute",
  top: 8,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: spacing.sm,
  zIndex: 100,
  pointerEvents: "auto",
};

const btn: React.CSSProperties = {
  padding: `${spacing.sm + 2}px ${spacing.lg}px`,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.sm,
  cursor: "pointer",
  fontFamily: font.family,
  fontSize: font.size.sm,
  fontWeight: font.weight.medium,
  whiteSpace: "nowrap",
  display: "flex",
  alignItems: "center",
  gap: spacing.sm + 1,
  transition,
  lineHeight: 1,
};

const separator: React.CSSProperties = {
  width: 1,
  background: colors.border,
  margin: `0 ${spacing.sm}px`,
};

const dropdown: React.CSSProperties = {
  position: "absolute",
  top: "100%",
  left: 0,
  marginTop: spacing.sm,
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.md,
  padding: spacing.sm,
  minWidth: 160,
  zIndex: 200,
  boxShadow: shadow.md,
};

const dropdownItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  width: "100%",
  padding: `${spacing.sm + 2}px ${spacing.md}px`,
  border: "none",
  borderRadius: radius.sm,
  cursor: "pointer",
  fontFamily: font.family,
  fontSize: font.size.md,
  textAlign: "left",
  gap: spacing.md,
  transition,
};
