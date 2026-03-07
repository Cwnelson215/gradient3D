import { useState, useCallback, useRef } from "react";
import { Stage, Layer } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useLandscapeStore } from "../store/landscapeStore";
import { GridLayer } from "./layers/GridLayer";
import { ObjectLayer } from "./layers/ObjectLayer";
import { InteractionLayer } from "./layers/InteractionLayer";
import {
  handleDrawClick,
  handleDrawMouseMove,
  initialDrawState,
  type DrawState,
} from "./tools/DrawPolygonTool";
import { hitTest, startDrag, updateDrag, type DragState } from "./tools/SelectTool";
import { PIXELS_PER_FOOT } from "../utils/coordinates";

export function PlanView() {
  const project = useLandscapeStore((s) => s.project);
  const activeTool = useLandscapeStore((s) => s.activeTool);
  const addObject = useLandscapeStore((s) => s.addObject);
  const selectObject = useLandscapeStore((s) => s.selectObject);
  const updateObject = useLandscapeStore((s) => s.updateObject);
  const objects = useLandscapeStore((s) => s.project?.objects ?? []);

  const [dims, setDims] = useState({ w: 800, h: 600 });
  const [viewScale, setViewScale] = useState(1);
  const [offset, setOffset] = useState({ x: 40, y: 40 });
  const [drawState, setDrawState] = useState<DrawState>(initialDrawState);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

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

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const factor = 1.1;
    const newScale = direction > 0 ? viewScale * factor : viewScale / factor;
    const clampedScale = Math.min(Math.max(newScale, 0.1), 10);

    // Zoom toward pointer
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
    if (activeTool === "drawBoundary" || activeTool === "drawHouse") {
      const result = handleDrawClick(e, drawState, offset.x, offset.y, viewScale);
      if (result.closed) {
        const type = activeTool === "drawBoundary" ? "boundary" : "house";
        const name =
          type === "boundary"
            ? "Property Boundary"
            : `House ${objects.filter((o) => o.type === "house").length + 1}`;
        addObject(type, name, result.state.points);
        setDrawState(initialDrawState);
      } else {
        setDrawState(result.state);
      }
    } else if (activeTool === "select") {
      const id = hitTest(e, objects, offset.x, offset.y, viewScale);
      selectObject(id);
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

    if (activeTool === "select" && e.evt.button === 0) {
      const id = hitTest(e, objects, offset.x, offset.y, viewScale);
      if (id) {
        const obj = objects.find((o) => o.id === id);
        if (obj) {
          const drag = startDrag(e, obj, offset.x, offset.y, viewScale);
          if (drag) setDragState(drag);
        }
      }
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (isPanning && panStart.current) {
      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
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
        updateObject(dragState.objectId, { position: newPos });
      }
      return;
    }

    if (activeTool === "drawBoundary" || activeTool === "drawHouse") {
      setDrawState(handleDrawMouseMove(e, drawState, offset.x, offset.y, viewScale));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    panStart.current = null;
    setDragState(null);
  };

  return (
    <div ref={measuredRef} style={{ width: "100%", height: "100%", background: "#111" }}>
      <Stage
        width={dims.w}
        height={dims.h}
        onWheel={handleWheel}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          cursor:
            activeTool === "pan"
              ? "grab"
              : activeTool === "drawBoundary" || activeTool === "drawHouse"
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
          />
        </Layer>
        <Layer>
          <ObjectLayer scale={viewScale} offsetX={offset.x} offsetY={offset.y} />
        </Layer>
        <Layer>
          <InteractionLayer
            drawState={drawState}
            scale={viewScale}
            offsetX={offset.x}
            offsetY={offset.y}
          />
        </Layer>
      </Stage>
    </div>
  );
}
