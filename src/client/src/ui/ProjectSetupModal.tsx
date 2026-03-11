import { useState, useRef } from "react";
import { useLandscapeStore } from "../store/landscapeStore";
import type { ProjectState } from "../types/landscape";

export function ProjectSetupModal() {
  const initProject = useLandscapeStore((s) => s.initProject);
  const loadProject = useLandscapeStore((s) => s.loadProject);
  const [widthFt, setWidthFt] = useState(100);
  const [depthFt, setDepthFt] = useState(80);
  const [gridSpacingFt, setGridSpacingFt] = useState(10);
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
      widthFt,
      depthFt,
      gridSpacingFt,
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

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2 style={{ margin: "0 0 16px", color: "#fff" }}>New Landscape Project</h2>

        <div style={fieldGroup}>
          <label style={label}>Property Width (ft)</label>
          <input
            type="number"
            value={widthFt}
            onChange={(e) => setWidthFt(Number(e.target.value))}
            style={input}
          />
        </div>

        <div style={fieldGroup}>
          <label style={label}>Property Depth (ft)</label>
          <input
            type="number"
            value={depthFt}
            onChange={(e) => setDepthFt(Number(e.target.value))}
            style={input}
          />
        </div>

        <div style={fieldGroup}>
          <label style={label}>Grid Spacing (ft)</label>
          <input
            type="number"
            value={gridSpacingFt}
            onChange={(e) => setGridSpacingFt(Number(e.target.value))}
            style={input}
          />
        </div>

        <div style={fieldGroup}>
          <label style={label}>Background Image (optional)</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ ...input, padding: "6px" }}
          />
          {bgImage && (
            <div style={{ marginTop: 4, color: "#8f8" }}>Image loaded</div>
          )}
        </div>

        <button onClick={handleCreate} style={createBtn}>
          Create Project
        </button>

        <div style={{ textAlign: "center", margin: "12px 0 8px", color: "#666", fontSize: 12 }}>
          or
        </div>

        <button onClick={handleLoadProject} style={{ ...createBtn, background: "#333" }}>
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
};

const modal: React.CSSProperties = {
  background: "#1a1a2e",
  borderRadius: 12,
  padding: 32,
  width: 380,
  fontFamily: "monospace",
};

const fieldGroup: React.CSSProperties = {
  marginBottom: 14,
};

const label: React.CSSProperties = {
  display: "block",
  color: "#aaa",
  fontSize: 12,
  marginBottom: 4,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  background: "#16213e",
  border: "1px solid #333",
  borderRadius: 6,
  color: "#fff",
  fontSize: 14,
  fontFamily: "monospace",
  boxSizing: "border-box",
};

const createBtn: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  marginTop: 8,
  background: "#4a9eff",
  border: "none",
  borderRadius: 6,
  color: "#fff",
  fontSize: 14,
  fontFamily: "monospace",
  cursor: "pointer",
};
