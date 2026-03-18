import { useState } from "react";
import { useLandscapeStore } from "../store/landscapeStore";
import { PlanToolbar } from "./PlanToolbar";
import { ObjectProperties } from "./ObjectProperties";
import { FileMenuButtons } from "./FileMenu";
import { ExportButton } from "./ExportButtons";
import { HotkeyButton, HotkeyPanel } from "./HotkeyMenu";
import { LayersPanel } from "./LayersPanel";
import { StatusBar } from "./StatusBar";
import { ExportModal } from "./ExportModal";
import { ToastContainer } from "./Toast";
import { colors, panelStyle, spacing, zIndex } from "./theme";
import { UndoIcon, RedoIcon, LayersIcon, SunIcon, MoonIcon } from "./icons";
import { Tooltip } from "./Tooltip";

function UndoRedoButtons() {
  const undo = useLandscapeStore((s) => s.undo);
  const redo = useLandscapeStore((s) => s.redo);
  const undoLen = useLandscapeStore((s) => s.undoStack.length);
  const redoLen = useLandscapeStore((s) => s.redoStack.length);

  return (
    <>
      <Tooltip content="Undo" shortcut="Ctrl+Z">
        <button
          onClick={undo}
          disabled={undoLen === 0}
          style={{ ...iconBtn, opacity: undoLen === 0 ? 0.3 : 1 }}
        >
          <UndoIcon size={15} />
        </button>
      </Tooltip>
      <Tooltip content="Redo" shortcut="Ctrl+Shift+Z">
        <button
          onClick={redo}
          disabled={redoLen === 0}
          style={{ ...iconBtn, opacity: redoLen === 0 ? 0.3 : 1 }}
        >
          <RedoIcon size={15} />
        </button>
      </Tooltip>
    </>
  );
}

function ThemeToggle() {
  const theme = useLandscapeStore((s) => s.theme);
  const toggleTheme = useLandscapeStore((s) => s.toggleTheme);

  return (
    <Tooltip content={theme === "dark" ? "Light mode" : "Dark mode"}>
      <button onClick={toggleTheme} style={iconBtn}>
        {theme === "dark" ? <SunIcon size={15} /> : <MoonIcon size={15} />}
      </button>
    </Tooltip>
  );
}

export function HUD() {
  const [layersOpen, setLayersOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [hotkeyOpen, setHotkeyOpen] = useState(false);

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
      {/* Top bar */}
      <div style={topBar}>
        {/* Left pill: File + Undo/Redo + Layers */}
        <div style={pill}>
          <FileMenuButtons />
          <div style={pillSep} />
          <UndoRedoButtons />
          <div style={pillSep} />
          <Tooltip content="Layers">
            <button
              onClick={() => setLayersOpen(!layersOpen)}
              style={{
                ...iconBtn,
                color: layersOpen ? colors.accent : colors.textMuted,
              }}
            >
              <LayersIcon size={15} />
            </button>
          </Tooltip>
        </div>

        {/* Center pill: Tools */}
        <div style={pill}>
          <PlanToolbar />
        </div>

        {/* Right pill: Export + Theme + Help */}
        <div style={pill}>
          <ExportButton onExportClick={() => setExportModalOpen(true)} />
          <div style={pillSep} />
          <ThemeToggle />
          <div style={pillSep} />
          <HotkeyButton open={hotkeyOpen} onToggle={() => setHotkeyOpen(!hotkeyOpen)} />
        </div>
      </div>

      <ObjectProperties />
      {layersOpen && <LayersPanel />}
      <StatusBar />
      <ToastContainer />
      {exportModalOpen && <ExportModal onClose={() => setExportModalOpen(false)} />}
      {hotkeyOpen && <HotkeyPanel onClose={() => setHotkeyOpen(false)} />}
    </div>
  );
}

const topBar: React.CSSProperties = {
  position: "absolute",
  top: spacing.md,
  left: spacing.md,
  right: spacing.md,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  zIndex: zIndex.hud,
  pointerEvents: "none",
};

const pill: React.CSSProperties = {
  ...panelStyle(),
  display: "flex",
  alignItems: "center",
  padding: `${spacing.sm}px ${spacing.sm + 2}px`,
  gap: spacing.xs,
  pointerEvents: "auto",
};

const pillSep: React.CSSProperties = {
  width: 1,
  alignSelf: "stretch",
  background: colors.border,
  margin: `${spacing.sm}px ${spacing.xs}px`,
};

const iconBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 6,
  borderRadius: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: colors.textMuted,
  transition: "all 0.15s ease",
};
