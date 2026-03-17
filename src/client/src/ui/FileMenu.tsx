import { useRef } from "react";
import { useLandscapeStore } from "../store/landscapeStore";
import type { ProjectState } from "../types/landscape";
import { useToast } from "./Toast";
import { FileIcon, DownloadIcon, FolderOpenIcon } from "./icons";
import { Tooltip } from "./Tooltip";

export function FileMenuButtons() {
  const project = useLandscapeStore((s) => s.project);
  const loadProject = useLandscapeStore((s) => s.loadProject);
  const showToast = useToast((s) => s.showToast);
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
    showToast("Project saved", "success");
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
          showToast("Project loaded", "success");
        }
      } catch {
        showToast("Invalid project file", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleNew = () => {
    useLandscapeStore.setState({ project: null });
  };

  return (
    <>
      <Tooltip content="New Project">
        <button onClick={handleNew} style={iconBtn}>
          <FileIcon size={15} />
        </button>
      </Tooltip>
      <Tooltip content="Save Project">
        <button onClick={handleExport} style={iconBtn}>
          <DownloadIcon size={15} />
        </button>
      </Tooltip>
      <Tooltip content="Open Project">
        <button onClick={handleImport} style={iconBtn}>
          <FolderOpenIcon size={15} />
        </button>
      </Tooltip>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.gradient.json"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </>
  );
}

const iconBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 6,
  borderRadius: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#8888a0",
  transition: "all 0.15s ease",
};
