import { useState } from "react";
import { useLandscapeStore } from "../store/landscapeStore";
import type { PlanTool, ObjectCategory } from "../types/landscape";
import { getRegistryByCategory } from "../types/objectRegistry";
import { colors, font, spacing, radius, shadow, transition } from "./theme";
import { Tooltip } from "./Tooltip";
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
  structure: <HouseIcon size={16} />,
  hardscape: <SquareIcon size={16} />,
  softscape: <LeafIcon size={16} />,
  water: <DropletIcon size={16} />,
};

const categoryOrder: ObjectCategory[] = ["structure", "hardscape", "softscape", "water"];

const topTools: { key: PlanTool; label: string; shortcut: string; icon: React.ReactNode }[] = [
  { key: "select", label: "Select", shortcut: "1", icon: <CursorIcon size={16} /> },
  { key: "pan", label: "Pan", shortcut: "2", icon: <HandIcon size={16} /> },
  { key: "measure", label: "Measure", shortcut: "3", icon: <RulerIcon size={16} /> },
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
        <Tooltip key={t.key} content={t.label} shortcut={t.shortcut}>
          <button
            onClick={() => handleToolSelect(t.key)}
            style={{
              ...btn,
              background: activeTool === t.key ? colors.accent : "transparent",
              color: activeTool === t.key ? "#fff" : colors.textMuted,
            }}
          >
            {t.icon}
          </button>
        </Tooltip>
      ))}

      <div style={separator} />

      {categoryOrder.map((cat) => (
        <div key={cat} style={{ position: "relative" }}>
          <Tooltip content={categoryLabels[cat]}>
            <button
              onClick={() => handleCategoryClick(cat)}
              style={{
                ...btn,
                background: activeCategoryTool(cat) ? colors.accent : openCategory === cat ? colors.surfaceHover : "transparent",
                color: activeCategoryTool(cat) ? "#fff" : openCategory === cat ? colors.text : colors.textMuted,
              }}
            >
              {categoryIcons[cat]}
              <ChevronDownIcon size={10} />
            </button>
          </Tooltip>

          {openCategory === cat && (
            <div style={dropdown}>
              <div style={dropdownHeader}>{categoryLabels[cat]}</div>
              {grouped[cat].map((entry) => (
                <button
                  key={entry.tool}
                  onClick={() => handleToolSelect(entry.tool)}
                  style={{
                    ...dropdownItem,
                    background: activeTool === entry.tool ? colors.accentSubtle : "transparent",
                    color: activeTool === entry.tool ? colors.accent : colors.text,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 12,
                      height: 12,
                      borderRadius: entry.geometry === "point" ? "50%" : 3,
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

      <div style={separator} />

      <Tooltip content="Annotation">
        <button
          onClick={() => handleToolSelect("drawAnnotation")}
          style={{
            ...btn,
            background: activeTool === "drawAnnotation" ? colors.accent : "transparent",
            color: activeTool === "drawAnnotation" ? "#fff" : colors.textMuted,
          }}
        >
          <TextIcon size={16} />
        </button>
      </Tooltip>
    </div>
  );
}

const container: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: spacing.sm + 2,
};

const btn: React.CSSProperties = {
  padding: spacing.md,
  border: "none",
  borderRadius: radius.sm,
  cursor: "pointer",
  fontFamily: font.family,
  fontSize: font.size.sm,
  fontWeight: font.weight.medium,
  whiteSpace: "nowrap",
  display: "flex",
  alignItems: "center",
  gap: 3,
  transition,
  lineHeight: 1,
};

const separator: React.CSSProperties = {
  width: 1,
  alignSelf: "stretch",
  background: colors.border,
  margin: `${spacing.sm}px ${spacing.xs}px`,
};

const dropdown: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 8px)",
  left: "50%",
  transform: "translateX(-50%)",
  background: colors.surfaceFloating,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.md,
  padding: spacing.sm,
  minWidth: 170,
  zIndex: 200,
  boxShadow: shadow.lg,
};

const dropdownHeader: React.CSSProperties = {
  padding: `${spacing.sm}px ${spacing.md}px`,
  fontSize: font.size.xs,
  fontWeight: font.weight.semibold,
  color: colors.textMuted,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  fontFamily: font.family,
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
