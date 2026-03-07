import { useLandscapeStore } from "../store/landscapeStore";
import { polygonArea } from "../utils/coordinates";

export function ObjectProperties() {
  const selectedId = useLandscapeStore((s) => s.selectedObjectId);
  const objects = useLandscapeStore((s) => s.project?.objects ?? []);
  const updateObject = useLandscapeStore((s) => s.updateObject);
  const removeObject = useLandscapeStore((s) => s.removeObject);

  const obj = objects.find((o) => o.id === selectedId);
  if (!obj) return null;

  const area = polygonArea(obj.points);

  return (
    <div style={panel}>
      <h3 style={{ margin: "0 0 10px", color: "#fff", fontSize: 14 }}>
        Properties
      </h3>

      <div style={fieldGroup}>
        <label style={label}>Name</label>
        <input
          value={obj.name}
          onChange={(e) => updateObject(obj.id, { name: e.target.value })}
          style={input}
        />
      </div>

      <div style={fieldGroup}>
        <label style={label}>Type</label>
        <div style={{ color: "#ccc", fontSize: 12 }}>{obj.type}</div>
      </div>

      <div style={fieldGroup}>
        <label style={label}>Area</label>
        <div style={{ color: "#ccc", fontSize: 12 }}>
          {area.toFixed(1)} sq ft
        </div>
      </div>

      <div style={fieldGroup}>
        <label style={label}>Fill Color</label>
        <input
          type="color"
          value={obj.style.fill === "transparent" ? "#000000" : obj.style.fill ?? "#000000"}
          onChange={(e) =>
            updateObject(obj.id, {
              style: { ...obj.style, fill: e.target.value },
            })
          }
          style={{ width: "100%", height: 28, border: "none", cursor: "pointer" }}
        />
      </div>

      <div style={fieldGroup}>
        <label style={label}>Stroke Color</label>
        <input
          type="color"
          value={obj.style.stroke ?? "#ffffff"}
          onChange={(e) =>
            updateObject(obj.id, {
              style: { ...obj.style, stroke: e.target.value },
            })
          }
          style={{ width: "100%", height: 28, border: "none", cursor: "pointer" }}
        />
      </div>

      <div style={fieldGroup}>
        <label style={label}>Rotation (deg)</label>
        <input
          type="number"
          value={Math.round(obj.rotation * (180 / Math.PI))}
          onChange={(e) =>
            updateObject(obj.id, {
              rotation: Number(e.target.value) * (Math.PI / 180),
            })
          }
          style={input}
        />
      </div>

      <button
        onClick={() => removeObject(obj.id)}
        style={{
          ...deleteBtn,
        }}
      >
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
};

const fieldGroup: React.CSSProperties = { marginBottom: 10 };
const label: React.CSSProperties = {
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
