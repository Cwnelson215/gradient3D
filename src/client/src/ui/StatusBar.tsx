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

export function StatusBar() {
  const activeTool = useLandscapeStore((s) => s.activeTool);
  const cursorPos = useLandscapeStore((s) => s.cursorWorldPos);
  const viewScale = useLandscapeStore((s) => s.viewScale);
  const setViewScale = useLandscapeStore((s) => s.setViewScale);
  const setViewOffset = useLandscapeStore((s) => s.setViewOffset);
  const project = useLandscapeStore((s) => s.project);
  const viewOffset = useLandscapeStore((s) => s.viewOffset);

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
    // Get the viewport dimensions from the stage container
    const container = document.querySelector(".konvajs-content");
    if (!container) return;
    const vw = container.clientWidth;
    const vh = container.clientHeight - 28; // subtract status bar height
    const padding = 60;
    const scaleX = (vw - padding * 2) / (widthFt * PIXELS_PER_FOOT);
    const scaleY = (vh - padding * 2) / (depthFt * PIXELS_PER_FOOT);
    const newScale = Math.min(scaleX, scaleY, 20);
    const newOffsetX = (vw - widthFt * PIXELS_PER_FOOT * newScale) / 2;
    const newOffsetY = (vh - depthFt * PIXELS_PER_FOOT * newScale) / 2;
    setViewScale(newScale);
    setViewOffset({ x: newOffsetX, y: newOffsetY });
  };

  return (
    <div style={bar}>
      {/* Left: tool name */}
      <div style={section}>
        <span style={{ color: colors.accent, fontWeight: font.weight.medium }}>
          {toolLabels[activeTool] ?? activeTool}
        </span>
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
