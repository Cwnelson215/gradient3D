import { Line, Circle, Text } from "react-konva";
import type { DrawState } from "../tools/DrawPolygonTool";
import type { LineDrawState } from "../tools/DrawLineTool";
import type { PointDrawState } from "../tools/DrawPointTool";
import type { MeasureState } from "../tools/MeasureTool";
import { getMeasureDistance } from "../tools/MeasureTool";
import { PIXELS_PER_FOOT, polylineLength } from "../../utils/coordinates";

interface Props {
  drawState: DrawState;
  lineDrawState: LineDrawState;
  pointDrawState: PointDrawState;
  measureState: MeasureState;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function InteractionLayer({
  drawState,
  lineDrawState,
  pointDrawState,
  measureState,
  scale,
  offsetX,
  offsetY,
}: Props) {
  const pxScale = PIXELS_PER_FOOT * scale;

  return (
    <>
      <PolygonPreview drawState={drawState} pxScale={pxScale} offsetX={offsetX} offsetY={offsetY} />
      <LinePreview lineDrawState={lineDrawState} pxScale={pxScale} offsetX={offsetX} offsetY={offsetY} />
      <PointPreview pointDrawState={pointDrawState} pxScale={pxScale} offsetX={offsetX} offsetY={offsetY} />
      <MeasurePreview measureState={measureState} pxScale={pxScale} offsetX={offsetX} offsetY={offsetY} />
    </>
  );
}

function PolygonPreview({
  drawState,
  pxScale,
  offsetX,
  offsetY,
}: {
  drawState: DrawState;
  pxScale: number;
  offsetX: number;
  offsetY: number;
}) {
  const { points, previewPoint } = drawState;
  if (points.length === 0) return null;

  const allPoints = previewPoint ? [...points, previewPoint] : points;
  const flatPoints = allPoints.flatMap((p) => [
    p[0] * pxScale + offsetX,
    p[1] * pxScale + offsetY,
  ]);

  return (
    <>
      <Line points={flatPoints} stroke="#4a9eff" strokeWidth={2} dash={[6, 3]} closed={false} />
      {points.map((p, i) => (
        <Circle
          key={i}
          x={p[0] * pxScale + offsetX}
          y={p[1] * pxScale + offsetY}
          radius={i === 0 && points.length >= 3 ? 7 : 4}
          fill={i === 0 && points.length >= 3 ? "#4a9eff" : "#fff"}
          stroke="#4a9eff"
          strokeWidth={1}
        />
      ))}
      {previewPoint && points.length >= 1 && (() => {
        const prev = points[points.length - 1];
        const length = polylineLength([prev, previewPoint]);
        return (
          <Text
            x={previewPoint[0] * pxScale + offsetX + 12}
            y={previewPoint[1] * pxScale + offsetY - 16}
            text={`${length.toFixed(1)} ft`}
            fill="#4a9eff"
            fontSize={13}
            fontFamily="Inter, sans-serif"
            fontStyle="bold"
          />
        );
      })()}
    </>
  );
}

function LinePreview({
  lineDrawState,
  pxScale,
  offsetX,
  offsetY,
}: {
  lineDrawState: LineDrawState;
  pxScale: number;
  offsetX: number;
  offsetY: number;
}) {
  const { points, previewPoint } = lineDrawState;
  if (points.length === 0) return null;

  const allPoints = previewPoint ? [...points, previewPoint] : points;
  const flatPoints = allPoints.flatMap((p) => [
    p[0] * pxScale + offsetX,
    p[1] * pxScale + offsetY,
  ]);

  return (
    <>
      <Line points={flatPoints} stroke="#ff9e4a" strokeWidth={2} dash={[6, 3]} closed={false} />
      {points.map((p, i) => (
        <Circle
          key={i}
          x={p[0] * pxScale + offsetX}
          y={p[1] * pxScale + offsetY}
          radius={4}
          fill="#fff"
          stroke="#ff9e4a"
          strokeWidth={1}
        />
      ))}
      {previewPoint && points.length >= 1 && (() => {
        const prev = points[points.length - 1];
        const length = polylineLength([prev, previewPoint]);
        return (
          <Text
            x={previewPoint[0] * pxScale + offsetX + 12}
            y={previewPoint[1] * pxScale + offsetY - 16}
            text={`${length.toFixed(1)} ft`}
            fill="#ff9e4a"
            fontSize={13}
            fontFamily="Inter, sans-serif"
            fontStyle="bold"
          />
        );
      })()}
    </>
  );
}

function PointPreview({
  pointDrawState,
  pxScale,
  offsetX,
  offsetY,
}: {
  pointDrawState: PointDrawState;
  pxScale: number;
  offsetX: number;
  offsetY: number;
}) {
  if (!pointDrawState.center) return null;
  const cx = pointDrawState.center[0] * pxScale + offsetX;
  const cy = pointDrawState.center[1] * pxScale + offsetY;
  const r = pointDrawState.radius * pxScale;

  return (
    <>
      <Circle
        x={cx}
        y={cy}
        radius={Math.max(r, 4)}
        fill="rgba(74, 158, 255, 0.2)"
        stroke="#4a9eff"
        strokeWidth={2}
      />
      <Circle x={cx} y={cy} radius={3} fill="#4a9eff" />
    </>
  );
}

function MeasurePreview({
  measureState,
  pxScale,
  offsetX,
  offsetY,
}: {
  measureState: MeasureState;
  pxScale: number;
  offsetX: number;
  offsetY: number;
}) {
  const { startPoint, previewPoint } = measureState;
  if (!startPoint) return null;

  const sx = startPoint[0] * pxScale + offsetX;
  const sy = startPoint[1] * pxScale + offsetY;
  const endPt = previewPoint;

  const dist = getMeasureDistance(measureState);

  if (!endPt) {
    return <Circle x={sx} y={sy} radius={4} fill="#ff4a4a" stroke="#fff" strokeWidth={1} />;
  }

  const ex = endPt[0] * pxScale + offsetX;
  const ey = endPt[1] * pxScale + offsetY;

  return (
    <>
      <Line points={[sx, sy, ex, ey]} stroke="#ff4a4a" strokeWidth={2} dash={[4, 4]} />
      <Circle x={sx} y={sy} radius={4} fill="#ff4a4a" stroke="#fff" strokeWidth={1} />
      <Circle x={ex} y={ey} radius={4} fill="#ff4a4a" stroke="#fff" strokeWidth={1} />
      {dist !== null && (
        <Text
          x={(sx + ex) / 2 + 8}
          y={(sy + ey) / 2 - 12}
          text={`${dist.toFixed(1)} ft`}
          fill="#ff4a4a"
          fontSize={13}
          fontFamily="Inter, sans-serif"
          fontStyle="bold"
        />
      )}
    </>
  );
}
