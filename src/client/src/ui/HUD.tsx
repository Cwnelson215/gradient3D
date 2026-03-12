import { useLandscapeStore } from "../store/landscapeStore";
import { PlanToolbar } from "./PlanToolbar";
import { ObjectProperties } from "./ObjectProperties";
import { FileMenu } from "./FileMenu";
import { ExportButtons } from "./ExportButtons";

function UndoRedoButtons() {
  const undo = useLandscapeStore((s) => s.undo);
  const redo = useLandscapeStore((s) => s.redo);
  const undoLen = useLandscapeStore((s) => s.undoStack.length);
  const redoLen = useLandscapeStore((s) => s.redoStack.length);

  return (
    <div style={{ position: "absolute", top: 8, left: 180, display: "flex", gap: 4, zIndex: 100, pointerEvents: "auto" }}>
      <button
        onClick={undo}
        disabled={undoLen === 0}
        style={{ ...undoBtn, opacity: undoLen === 0 ? 0.3 : 1 }}
        title="Undo (Ctrl+Z)"
      >
        Undo
      </button>
      <button
        onClick={redo}
        disabled={redoLen === 0}
        style={{ ...undoBtn, opacity: redoLen === 0 ? 0.3 : 1 }}
        title="Redo (Ctrl+Shift+Z)"
      >
        Redo
      </button>
    </div>
  );
}

const undoBtn: React.CSSProperties = {
  padding: "6px 10px",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontFamily: "monospace",
  fontSize: 11,
  background: "#222",
  color: "#999",
};

export function HUD() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <FileMenu />
      <UndoRedoButtons />
      <ExportButtons />
      <PlanToolbar />
      <ObjectProperties />
    </div>
  );
}
