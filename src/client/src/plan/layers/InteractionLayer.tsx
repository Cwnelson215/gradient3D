import { Line, Circle } from "react-konva";
import type { DrawState } from "../tools/DrawPolygonTool";
import { PIXELS_PER_FOOT } from "../../utils/coordinates";

interface Props {
  drawState: DrawState;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function InteractionLayer({ drawState, scale, offsetX, offsetY }: Props) {
  const { points, previewPoint } = drawState;
  if (points.length === 0) return null;

  const pxScale = PIXELS_PER_FOOT * scale;

  const allPoints = previewPoint ? [...points, previewPoint] : points;
  const flatPoints = allPoints.flatMap((p) => [
    p[0] * pxScale + offsetX,
    p[1] * pxScale + offsetY,
  ]);

  return (
    <>
      <Line
        points={flatPoints}
        stroke="#4a9eff"
        strokeWidth={2}
        dash={[6, 3]}
        closed={false}
      />
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
    </>
  );
}
