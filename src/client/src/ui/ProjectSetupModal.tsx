import { useState, useRef } from "react";
import { useLandscapeStore } from "../store/landscapeStore";
import type { ProjectState } from "../types/landscape";
import { colors, font, spacing, radius, shadow, panelStyle, inputStyle, buttonStyle } from "./theme";

export function ProjectSetupModal() {
  const initProject = useLandscapeStore((s) => s.initProject);
  const loadProject = useLandscapeStore((s) => s.loadProject);
  const [widthFt, setWidthFt] = useState<number | string>(100);
  const [depthFt, setDepthFt] = useState<number | string>(80);
  const [gridSpacingFt, setGridSpacingFt] = useState<number | string>(10);
  const [bgImage, setBgImage] = useState<string | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBgImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreate = () => {
    initProject({
      widthFt: Number(widthFt) || 100,
      depthFt: Number(depthFt) || 80,
      gridSpacingFt: Number(gridSpacingFt) || 10,
      backgroundImage: bgImage,
    });
  };

  const handleLoadProject = () => {
    importRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as ProjectState;
        if (data.property && data.objects) {
          loadProject(data);
        }
      } catch {
        // invalid file
      }
    };
    reader.readAsText(file);
  };

  const w = Number(widthFt) || 100;
  const d = Number(depthFt) || 80;
  const maxDim = Math.max(w, d);
  const previewW = (w / maxDim) * 200;
  const previewH = (d / maxDim) * 200;

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2 style={{ margin: `0 0 ${spacing.xxl}px`, color: colors.text, fontFamily: font.family, fontWeight: font.weight.semibold, fontSize: 20 }}>
          New Landscape Project
        </h2>

        <div style={{ display: "flex", gap: spacing.xxl }}>
          <div style={{ flex: 1 }}>
            <div style={fieldGroup}>
              <label style={label}>Property Width (ft)</label>
              <input
                type="number"
                value={widthFt}
                onChange={(e) => setWidthFt(e.target.value === "" ? "" : Number(e.target.value))}
                style={input}
              />
            </div>

            <div style={fieldGroup}>
              <label style={label}>Property Depth (ft)</label>
              <input
                type="number"
                value={depthFt}
                onChange={(e) => setDepthFt(e.target.value === "" ? "" : Number(e.target.value))}
                style={input}
              />
            </div>

            <div style={fieldGroup}>
              <label style={label}>Grid Display Spacing (ft)</label>
              <input
                type="number"
                value={gridSpacingFt}
                onChange={(e) => setGridSpacingFt(e.target.value === "" ? "" : Number(e.target.value))}
                style={input}
              />
              <div style={{ marginTop: spacing.sm, color: colors.textMuted, fontSize: font.size.xs, fontFamily: font.family }}>
                Snap resolution: 1 inch
              </div>
            </div>

            <div style={fieldGroup}>
              <label style={label}>Background Image (optional)</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ ...input, padding: `${spacing.sm + 2}px` }}
              />
              {bgImage && (
                <div style={{ marginTop: spacing.sm, color: colors.accent, fontSize: font.size.sm, fontFamily: font.family }}>
                  Image loaded
                </div>
              )}
            </div>
          </div>

          {/* Property preview rectangle */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: 220 }}>
            <div
              style={{
                width: previewW,
                height: previewH,
                border: `2px dashed ${colors.accent}`,
                borderRadius: radius.sm,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colors.textMuted,
                fontSize: font.size.xs,
                fontFamily: font.family,
                background: `${colors.accent}08`,
              }}
            >
              {w} x {d} ft
            </div>
            <div style={{ marginTop: spacing.md, color: colors.textMuted, fontSize: font.size.xs, fontFamily: font.family }}>
              Property Preview
            </div>
          </div>
        </div>

        <button onClick={handleCreate} style={createBtn}>
          Create Project
        </button>

        <div style={{ textAlign: "center", margin: `${spacing.lg}px 0 ${spacing.md}px`, color: colors.textMuted, fontSize: font.size.md, fontFamily: font.family }}>
          or
        </div>

        <button onClick={handleLoadProject} style={{ ...createBtn, background: colors.surfaceHover }}>
          Load Project (.gradient.json)
        </button>
        <input
          ref={importRef}
          type="file"
          accept=".json,.gradient.json"
          onChange={handleImportFile}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  backdropFilter: "blur(4px)",
};

const modal: React.CSSProperties = {
  ...panelStyle(),
  padding: 32,
  width: 560,
};

const fieldGroup: React.CSSProperties = {
  marginBottom: spacing.xl,
};

const label: React.CSSProperties = {
  display: "block",
  color: colors.textMuted,
  fontSize: font.size.sm,
  fontFamily: font.family,
  fontWeight: font.weight.medium,
  marginBottom: spacing.sm,
};

const input: React.CSSProperties = inputStyle();

const createBtn: React.CSSProperties = {
  ...buttonStyle("primary"),
  width: "100%",
  padding: `${spacing.lg}px`,
  marginTop: spacing.md,
  fontSize: font.size.xl,
  textAlign: "center",
  display: "block",
};
