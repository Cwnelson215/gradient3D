import { useState } from "react";
import { useLandscapeStore } from "../store/landscapeStore";
import { PlanToolbar } from "./PlanToolbar";
import { ObjectProperties } from "./ObjectProperties";
import { FileMenu } from "./FileMenu";
import { ExportButtons } from "./ExportButtons";
import { HotkeyMenu } from "./HotkeyMenu";
import { LayersPanel } from "./LayersPanel";
import { StatusBar } from "./StatusBar";
import { ExportModal } from "./ExportModal";
import { colors, font, buttonStyle, spacing, radius, shadow } from "./theme";
import { UndoIcon, RedoIcon, LayersIcon } from "./icons";

function UndoRedoButtons() {
  const undo = useLandscapeStore((s) => s.undo);
  const redo = useLandscapeStore((s) => s.redo);
  const undoLen = useLandscapeStore((s) => s.undoStack.length);
  const redoLen = useLandscapeStore((s) => s.redoStack.length);

  const base = buttonStyle("default");

  return (
    <div style={{ position: "absolute", top: 8, left: 180, display: "flex", gap: spacing.sm, zIndex: 100, pointerEvents: "auto" }}>
      <button
        onClick={undo}
        disabled={undoLen === 0}
        style={{ ...base, opacity: undoLen === 0 ? 0.3 : 1, display: "flex", alignItems: "center", gap: 4 }}
        title="Undo (Ctrl+Z)"
      >
        <UndoIcon size={13} />
        Undo
      </button>
      <button
        onClick={redo}
        disabled={redoLen === 0}
        style={{ ...base, opacity: redoLen === 0 ? 0.3 : 1, display: "flex", alignItems: "center", gap: 4 }}
        title="Redo (Ctrl+Shift+Z)"
      >
        <RedoIcon size={13} />
        Redo
      </button>
    </div>
  );
}

export function HUD() {
  const [layersOpen, setLayersOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

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
      <ExportButtons onExportClick={() => setExportModalOpen(true)} />
      <PlanToolbar />
      <ObjectProperties />
      <HotkeyMenu />
      {/* Layers toggle */}
      <button
        onClick={() => setLayersOpen(!layersOpen)}
        style={{
          ...buttonStyle(layersOpen ? "primary" : "default"),
          position: "absolute",
          top: 48,
          left: 8,
          zIndex: 100,
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
        title="Toggle Layers Panel"
      >
        <LayersIcon size={13} />
        Layers
      </button>
      {layersOpen && <LayersPanel />}
      <StatusBar />
      {exportModalOpen && <ExportModal onClose={() => setExportModalOpen(false)} />}
    </div>
  );
}
