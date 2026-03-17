import { useState } from "react";
import { useLandscapeStore } from "../store/landscapeStore";
import type { ObjectCategory } from "../types/landscape";
import { colors, font, spacing, radius, panelStyle, transition } from "./theme";
import { EyeIcon, EyeOffIcon, LockIcon, UnlockIcon, ChevronDownIcon, ChevronRightIcon } from "./icons";

const categoryLabels: Record<ObjectCategory, string> = {
  structure: "Structure",
  hardscape: "Hardscape",
  softscape: "Softscape",
  water: "Water",
};

const categoryOrder: ObjectCategory[] = ["structure", "hardscape", "softscape", "water"];

export function LayersPanel() {
  const objects = useLandscapeStore((s) => s.project?.objects ?? []);
  const selectedId = useLandscapeStore((s) => s.selectedObjectId);
  const selectObject = useLandscapeStore((s) => s.selectObject);
  const toggleVisibility = useLandscapeStore((s) => s.toggleObjectVisibility);
  const toggleLock = useLandscapeStore((s) => s.toggleObjectLock);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCollapse = (cat: string) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Group objects including "annotation" as its own category
  const grouped: Record<string, typeof objects> = {};
  for (const obj of objects) {
    const cat = obj.type === "annotation" ? "annotation" : obj.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(obj);
  }

  const allCategories = [...categoryOrder, "annotation"] as const;

  return (
    <div style={panel}>
      <div style={{ fontWeight: font.weight.semibold, fontSize: font.size.sm, color: colors.text, marginBottom: spacing.md, fontFamily: font.family }}>
        Layers
      </div>
      {allCategories.map((cat) => {
        const items = grouped[cat];
        if (!items || items.length === 0) return null;
        const isCollapsed = collapsed[cat];
        const label = cat === "annotation" ? "Annotations" : categoryLabels[cat as ObjectCategory];

        return (
          <div key={cat} style={{ marginBottom: spacing.sm }}>
            <button
              onClick={() => toggleCollapse(cat)}
              style={sectionHeader}
            >
              {isCollapsed ? <ChevronRightIcon size={12} color={colors.textMuted} /> : <ChevronDownIcon size={12} color={colors.textMuted} />}
              <span>{label}</span>
              <span style={{ color: colors.textMuted, fontSize: font.size.xs, marginLeft: "auto" }}>{items.length}</span>
            </button>

            {!isCollapsed && items
              .sort((a, b) => b.zIndex - a.zIndex)
              .map((obj) => {
                const isSelected = obj.id === selectedId;
                return (
                  <div
                    key={obj.id}
                    onClick={() => selectObject(obj.id)}
                    style={{
                      ...row,
                      background: isSelected ? `${colors.accent}22` : "transparent",
                      borderLeft: isSelected ? `2px solid ${colors.accent}` : "2px solid transparent",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: obj.geometry === "point" ? "50%" : 2,
                        background: obj.style.fill === "transparent"
                          ? obj.style.stroke
                          : obj.style.fill,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: isSelected ? colors.text : colors.textMuted,
                      fontSize: font.size.xs,
                    }}>
                      {obj.name}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleVisibility(obj.id); }}
                      style={iconBtn}
                      title={obj.visible ? "Hide" : "Show"}
                    >
                      {obj.visible ? <EyeIcon size={12} color={colors.textMuted} /> : <EyeOffIcon size={12} color={colors.textMuted} />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLock(obj.id); }}
                      style={iconBtn}
                      title={obj.locked ? "Unlock" : "Lock"}
                    >
                      {obj.locked ? <LockIcon size={12} color={colors.accent} /> : <UnlockIcon size={12} color={colors.textMuted} />}
                    </button>
                  </div>
                );
              })}
          </div>
        );
      })}
      {objects.length === 0 && (
        <div style={{ color: colors.textMuted, fontSize: font.size.xs, fontFamily: font.family, textAlign: "center", padding: spacing.xl }}>
          No objects yet
        </div>
      )}
    </div>
  );
}

const panel: React.CSSProperties = {
  ...panelStyle(),
  position: "absolute",
  top: 80,
  left: 8,
  width: 220,
  padding: spacing.md,
  pointerEvents: "auto",
  zIndex: 100,
  maxHeight: "calc(100vh - 120px)",
  overflowY: "auto",
};

const sectionHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: spacing.sm,
  width: "100%",
  padding: `${spacing.sm}px ${spacing.sm}px`,
  border: "none",
  borderRadius: radius.sm,
  background: "transparent",
  cursor: "pointer",
  fontFamily: font.family,
  fontSize: font.size.xs,
  fontWeight: font.weight.semibold,
  color: colors.text,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const row: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: spacing.sm,
  padding: `${spacing.xs + 1}px ${spacing.md}px`,
  borderRadius: radius.sm,
  cursor: "pointer",
  fontFamily: font.family,
  transition,
};

const iconBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 2,
  display: "flex",
  alignItems: "center",
  flexShrink: 0,
};
