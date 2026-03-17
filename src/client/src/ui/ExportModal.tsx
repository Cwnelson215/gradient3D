import { useState } from "react";
import { useLandscapeStore } from "../store/landscapeStore";
import { computeMaterialSummary } from "../export/materialSummary";
import { colors, font, spacing, radius, overlayStyle, modalStyle, fieldLabelStyle, inputStyle, buttonStyle } from "./theme";
import { DownloadIcon, XIcon } from "./icons";
import { useToast } from "./Toast";

type ExportFormat = "png" | "glb" | "obj";

interface Props {
  onClose: () => void;
}

export function ExportModal({ onClose }: Props) {
  const objects = useLandscapeStore((s) => s.project?.objects ?? []);
  const property = useLandscapeStore((s) => s.project?.property);
  const showToast = useToast((s) => s.showToast);

  const [format, setFormat] = useState<ExportFormat>("png");
  const [projectName, setProjectName] = useState("Landscape Plan");
  const [background, setBackground] = useState<"dark" | "white">("dark");
  const [showTitleBlock, setShowTitleBlock] = useState(true);
  const [showScaleBar, setShowScaleBar] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [showNorthArrow, setShowNorthArrow] = useState(true);
  const [resolution, setResolution] = useState(2);
  const [exporting, setExporting] = useState(false);

  const summary = computeMaterialSummary(objects);
  const slug = projectName.replace(/\s+/g, "-").toLowerCase();

  const handleExport = async () => {
    setExporting(true);

    try {
      if (format === "glb") {
        if (!property) return;
        const { exportGlb } = await import("../export/three/exportGltf");
        await exportGlb(objects, property, slug);
        showToast("GLB export complete", "success");
        onClose();
      } else if (format === "obj") {
        if (!property) return;
        const { exportObj } = await import("../export/three/exportObj");
        await exportObj(objects, property, slug);
        showToast("OBJ+MTL export complete", "success");
        onClose();
      } else {
        handlePngExport();
      }
    } catch (err) {
      console.error("Export failed:", err);
      showToast("Export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  const handlePngExport = () => {
    // Use requestAnimationFrame to show loading state
    requestAnimationFrame(() => {
      const canvas = document.querySelector(".konvajs-content canvas") as HTMLCanvasElement;
      if (!canvas) {
        setExporting(false);
        return;
      }

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = canvas.width * resolution;
      exportCanvas.height = canvas.height * resolution;
      const ctx = exportCanvas.getContext("2d")!;

      if (background === "white") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      }

      ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

      const scale = resolution;
      const textColor = background === "white" ? "#333" : "#e0e0e8";
      const mutedColor = background === "white" ? "#888" : "#888";

      if (showTitleBlock) {
        ctx.font = `600 ${18 * scale}px Inter, sans-serif`;
        ctx.fillStyle = textColor;
        ctx.fillText(projectName, 20 * scale, exportCanvas.height - 40 * scale);
        ctx.font = `${11 * scale}px Inter, sans-serif`;
        ctx.fillStyle = mutedColor;
        const subtitle = property
          ? `${property.widthFt} ft × ${property.depthFt} ft  |  ${new Date().toLocaleDateString()}`
          : new Date().toLocaleDateString();
        ctx.fillText(subtitle, 20 * scale, exportCanvas.height - 18 * scale);
      }

      if (showScaleBar && property) {
        const sbX = 20 * scale;
        const sbY = exportCanvas.height - 70 * scale;
        const pxPerFt = 8 * scale;
        const barLen = 10 * pxPerFt;
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(sbX, sbY);
        ctx.lineTo(sbX + barLen, sbY);
        ctx.moveTo(sbX, sbY - 4 * scale);
        ctx.lineTo(sbX, sbY + 4 * scale);
        ctx.moveTo(sbX + barLen, sbY - 4 * scale);
        ctx.lineTo(sbX + barLen, sbY + 4 * scale);
        ctx.stroke();
        ctx.font = `${10 * scale}px Inter, sans-serif`;
        ctx.fillStyle = mutedColor;
        ctx.fillText("10 ft", sbX + barLen / 2 - 12 * scale, sbY + 16 * scale);
      }

      if (showNorthArrow) {
        const naX = exportCanvas.width - 40 * scale;
        const naY = 40 * scale;
        ctx.strokeStyle = textColor;
        ctx.fillStyle = textColor;
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(naX, naY + 20 * scale);
        ctx.lineTo(naX, naY - 14 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(naX - 6 * scale, naY - 6 * scale);
        ctx.lineTo(naX, naY - 14 * scale);
        ctx.lineTo(naX + 6 * scale, naY - 6 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.font = `600 ${13 * scale}px Inter, sans-serif`;
        ctx.fillText("N", naX - 4 * scale, naY - 20 * scale);
      }

      const url = exportCanvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}.png`;
      a.click();

      setExporting(false);
      showToast("Export complete", "success");
      onClose();
    });
  };

  const exportLabel =
    format === "png" ? "Export PNG" :
    format === "glb" ? "Export GLB" :
    "Export OBJ+MTL";

  return (
    <div style={overlayStyle()} onClick={onClose}>
      <div style={modalStyle(440)} onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button onClick={onClose} style={closeBtn}>
          <XIcon size={16} />
        </button>

        <h2 style={{ margin: `0 0 ${spacing.xxl}px`, color: colors.text, fontFamily: font.family, fontWeight: font.weight.semibold, fontSize: 18 }}>
          Export Plan
        </h2>

        {/* Format selector */}
        <div style={fieldGroup}>
          <label style={label}>Format</label>
          <div style={{ display: "flex", gap: spacing.md }}>
            {(["png", "glb", "obj"] as ExportFormat[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                style={{ ...optionBtn, ...(format === f ? activeOption : {}) }}
              >
                {f === "png" ? "PNG" : f === "glb" ? "GLB" : "OBJ+MTL"}
              </button>
            ))}
          </div>
        </div>

        <div style={fieldGroup}>
          <label style={label}>Project Name</label>
          <input value={projectName} onChange={(e) => setProjectName(e.target.value)} style={input} />
        </div>

        {format === "png" && (
          <>
            <div style={fieldGroup}>
              <label style={label}>Background</label>
              <div style={{ display: "flex", gap: spacing.md }}>
                <button
                  onClick={() => setBackground("dark")}
                  style={{ ...optionBtn, ...(background === "dark" ? activeOption : {}) }}
                >
                  Dark
                </button>
                <button
                  onClick={() => setBackground("white")}
                  style={{ ...optionBtn, ...(background === "white" ? activeOption : {}) }}
                >
                  White
                </button>
              </div>
            </div>

            <div style={fieldGroup}>
              <label style={label}>Resolution</label>
              <div style={{ display: "flex", gap: spacing.md }}>
                {[1, 2, 3].map((r) => (
                  <button
                    key={r}
                    onClick={() => setResolution(r)}
                    style={{ ...optionBtn, ...(resolution === r ? activeOption : {}) }}
                  >
                    {r}x
                  </button>
                ))}
              </div>
            </div>

            <div style={fieldGroup}>
              <label style={label}>Include</label>
              <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
                <Toggle checked={showTitleBlock} onChange={setShowTitleBlock} label="Title Block" />
                <Toggle checked={showScaleBar} onChange={setShowScaleBar} label="Scale Bar" />
                <Toggle checked={showNorthArrow} onChange={setShowNorthArrow} label="North Arrow" />
                <Toggle checked={showLegend} onChange={setShowLegend} label="Material Legend" />
              </div>
            </div>

            {showLegend && summary.length > 0 && (
              <div style={fieldGroup}>
                <label style={label}>Material Summary</label>
                <div style={{ fontSize: font.size.xs, color: colors.textMuted, fontFamily: font.family }}>
                  {summary.map((item) => (
                    <div key={item.type} style={{ display: "flex", justifyContent: "space-between", padding: `${spacing.xs}px 0` }}>
                      <span>{item.label} ({item.count})</span>
                      <span>
                        {item.totalArea !== undefined && `${item.totalArea.toFixed(0)} sq ft`}
                        {item.totalLength !== undefined && `${item.totalLength.toFixed(0)} ft`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {(format === "glb" || format === "obj") && (
          <div style={{ ...fieldGroup, fontSize: font.size.xs, color: colors.textMuted, fontFamily: font.family, lineHeight: 1.5 }}>
            Exports visible objects as 3D geometry. Boundaries, irrigation lines, and annotations are skipped.
            Coordinates are in feet with Y-up orientation. Open the file in Blender or any glTF/OBJ viewer.
          </div>
        )}

        <div style={{ display: "flex", gap: spacing.md, marginTop: spacing.xl }}>
          <button onClick={onClose} style={{ ...buttonStyle("default"), flex: 1 }}>Cancel</button>
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{
              ...buttonStyle("primary"),
              flex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: spacing.sm,
              opacity: exporting ? 0.7 : 1,
            }}
          >
            <DownloadIcon size={14} />
            {exporting ? "Exporting..." : exportLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: spacing.md, cursor: "pointer", fontFamily: font.family, fontSize: font.size.sm, color: colors.text }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 32,
          height: 18,
          borderRadius: 9,
          background: checked ? colors.accent : colors.bg,
          border: `1px solid ${checked ? colors.accent : colors.border}`,
          position: "relative",
          transition: "all 0.15s ease",
          flexShrink: 0,
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#fff",
            position: "absolute",
            top: 1,
            left: checked ? 16 : 1,
            transition: "left 0.15s ease",
          }}
        />
      </div>
      {label}
    </label>
  );
}

const closeBtn: React.CSSProperties = {
  position: "absolute",
  top: spacing.lg,
  right: spacing.lg,
  background: "none",
  border: "none",
  cursor: "pointer",
  color: colors.textMuted,
  padding: 4,
  display: "flex",
  borderRadius: 4,
};

const fieldGroup: React.CSSProperties = { marginBottom: spacing.xl };

const label: React.CSSProperties = fieldLabelStyle();

const input: React.CSSProperties = inputStyle();

const optionBtn: React.CSSProperties = {
  ...buttonStyle("default"),
  flex: 1,
  textAlign: "center",
};

const activeOption: React.CSSProperties = {
  background: colors.accent,
  color: "#fff",
  borderColor: colors.accent,
};
