import { useRef } from "react";
import { useLandscapeStore } from "../store/landscapeStore";
import type { ProjectState } from "../types/landscape";

export function FileMenu() {
  const project = useLandscapeStore((s) => s.project);
  const loadProject = useLandscapeStore((s) => s.loadProject);
  const initProject = useLandscapeStore((s) => s.initProject);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (!project) return;
    const json = JSON.stringify(project, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "landscape.gradient.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    // Reset so same file can be re-imported
    e.target.value = "";
  };

  const handleNew = () => {
    // Reset to setup modal by clearing persisted state
    useLandscapeStore.setState({ project: null });
  };

  return (
    <div style={container}>
      <button onClick={handleNew} style={btn}>New</button>
      <button onClick={handleExport} style={btn}>Export</button>
      <button onClick={handleImport} style={btn}>Import</button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.gradient.json"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}

const container: React.CSSProperties = {
  position: "absolute",
  top: 8,
  left: 8,
  display: "flex",
  gap: 4,
  zIndex: 100,
  pointerEvents: "auto",
};

const btn: React.CSSProperties = {
  padding: "6px 10px",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontFamily: "monospace",
  fontSize: 11,
  background: "#222",
  color: "#999",
};
