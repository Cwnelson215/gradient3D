import { useLandscapeStore } from "../store/landscapeStore";
import { colors, font, spacing, radius, transition } from "./theme";
import { PlusIcon, MinusIcon, MaximizeIcon } from "./icons";
import { PIXELS_PER_FOOT } from "../utils/coordinates";

const toolLabels: Record<string, string> = {
  select: "Select",
  pan: "Pan",
  measure: "Measure",
  drawBoundary: "Draw Boundary",
  drawHouse: "Draw House",
  drawFence: "Draw Fence",
  drawPathway: "Draw Pathway",
  drawDriveway: "Draw Driveway",
  drawPatio: "Draw Patio",
  drawRetainingWall: "Draw Retaining Wall",
  drawTree: "Draw Tree",
  drawShrub: "Draw Shrub",
  drawFlowerBed: "Draw Flower Bed",
  drawGarden: "Draw Garden",
  drawLawn: "Draw Lawn",
  drawPond: "Draw Pond",
  drawPool: "Draw Pool",
  drawIrrigation: "Draw Irrigation",
  drawAnnotation: "Add Annotation",
};

const toolHints: Record<string, string> = {
  select: "Click to select, drag to move",
  pan: "Click and drag to pan the view",
  measure: "Click to place measurement points",
  drawBoundary: "Click to place points, close shape to finish",
  drawHouse: "Click to place points, close shape to finish",
  drawFence: "Click to place points, Enter to finish",
  drawPathway: "Click to place points, Enter to finish",
  drawDriveway: "Click to place points, close shape to finish",
  drawPatio: "Click to place points, close shape to finish",
  drawRetainingWall: "Click to place points, Enter to finish",
  drawTree: "Click and drag to set radius",
  drawShrub: "Click and drag to set radius",
  drawFlowerBed: "Click to place points, close shape to finish",
  drawGarden: "Click to place points, close shape to finish",
  drawLawn: "Click to place points, close shape to finish",
  drawPond: "Click to place points, close shape to finish",
  drawPool: "Click to place points, close shape to finish",
  drawIrrigation: "Click to place points, Enter to finish",
  drawAnnotation: "Click to place a note",
};

export function StatusBar() {
  const activeTool = useLandscapeStore((s) => s.activeTool);
  const cursorPos = useLandscapeStore((s) => s.cursorWorldPos);
  const viewScale = useLandscapeStore((s) => s.viewScale);
  const setViewScale = useLandscapeStore((s) => s.setViewScale);
  const setViewOffset = useLandscapeStore((s) => s.setViewOffset);
  const project = useLandscapeStore((s) => s.project);

  const zoomPercent = Math.round(viewScale * 100);

  const handleZoomIn = () => {
    const newScale = Math.min(viewScale * 1.25, 20);
    setViewScale(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(viewScale / 1.25, 0.1);
    setViewScale(newScale);
  };

  const handleFitToView = () => {
    if (!project) return;
    const { widthFt, depthFt } = project.property;
    const container = document.querySelector(".konvajs-content");
    if (!container) return;
    const vw = container.clientWidth;
    const vh = container.clientHeight - 28;
    const padding = 60;
    const scaleX = (vw - padding * 2) / (widthFt * PIXELS_PER_FOOT);
    const scaleY = (vh - padding * 2) / (depthFt * PIXELS_PER_FOOT);
    const newScale = Math.min(scaleX, scaleY, 20);
    const newOffsetX = (vw - widthFt * PIXELS_PER_FOOT * newScale) / 2;
    const newOffsetY = (vh - depthFt * PIXELS_PER_FOOT * newScale) / 2;
    setViewScale(newScale);
    setViewOffset({ x: newOffsetX, y: newOffsetY });
  };

  const hint = toolHints[activeTool];

  return (
    <div style={bar}>
      {/* Left: tool name + hint */}
      <div style={section}>
        <span style={{ color: colors.accent, fontWeight: font.weight.medium }}>
          {toolLabels[activeTool] ?? activeTool}
        </span>
        {hint && (
          <>
            <span style={hintSep} />
            <span style={{ color: colors.textMuted }}>{hint}</span>
          </>
        )}
      </div>

      {/* Center: cursor position */}
      <div style={{ ...section, justifyContent: "center" }}>
        {cursorPos ? (
          <span style={{ color: colors.textMuted }}>
            X: {cursorPos.x.toFixed(1)} ft &nbsp; Y: {cursorPos.y.toFixed(1)} ft
          </span>
        ) : (
          <span style={{ color: colors.textMuted }}>---</span>
        )}
      </div>

      {/* Right: zoom controls */}
      <div style={{ ...section, justifyContent: "flex-end", gap: spacing.sm }}>
        <button onClick={handleZoomOut} style={zoomBtn} title="Zoom Out">
          <MinusIcon size={12} color={colors.textMuted} />
        </button>
        <span style={{ color: colors.textMuted, minWidth: 40, textAlign: "center" }}>
          {zoomPercent}%
        </span>
        <button onClick={handleZoomIn} style={zoomBtn} title="Zoom In">
          <PlusIcon size={12} color={colors.textMuted} />
        </button>
        <button onClick={handleFitToView} style={zoomBtn} title="Fit to View">
          <MaximizeIcon size={12} color={colors.textMuted} />
        </button>
      </div>
    </div>
  );
}

const bar: React.CSSProperties = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: 28,
  background: colors.surface,
  borderTop: `1px solid ${colors.border}`,
  display: "flex",
  alignItems: "center",
  padding: `0 ${spacing.lg}px`,
  fontFamily: font.family,
  fontSize: font.size.xs,
  zIndex: 100,
  pointerEvents: "auto",
};

const section: React.CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
};

const hintSep: React.CSSProperties = {
  width: 1,
  height: 12,
  background: colors.border,
  margin: `0 ${spacing.md}px`,
};

const zoomBtn: React.CSSProperties = {
  background: "none",
  border: `1px solid ${colors.border}`,
  borderRadius: radius.sm,
  cursor: "pointer",
  padding: 3,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition,
};
