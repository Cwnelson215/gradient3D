import { useLandscapeStore } from "../store/landscapeStore";
import { polygonArea, polylineLength } from "../utils/coordinates";

export function ObjectProperties() {
  const selectedId = useLandscapeStore((s) => s.selectedObjectId);
  const objects = useLandscapeStore((s) => s.project?.objects ?? []);
  const updateObject = useLandscapeStore((s) => s.updateObject);
  const removeObject = useLandscapeStore((s) => s.removeObject);

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

  return (
    <div style={panel}>
      <h3 style={{ margin: "0 0 10px", color: "#fff", fontSize: 14 }}>
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
        <div style={{ color: "#ccc", fontSize: 12 }}>{obj.type}</div>
      </div>

      <div style={fieldGroup}>
        <label style={labelStyle}>{measureLabel}</label>
        <div style={{ color: "#ccc", fontSize: 12 }}>{measurement}</div>
      </div>

      <div style={fieldGroup}>
        <label style={labelStyle}>Fill Color</label>
        <input
          type="color"
          value={obj.style.fill === "transparent" ? "#000000" : obj.style.fill ?? "#000000"}
          onChange={(e) =>
            updateObject(obj.id, { style: { ...obj.style, fill: e.target.value } })
          }
          style={{ width: "100%", height: 28, border: "none", cursor: "pointer" }}
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
          style={{ width: "100%", height: 28, border: "none", cursor: "pointer" }}
        />
      </div>

      <div style={fieldGroup}>
        <label style={labelStyle}>Rotation (deg)</label>
        <input
          type="number"
          value={Math.round(obj.rotation * (180 / Math.PI))}
          onChange={(e) =>
            updateObject(obj.id, { rotation: Number(e.target.value) * (Math.PI / 180) })
          }
          style={input}
        />
      </div>

      {/* Type-specific properties */}
      {(obj.type === "tree" || obj.type === "shrub") && (
        <>
          <div style={fieldGroup}>
            <label style={labelStyle}>Radius (ft)</label>
            <input
              type="number"
              value={obj.radius ?? (obj.properties.radius as number) ?? 3}
              onChange={(e) =>
                updateObject(obj.id, { radius: Number(e.target.value) })
              }
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
              onChange={(e) => updateProp("height", Number(e.target.value))}
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
              onChange={(e) => updateProp("height", Number(e.target.value))}
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
              onChange={(e) => updateProp("height", Number(e.target.value))}
              style={input}
              min={1}
            />
          </div>
          <div style={fieldGroup}>
            <label style={labelStyle}>Width (ft)</label>
            <input
              type="number"
              value={(obj.properties.width as number) ?? 1}
              onChange={(e) => updateProp("width", Number(e.target.value))}
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
            onChange={(e) => updateProp("depth", Number(e.target.value))}
            style={input}
            min={2}
          />
        </div>
      )}

      <button onClick={() => removeObject(obj.id)} style={deleteBtn}>
        Delete
      </button>
    </div>
  );
}

const panel: React.CSSProperties = {
  position: "absolute",
  right: 8,
  top: 48,
  width: 200,
  background: "#1a1a2e",
  borderRadius: 8,
  padding: 14,
  fontFamily: "monospace",
  pointerEvents: "auto",
  zIndex: 100,
  maxHeight: "calc(100vh - 80px)",
  overflowY: "auto",
};

const fieldGroup: React.CSSProperties = { marginBottom: 10 };
const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#888",
  fontSize: 10,
  marginBottom: 2,
};
const input: React.CSSProperties = {
  width: "100%",
  padding: "4px 6px",
  background: "#16213e",
  border: "1px solid #333",
  borderRadius: 4,
  color: "#fff",
  fontSize: 12,
  fontFamily: "monospace",
  boxSizing: "border-box",
};
const deleteBtn: React.CSSProperties = {
  width: "100%",
  padding: "6px",
  background: "#c0392b",
  border: "none",
  borderRadius: 4,
  color: "#fff",
  fontSize: 12,
  fontFamily: "monospace",
  cursor: "pointer",
  marginTop: 4,
};
