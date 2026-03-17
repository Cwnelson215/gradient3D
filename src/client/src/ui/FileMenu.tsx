import { useRef } from "react";
import { useLandscapeStore } from "../store/landscapeStore";
import type { ProjectState } from "../types/landscape";
import { colors, font, spacing, radius, transition } from "./theme";
import { FileIcon, DownloadIcon, FolderOpenIcon } from "./icons";

export function FileMenu() {
  const project = useLandscapeStore((s) => s.project);
  const loadProject = useLandscapeStore((s) => s.loadProject);
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
    e.target.value = "";
  };

  const handleNew = () => {
    useLandscapeStore.setState({ project: null });
  };

  return (
    <div style={container}>
      <button onClick={handleNew} style={btn} title="New Project">
        <FileIcon size={13} />
        New
      </button>
      <button onClick={handleExport} style={btn} title="Export Project JSON">
        <DownloadIcon size={13} />
        Save
      </button>
      <button onClick={handleImport} style={btn} title="Import Project JSON">
        <FolderOpenIcon size={13} />
        Open
      </button>
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
  gap: spacing.sm,
  zIndex: 100,
  pointerEvents: "auto",
};

const btn: React.CSSProperties = {
  padding: `${spacing.sm + 2}px ${spacing.lg}px`,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.sm,
  cursor: "pointer",
  fontFamily: font.family,
  fontSize: font.size.sm,
  fontWeight: font.weight.medium,
  background: colors.surface,
  color: colors.textMuted,
  display: "flex",
  alignItems: "center",
  gap: spacing.sm + 1,
  transition,
  lineHeight: 1,
};
