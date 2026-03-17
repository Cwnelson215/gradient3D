import { useLandscapeStore } from "../store/landscapeStore";
import { polygonArea, polylineLength } from "../utils/coordinates";
import { colors, font, spacing, radius, panelStyle, inputStyle, buttonStyle } from "./theme";
import { TrashIcon, CopyIcon } from "./icons";

export function ObjectProperties() {
  const selectedId = useLandscapeStore((s) => s.selectedObjectId);
  const objects = useLandscapeStore((s) => s.project?.objects ?? []);
  const updateObject = useLandscapeStore((s) => s.updateObject);
  const removeObject = useLandscapeStore((s) => s.removeObject);
  const duplicateObject = useLandscapeStore((s) => s.duplicateObject);

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

  return (
    <div style={panel}>
      <h3 style={{ margin: `0 0 ${spacing.lg}px`, color: colors.text, fontSize: font.size.xl, fontWeight: font.weight.semibold, fontFamily: font.family }}>
        Properties
      </h3>

      <div style={fieldGroup}>
        <label style={labelStyle}>Name</label>
        <input
          value={obj.name}
          onChange={(e) => updateObject(obj.id, { name: e.target.value })}
          style={input}
        />
      </div>

      <div style={fieldGroup}>
        <label style={labelStyle}>Type</label>
        <div style={{ color: colors.text, fontSize: font.size.md, fontFamily: font.family }}>{obj.type}</div>
      </div>

      {obj.type === "annotation" && (
        <div style={fieldGroup}>
          <label style={labelStyle}>Text</label>
          <textarea
            value={(obj.properties.text as string) ?? ""}
            onChange={(e) => updateProp("text", e.target.value)}
            style={{ ...input, minHeight: 60, resize: "vertical" }}
            rows={3}
          />
        </div>
      )}

      {obj.type !== "annotation" && (
        <div style={fieldGroup}>
          <label style={labelStyle}>{measureLabel}</label>
          <div style={{ color: colors.text, fontSize: font.size.md, fontFamily: font.family }}>{measurement}</div>
        </div>
      )}

      <div style={fieldGroup}>
        <label style={labelStyle}>Fill Color</label>
        <input
          type="color"
          value={obj.style.fill === "transparent" ? "#000000" : obj.style.fill ?? "#000000"}
          onChange={(e) =>
            updateObject(obj.id, { style: { ...obj.style, fill: e.target.value } })
          }
          style={{ width: "100%", height: 28, border: "none", cursor: "pointer", borderRadius: radius.sm }}
        />
      </div>

      <div style={fieldGroup}>
        <label style={labelStyle}>Stroke Color</label>
        <input
          type="color"
          value={obj.style.stroke ?? "#ffffff"}
          onChange={(e) =>
            updateObject(obj.id, { style: { ...obj.style, stroke: e.target.value } })
          }
          style={{ width: "100%", height: 28, border: "none", cursor: "pointer", borderRadius: radius.sm }}
        />
      </div>

      <div style={fieldGroup}>
        <label style={labelStyle}>Rotation (deg)</label>
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
            <label style={labelStyle}>Radius (ft)</label>
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
            <label style={labelStyle}>Height (ft)</label>
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
          <label style={labelStyle}>Canopy Shape</label>
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
            <label style={labelStyle}>Height (ft)</label>
            <input
              type="number"
              value={(obj.properties.height as number) ?? 6}
              onChange={(e) => updateProp("height", numVal(e))}
              style={input}
              min={1}
            />
          </div>
          <div style={fieldGroup}>
            <label style={labelStyle}>Style</label>
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
            <label style={labelStyle}>Height (ft)</label>
            <input
              type="number"
              value={(obj.properties.height as number) ?? 3}
              onChange={(e) => updateProp("height", numVal(e))}
              style={input}
              min={1}
            />
          </div>
          <div style={fieldGroup}>
            <label style={labelStyle}>Width (ft)</label>
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
          <label style={labelStyle}>Depth (ft)</label>
          <input
            type="number"
            value={(obj.properties.depth as number) ?? 6}
            onChange={(e) => updateProp("depth", numVal(e))}
            style={input}
            min={2}
          />
        </div>
      )}

      <div style={{ display: "flex", gap: spacing.sm, marginTop: spacing.md }}>
        <button
          onClick={() => duplicateObject(obj.id)}
          style={{ ...buttonStyle("default"), flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
          title="Duplicate (Ctrl+D)"
        >
          <CopyIcon size={13} />
          Duplicate
        </button>
        <button
          onClick={() => removeObject(obj.id)}
          style={{ ...buttonStyle("danger"), flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
        >
          <TrashIcon size={13} />
          Delete
        </button>
      </div>
    </div>
  );
}

const panel: React.CSSProperties = {
  ...panelStyle(),
  position: "absolute",
  right: 8,
  top: 48,
  width: 220,
  padding: spacing.xl,
  pointerEvents: "auto",
  zIndex: 100,
  maxHeight: "calc(100vh - 80px)",
  overflowY: "auto",
};

const fieldGroup: React.CSSProperties = { marginBottom: spacing.lg };
const labelStyle: React.CSSProperties = {
  display: "block",
  color: colors.textMuted,
  fontSize: font.size.xs,
  fontFamily: font.family,
  fontWeight: font.weight.medium,
  marginBottom: spacing.xs,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};
const input: React.CSSProperties = inputStyle();
