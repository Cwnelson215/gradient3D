import { useState, useCallback, useRef, useEffect } from "react";
import { Stage, Layer } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useLandscapeStore } from "../store/landscapeStore";
import { GridLayer } from "./layers/GridLayer";
import { ObjectLayer } from "./layers/ObjectLayer";
import { InteractionLayer } from "./layers/InteractionLayer";
import { LabelLayer } from "./layers/LabelLayer";
import { SnapGuideLayer } from "./tools/SnapGuides";
import {
  handleDrawClick,
  handleDrawMouseMove,
  initialDrawState,
  type DrawState,
} from "./tools/DrawPolygonTool";
import {
  handleLineClick,
  handleLineDoubleClick,
  handleLineMouseMove,
  handleLineKeyDown,
  initialLineDrawState,
  type LineDrawState,
} from "./tools/DrawLineTool";
import {
  handlePointMouseDown as pointMouseDown,
  handlePointMouseMove as pointMouseMove,
  handlePointMouseUp as pointMouseUp,
  initialPointDrawState,
  type PointDrawState,
} from "./tools/DrawPointTool";
import {
  handleMeasureClick,
  handleMeasureMouseMove,
  initialMeasureState,
  type MeasureState,
} from "./tools/MeasureTool";
import { hitTest, startDrag, updateDrag, type DragState } from "./tools/SelectTool";
import { PIXELS_PER_FOOT, canvasToWorld } from "../utils/coordinates";
import { mergeWithOverlapping } from "../utils/polygonMerge";
import { objectRegistry, toolToObjectType } from "../types/objectRegistry";
import { computeSnapGuides, applySnap, type SnapGuide } from "./tools/SnapGuides";
import { colors, font } from "../ui/theme";
import type Konva from "konva";

export function PlanView() {
  const project = useLandscapeStore((s) => s.project);
  const activeTool = useLandscapeStore((s) => s.activeTool);
  const addObject = useLandscapeStore((s) => s.addObject);
  const selectObject = useLandscapeStore((s) => s.selectObject);
  const updateObject = useLandscapeStore((s) => s.updateObject);
  const removeObject = useLandscapeStore((s) => s.removeObject);
  const objects = useLandscapeStore((s) => s.project?.objects ?? []);
  const setHoveredObjectId = useLandscapeStore((s) => s.setHoveredObjectId);

  // View state from store
  const viewScale = useLandscapeStore((s) => s.viewScale);
  const offset = useLandscapeStore((s) => s.viewOffset);
  const setViewScale = useLandscapeStore((s) => s.setViewScale);
  const setOffset = useLandscapeStore((s) => s.setViewOffset);
  const setCursorWorldPos = useLandscapeStore((s) => s.setCursorWorldPos);

  const stageRef = useRef<Konva.Stage>(null);

  const [dims, setDims] = useState({ w: 800, h: 600 });
  const [drawState, setDrawState] = useState<DrawState>(initialDrawState);
  const [lineDrawState, setLineDrawState] = useState<LineDrawState>(initialLineDrawState);
  const [pointDrawState, setPointDrawState] = useState<PointDrawState>(initialPointDrawState);
  const [measureState, setMeasureState] = useState<MeasureState>(initialMeasureState);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  const panStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  // Determine geometry mode from active tool
  const objectType = toolToObjectType(activeTool);
  const geometryMode = objectType ? objectRegistry[objectType].geometry : null;

  // Reset draw states when switching tools
  useEffect(() => {
    setDrawState(initialDrawState);
    setLineDrawState(initialLineDrawState);
    setPointDrawState(initialPointDrawState);
    setMeasureState(initialMeasureState);
    setSnapGuides([]);
  }, [activeTool]);

  // Keyboard handler for line tool (Enter/Escape) and undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Line tool keyboard
      if (geometryMode === "line" && lineDrawState.points.length > 0) {
        const result = handleLineKeyDown(e, lineDrawState);
        if (result) {
          if (result.finished && objectType) {
            finishLineObject(result.state.points, objectType);
          }
          setLineDrawState(result.finished ? initialLineDrawState : result.state);
          return;
        }
      }
      // Escape to cancel any drawing
      if (e.key === "Escape") {
        setDrawState(initialDrawState);
        setLineDrawState(initialLineDrawState);
        setPointDrawState(initialPointDrawState);
        setMeasureState(initialMeasureState);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [geometryMode, lineDrawState, objectType]);

  // Resize observer
  const measuredRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDims({ w: width, h: height });
    });
    ro.observe(node);
    setDims({ w: node.clientWidth, h: node.clientHeight });
  }, []);

  if (!project) return null;
  const { property } = project;

  function finishLineObject(points: [number, number][], type: string) {
    const reg = objectRegistry[type as keyof typeof objectRegistry];
    const count = objects.filter((o) => o.type === type).length + 1;
    addObject(type as any, `${reg.label} ${count}`, points);
  }

  function finishPolygonObject(points: [number, number][], type: string) {
    const reg = objectRegistry[type as keyof typeof objectRegistry];
    // Only merge for boundary and house types
    if (type === "boundary" || type === "house") {
      const { mergedPoints, consumedIds } = mergeWithOverlapping(points, type as any, objects);
      for (const id of consumedIds) {
        removeObject(id);
      }
      const name =
        type === "boundary"
          ? "Property Boundary"
          : `House ${objects.filter((o) => o.type === "house").length + 1}`;
      addObject(type as any, name, mergedPoints);
    } else {
      const count = objects.filter((o) => o.type === type).length + 1;
      addObject(type as any, `${reg.label} ${count}`, points);
    }
  }

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const factor = 1.1;
    const newScale = direction > 0 ? viewScale * factor : viewScale / factor;
    const clampedScale = Math.min(Math.max(newScale, 0.1), 20);

    const mousePointTo = {
      x: (pointer.x - offset.x) / (PIXELS_PER_FOOT * viewScale),
      y: (pointer.y - offset.y) / (PIXELS_PER_FOOT * viewScale),
    };

    setViewScale(clampedScale);
    setOffset({
      x: pointer.x - mousePointTo.x * PIXELS_PER_FOOT * clampedScale,
      y: pointer.y - mousePointTo.y * PIXELS_PER_FOOT * clampedScale,
    });
  };

  const handleClick = (e: KonvaEventObject<MouseEvent>) => {
    // Annotation tool: single click to place
    if (activeTool === "drawAnnotation") {
      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos) return;
      const worldX = (pos.x - offset.x) / (PIXELS_PER_FOOT * viewScale);
      const worldY = (pos.y - offset.y) / (PIXELS_PER_FOOT * viewScale);
      const count = objects.filter((o) => o.type === "annotation").length + 1;
      const id = addObject("annotation", `Note ${count}`, [[worldX, worldY]], undefined, { text: "Note" });
      selectObject(id);
      return;
    }

    if (activeTool === "measure") {
      setMeasureState(handleMeasureClick(e, measureState, offset.x, offset.y, viewScale, property.gridSpacingFt));
      return;
    }

    if (geometryMode === "polygon" && objectType) {
      const result = handleDrawClick(e, drawState, offset.x, offset.y, viewScale, property.gridSpacingFt, objects);
      if (result.closed) {
        finishPolygonObject(result.state.points, objectType);
        setDrawState(initialDrawState);
      } else {
        setDrawState(result.state);
      }
      return;
    }

    if (geometryMode === "line" && objectType) {
      const result = handleLineClick(e, lineDrawState, offset.x, offset.y, viewScale, property.gridSpacingFt, objects);
      if (result.finished) {
        finishLineObject(result.state.points, objectType);
        setLineDrawState(initialLineDrawState);
      } else {
        setLineDrawState(result.state);
      }
      return;
    }

    if (activeTool === "select") {
      const id = hitTest(e, objects, offset.x, offset.y, viewScale);
      selectObject(id);
    }
  };

  const handleDblClick = (e: KonvaEventObject<MouseEvent>) => {
    if (geometryMode === "line" && objectType && lineDrawState.points.length >= 2) {
      const result = handleLineDoubleClick(lineDrawState);
      if (result.finished) {
        finishLineObject(result.state.points, objectType);
        setLineDrawState(initialLineDrawState);
      }
    }
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (activeTool === "pan" || (activeTool === "select" && e.evt.button === 1)) {
      setIsPanning(true);
      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (pos) {
        panStart.current = { x: pos.x, y: pos.y, ox: offset.x, oy: offset.y };
      }
      return;
    }

    if (geometryMode === "point" && objectType) {
      setPointDrawState(
        pointMouseDown(e, pointDrawState, offset.x, offset.y, viewScale, property.gridSpacingFt)
      );
      return;
    }

    if (activeTool === "select" && e.evt.button === 0) {
      const id = hitTest(e, objects, offset.x, offset.y, viewScale);
      if (id) {
        const obj = objects.find((o) => o.id === id);
        if (obj && !obj.locked) {
          const drag = startDrag(e, obj, offset.x, offset.y, viewScale);
          if (drag) setDragState(drag);
        }
      }
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    // Always update cursor world position
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (pos) {
      const world = canvasToWorld(pos.x, pos.y, offset.x, offset.y, viewScale);
      setCursorWorldPos(world);
    }

    if (isPanning && panStart.current) {
      if (pos) {
        setOffset({
          x: panStart.current.ox + (pos.x - panStart.current.x),
          y: panStart.current.oy + (pos.y - panStart.current.y),
        });
      }
      return;
    }

    if (dragState) {
      const newPos = updateDrag(e, dragState, offset.x, offset.y, viewScale);
      if (newPos) {
        // Compute snap guides during drag
        const movingObj = objects.find((o) => o.id === dragState.objectId);
        if (movingObj) {
          const tempObj = { ...movingObj, position: newPos };
          const guides = computeSnapGuides(tempObj, objects, 8 / (PIXELS_PER_FOOT * viewScale));
          const snapped = applySnap(newPos, guides);
          setSnapGuides(guides);
          updateObject(dragState.objectId, { position: snapped });
        } else {
          updateObject(dragState.objectId, { position: newPos });
        }
      }
      return;
    }

    // Hover hit-testing in select mode
    if (activeTool === "select" && !dragState && !isPanning) {
      const id = hitTest(e, objects, offset.x, offset.y, viewScale);
      setHoveredObjectId(id);
    }

    if (activeTool === "measure") {
      setMeasureState(handleMeasureMouseMove(e, measureState, offset.x, offset.y, viewScale, property.gridSpacingFt));
      return;
    }

    if (geometryMode === "polygon") {
      setDrawState(handleDrawMouseMove(e, drawState, offset.x, offset.y, viewScale, property.gridSpacingFt, objects));
      return;
    }

    if (geometryMode === "line") {
      setLineDrawState(handleLineMouseMove(e, lineDrawState, offset.x, offset.y, viewScale, property.gridSpacingFt, objects));
      return;
    }

    if (geometryMode === "point") {
      setPointDrawState(pointMouseMove(e, pointDrawState, offset.x, offset.y, viewScale));
      return;
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    panStart.current = null;
    setDragState(null);
    setSnapGuides([]);

    if (geometryMode === "point" && objectType && pointDrawState.dragging) {
      const defaultRadius = (objectRegistry[objectType].defaultProperties.radius as number) ?? 3;
      const result = pointMouseUp(pointDrawState, defaultRadius);
      if (result.finished && result.center) {
        const reg = objectRegistry[objectType];
        const count = objects.filter((o) => o.type === objectType).length + 1;
        addObject(objectType, `${reg.label} ${count}`, [result.center], undefined, undefined, result.radius);
      }
      setPointDrawState(initialPointDrawState);
    }
  };

  const handleMouseLeave = () => {
    setCursorWorldPos(null);
    setHoveredObjectId(null);
  };

  const isDrawing = geometryMode !== null || activeTool === "measure" || activeTool === "drawAnnotation";
  const hoveredId = useLandscapeStore.getState().hoveredObjectId;
  const hoveredObj = hoveredId ? objects.find((o) => o.id === hoveredId) : null;
  const canDrag = hoveredObj && !hoveredObj.locked && activeTool === "select";

  return (
    <div ref={measuredRef} style={{ width: "100%", height: "calc(100% - 28px)", background: colors.bg, position: "relative" }}>
      {/* Empty state */}
      {objects.length === 0 && (
        <div style={emptyState}>
          Click a tool above to start designing
        </div>
      )}
      <Stage
        ref={stageRef}
        width={dims.w}
        height={dims.h}
        onWheel={handleWheel}
        onClick={handleClick}
        onDblClick={handleDblClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          cursor:
            activeTool === "pan"
              ? "grab"
              : canDrag
                ? "move"
                : isDrawing
                  ? "crosshair"
                  : "default",
        }}
      >
        <Layer>
          <GridLayer
            widthFt={property.widthFt}
            depthFt={property.depthFt}
            gridSpacingFt={property.gridSpacingFt}
            scale={viewScale}
            offsetX={offset.x}
            offsetY={offset.y}
            backgroundImage={property.backgroundImage}
            stageWidth={dims.w}
            stageHeight={dims.h}
          />
        </Layer>
        <Layer>
          <ObjectLayer scale={viewScale} offsetX={offset.x} offsetY={offset.y} />
        </Layer>
        <Layer>
          <LabelLayer scale={viewScale} offsetX={offset.x} offsetY={offset.y} />
        </Layer>
        <Layer>
          <InteractionLayer
            drawState={drawState}
            lineDrawState={lineDrawState}
            pointDrawState={pointDrawState}
            measureState={measureState}
            scale={viewScale}
            offsetX={offset.x}
            offsetY={offset.y}
          />
          <SnapGuideLayer guides={snapGuides} scale={viewScale} offsetX={offset.x} offsetY={offset.y} />
        </Layer>
      </Stage>
    </div>
  );
}

const emptyState: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  color: colors.textMuted,
  fontSize: font.size.lg,
  fontFamily: font.family,
  pointerEvents: "none",
  opacity: 0.5,
  zIndex: 1,
};
