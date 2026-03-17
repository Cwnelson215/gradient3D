import { Line, Circle } from "react-konva";
import type { LandscapeObject } from "../../types/landscape";
import { PIXELS_PER_FOOT } from "../../utils/coordinates";
import { getShadowProps } from "../patterns/shadowConfig";

interface Props {
  obj: LandscapeObject;
  scale: number;
  offsetX: number;
  offsetY: number;
  selected: boolean;
  hovered?: boolean;
  onSelect: () => void;
}

export function LineShape({ obj, scale, offsetX, offsetY, selected, hovered, onSelect }: Props) {
  const pxScale = PIXELS_PER_FOOT * scale;
  const shadow = getShadowProps(obj.type);

  const transformedPoints = obj.points.map((p) => ({
    x: (p[0] + obj.position.x) * pxScale + offsetX,
    y: (p[1] + obj.position.y) * pxScale + offsetY,
  }));

  const flatPoints = transformedPoints.flatMap((p) => [p.x, p.y]);

  const isFence = obj.type === "fence";
  const isRetainingWall = obj.type === "retaining-wall";

  const hoverGlow = hovered ? {
    shadowColor: '#4a9eff',
    shadowBlur: 8,
    shadowOpacity: 0.3,
    shadowEnabled: true,
  } : {};

  // Fence posts: perpendicular tick marks along segments
  const fencePosts: React.ReactNode[] = [];
  if (isFence && transformedPoints.length >= 2) {
    const postSpacing = 2 * pxScale; // every ~2ft
    for (let i = 0; i < transformedPoints.length - 1; i++) {
      const ax = transformedPoints[i].x, ay = transformedPoints[i].y;
      const bx = transformedPoints[i + 1].x, by = transformedPoints[i + 1].y;
      const dx = bx - ax, dy = by - ay;
      const segLen = Math.sqrt(dx * dx + dy * dy);
      if (segLen < 1) continue;
      const nx = -dy / segLen, ny = dx / segLen;
      const tickLen = 3;
      for (let d = 0; d <= segLen; d += postSpacing) {
        const px = ax + (dx * d) / segLen;
        const py = ay + (dy * d) / segLen;
        fencePosts.push(
          <Line
            key={`post-${i}-${d}`}
            points={[px - nx * tickLen, py - ny * tickLen, px + nx * tickLen, py + ny * tickLen]}
            stroke={selected ? "#fff" : (obj.style.stroke ?? "#8B6914")}
            strokeWidth={1.5}
          />
        );
      }
    }
  }

  // Retaining wall: parallel offset line for wall thickness
  const wallOffsetLines: React.ReactNode[] = [];
  if (isRetainingWall && transformedPoints.length >= 2) {
    const wallWidth = ((obj.properties.width as number) ?? 1) * pxScale * 0.5;
    const offPoints: number[] = [];
    for (let i = 0; i < transformedPoints.length; i++) {
      let nx = 0, ny = 0;
      if (i < transformedPoints.length - 1) {
        const dx = transformedPoints[i + 1].x - transformedPoints[i].x;
        const dy = transformedPoints[i + 1].y - transformedPoints[i].y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) { nx = -dy / len; ny = dx / len; }
      } else if (i > 0) {
        const dx = transformedPoints[i].x - transformedPoints[i - 1].x;
        const dy = transformedPoints[i].y - transformedPoints[i - 1].y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) { nx = -dy / len; ny = dx / len; }
      }
      offPoints.push(transformedPoints[i].x + nx * wallWidth, transformedPoints[i].y + ny * wallWidth);
    }
    wallOffsetLines.push(
      <Line
        key="wall-offset"
        points={offPoints}
        closed={false}
        stroke={selected ? "#ddd" : (obj.style.stroke ?? "#777")}
        strokeWidth={(obj.style.strokeWidth ?? 4) * 0.6}
        opacity={obj.style.opacity ?? 1}
      />
    );
  }

  return (
    <>
      <Line
        points={flatPoints}
        closed={false}
        stroke={selected ? "#fff" : (obj.style.stroke ?? "#888")}
        strokeWidth={(obj.style.strokeWidth ?? 2) * (selected ? 1.5 : 1)}
        dash={obj.style.dash}
        opacity={obj.style.opacity ?? 1}
        {...(hovered ? hoverGlow : shadow)}
        onClick={onSelect}
        onTap={onSelect}
        hitStrokeWidth={12}
      />
      {wallOffsetLines}
      {fencePosts}
      {selected &&
        obj.points.map((p, i) => (
          <Circle
            key={i}
            x={(p[0] + obj.position.x) * pxScale + offsetX}
            y={(p[1] + obj.position.y) * pxScale + offsetY}
            radius={4}
            fill="#fff"
            stroke={obj.style.stroke ?? "#888"}
            strokeWidth={1}
          />
        ))}
    </>
  );
}
