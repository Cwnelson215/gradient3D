import { useState } from "react";
import { useLandscapeStore } from "../store/landscapeStore";
import { polygonArea, polylineLength } from "../utils/coordinates";
import { colors, font, spacing, radius, panelStyle, inputStyle, buttonStyle, fieldLabelStyle, transition, zIndex } from "./theme";
import { TrashIcon, CopyIcon, XIcon, ChevronDownIcon, ChevronRightIcon } from "./icons";

function Section({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: spacing.sm }}>
      <button onClick={() => setOpen(!open)} style={sectionBtn}>
        {open ? <ChevronDownIcon size={11} color={colors.textMuted} /> : <ChevronRightIcon size={11} color={colors.textMuted} />}
        <span>{title}</span>
      </button>
      {open && <div style={{ padding: `${spacing.sm}px 0 ${spacing.sm}px ${spacing.xl}px` }}>{children}</div>}
    </div>
  );
}

export function ObjectProperties() {
  const selectedId = useLandscapeStore((s) => s.selectedObjectId);
  const objects = useLandscapeStore((s) => s.project?.objects ?? []);
  const updateObject = useLandscapeStore((s) => s.updateObject);
  const removeObject = useLandscapeStore((s) => s.removeObject);
  const duplicateObject = useLandscapeStore((s) => s.duplicateObject);
  const selectObject = useLandscapeStore((s) => s.selectObject);

  const obj = objects.find((o) => o.id === selectedId);
  if (!obj) return null;

  let measurement = "";
  if (obj.geometry === "polygon" && obj.points.length >= 3) {
    measurement = `${polygonArea(obj.points).toFixed(1)} sq ft`;
  } else if (obj.geometry === "line" && obj.points.length >= 2) {
    measurement = `${polylineLength(obj.points).toFixed(1)} ft`;
  } else if (obj.geometry === "point") {
    const r = obj.radius ?? (obj.properties.radius as number) ?? 3;
    measurement = `${(r * 2).toFixed(1)} ft diameter`;
  }

  const measureLabel =
    obj.geometry === "line" ? "Length" : obj.geometry === "point" ? "Size" : "Area";

  const updateProp = (key: string, value: unknown) => {
    updateObject(obj.id, { properties: { ...obj.properties, [key]: value } });
  };

  const numVal = (e: React.ChangeEvent<HTMLInputElement>) =>
    e.target.value === "" ? "" : Number(e.target.value);

  const fillColor = obj.style.fill === "transparent" ? obj.style.stroke : obj.style.fill;

  return (
    <div style={panel}>
      {/* Header */}
      <div style={header}>
        <div style={{ display: "flex", alignItems: "center", gap: spacing.md, flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: obj.geometry === "point" ? "50%" : 3,
              background: fillColor ?? "#888",
              flexShrink: 0,
              border: `1px solid rgba(255,255,255,0.1)`,
            }}
          />
          <input
            value={obj.name}
            onChange={(e) => updateObject(obj.id, { name: e.target.value })}
            style={nameInput}
          />
        </div>
        <span style={typeBadge}>{obj.type}</span>
        <button onClick={() => selectObject(null)} style={closeBtn}>
          <XIcon size={13} />
        </button>
      </div>

      {/* Identity & Dimensions */}
      <Section title="Dimensions">
        {obj.type !== "annotation" && (
          <div style={fieldGroup}>
            <label style={label}>{measureLabel}</label>
            <div style={readOnlyVal}>{measurement}</div>
          </div>
        )}
        <div style={fieldGroup}>
          <label style={label}>Rotation (deg)</label>
          <input
            type="number"
            value={Math.round(obj.rotation * (180 / Math.PI))}
            onChange={(e) => {
              const v = numVal(e);
              if (v !== "") updateObject(obj.id, { rotation: v * (Math.PI / 180) });
            }}
            style={input}
          />
        </div>

        {(obj.type === "tree" || obj.type === "shrub") && (
          <>
            <div style={fieldGroup}>
              <label style={label}>Radius (ft)</label>
              <input
                type="number"
                value={obj.radius ?? (obj.properties.radius as number) ?? 3}
                onChange={(e) => {
                  const v = numVal(e);
                  if (v !== "") updateObject(obj.id, { radius: v });
                }}
                style={input}
                min={1}
                step={0.5}
              />
            </div>
            <div style={fieldGroup}>
              <label style={label}>Height (ft)</label>
              <input
                type="number"
                value={(obj.properties.height as number) ?? 10}
                onChange={(e) => updateProp("height", numVal(e))}
                style={input}
                min={1}
              />
            </div>
          </>
        )}

        {obj.type === "tree" && (
          <div style={fieldGroup}>
            <label style={label}>Canopy Shape</label>
            <select
              value={(obj.properties.canopyShape as string) ?? "sphere"}
              onChange={(e) => updateProp("canopyShape", e.target.value)}
              style={input}
            >
              <option value="sphere">Sphere</option>
              <option value="cone">Cone</option>
            </select>
          </div>
        )}

        {obj.type === "fence" && (
          <>
            <div style={fieldGroup}>
              <label style={label}>Height (ft)</label>
              <input
                type="number"
                value={(obj.properties.height as number) ?? 6}
                onChange={(e) => updateProp("height", numVal(e))}
                style={input}
                min={1}
              />
            </div>
            <div style={fieldGroup}>
              <label style={label}>Style</label>
              <select
                value={(obj.properties.fenceStyle as string) ?? "privacy"}
                onChange={(e) => updateProp("fenceStyle", e.target.value)}
                style={input}
              >
                <option value="privacy">Privacy</option>
                <option value="picket">Picket</option>
              </select>
            </div>
          </>
        )}

        {obj.type === "retaining-wall" && (
          <>
            <div style={fieldGroup}>
              <label style={label}>Height (ft)</label>
              <input
                type="number"
                value={(obj.properties.height as number) ?? 3}
                onChange={(e) => updateProp("height", numVal(e))}
                style={input}
                min={1}
              />
            </div>
            <div style={fieldGroup}>
              <label style={label}>Width (ft)</label>
              <input
                type="number"
                value={(obj.properties.width as number) ?? 1}
                onChange={(e) => updateProp("width", numVal(e))}
                style={input}
                min={0.5}
                step={0.5}
              />
            </div>
          </>
        )}

        {obj.type === "pool" && (
          <div style={fieldGroup}>
            <label style={label}>Depth (ft)</label>
            <input
              type="number"
              value={(obj.properties.depth as number) ?? 6}
              onChange={(e) => updateProp("depth", numVal(e))}
              style={input}
              min={2}
            />
          </div>
        )}
      </Section>

      {obj.type === "annotation" && (
        <Section title="Content">
          <div style={fieldGroup}>
            <label style={label}>Text</label>
            <textarea
              value={(obj.properties.text as string) ?? ""}
              onChange={(e) => updateProp("text", e.target.value)}
              style={{ ...input, minHeight: 60, resize: "vertical" }}
              rows={3}
            />
          </div>
        </Section>
      )}

      {/* Appearance */}
      <Section title="Appearance">
        <div style={{ display: "flex", gap: spacing.lg, marginBottom: spacing.md }}>
          <div style={{ flex: 1 }}>
            <label style={label}>Fill</label>
            <div style={colorRow}>
              <div style={colorSwatchWrap}>
                <input
                  type="color"
                  value={obj.style.fill === "transparent" ? "#000000" : obj.style.fill ?? "#000000"}
                  onChange={(e) =>
                    updateObject(obj.id, { style: { ...obj.style, fill: e.target.value } })
                  }
                  style={colorInput}
                />
                <div style={{ ...colorSwatch, background: obj.style.fill === "transparent" ? "transparent" : obj.style.fill ?? "#000" }} />
              </div>
              <span style={hexText}>{obj.style.fill === "transparent" ? "none" : obj.style.fill ?? "#000"}</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={label}>Stroke</label>
            <div style={colorRow}>
              <div style={colorSwatchWrap}>
                <input
                  type="color"
                  value={obj.style.stroke ?? "#ffffff"}
                  onChange={(e) =>
                    updateObject(obj.id, { style: { ...obj.style, stroke: e.target.value } })
                  }
                  style={colorInput}
                />
                <div style={{ ...colorSwatch, background: obj.style.stroke ?? "#fff" }} />
              </div>
              <span style={hexText}>{obj.style.stroke ?? "#fff"}</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Actions */}
      <div style={{ display: "flex", gap: spacing.sm, marginTop: spacing.sm }}>
        <button
          onClick={() => duplicateObject(obj.id)}
          style={{ ...buttonStyle("default"), flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontSize: font.size.xs }}
          title="Duplicate (Ctrl+D)"
        >
          <CopyIcon size={12} />
          Duplicate
        </button>
        <button
          onClick={() => removeObject(obj.id)}
          style={{ ...buttonStyle("danger"), flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontSize: font.size.xs }}
        >
          <TrashIcon size={12} />
          Delete
        </button>
      </div>
    </div>
  );
}

const panel: React.CSSProperties = {
  ...panelStyle(),
  position: "absolute",
  right: spacing.md,
  top: 56,
  width: 240,
  padding: 0,
  pointerEvents: "auto",
  zIndex: zIndex.hud,
  maxHeight: "calc(100vh - 96px)",
  overflowY: "auto",
};

const header: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: spacing.sm,
  padding: `${spacing.md}px ${spacing.lg}px`,
  borderBottom: `1px solid ${colors.border}`,
};

const nameInput: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: colors.text,
  fontSize: font.size.lg,
  fontWeight: font.weight.semibold,
  fontFamily: font.family,
  outline: "none",
  padding: `${spacing.xs}px 0`,
  minWidth: 0,
  flex: 1,
};

const typeBadge: React.CSSProperties = {
  background: colors.accentSubtle,
  color: colors.accent,
  fontSize: font.size.xs - 1,
  fontWeight: font.weight.medium,
  fontFamily: font.family,
  padding: `2px ${spacing.sm + 2}px`,
  borderRadius: 10,
  textTransform: "capitalize",
  flexShrink: 0,
};

const closeBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: colors.textMuted,
  padding: 2,
  display: "flex",
  borderRadius: 3,
  flexShrink: 0,
};

const sectionBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: spacing.sm,
  width: "100%",
  padding: `${spacing.sm + 1}px ${spacing.lg}px`,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontFamily: font.family,
  fontSize: font.size.xs,
  fontWeight: font.weight.semibold,
  color: colors.textMuted,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const fieldGroup: React.CSSProperties = { marginBottom: spacing.md };
const label: React.CSSProperties = {
  ...fieldLabelStyle(),
  marginBottom: spacing.xs,
};
const input: React.CSSProperties = inputStyle();
const readOnlyVal: React.CSSProperties = {
  color: colors.text,
  fontSize: font.size.md,
  fontFamily: font.family,
};

const colorRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: spacing.sm,
};

const colorSwatchWrap: React.CSSProperties = {
  position: "relative",
  width: 20,
  height: 20,
  flexShrink: 0,
};

const colorInput: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: 20,
  height: 20,
  opacity: 0,
  cursor: "pointer",
  border: "none",
  padding: 0,
};

const colorSwatch: React.CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: "50%",
  border: `1px solid rgba(255,255,255,0.15)`,
  pointerEvents: "none",
};

const hexText: React.CSSProperties = {
  fontSize: font.size.xs,
  color: colors.textMuted,
  fontFamily: font.family,
};
