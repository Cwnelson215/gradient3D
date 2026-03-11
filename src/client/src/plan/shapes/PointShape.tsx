import { Circle } from "react-konva";
import type { LandscapeObject } from "../../types/landscape";
import { PIXELS_PER_FOOT } from "../../utils/coordinates";

interface Props {
  obj: LandscapeObject;
  scale: number;
  offsetX: number;
  offsetY: number;
  selected: boolean;
  onSelect: () => void;
}

export function PointShape({ obj, scale, offsetX, offsetY, selected, onSelect }: Props) {
  if (obj.points.length === 0) return null;

  const pxScale = PIXELS_PER_FOOT * scale;
  const cx = (obj.points[0][0] + obj.position.x) * pxScale + offsetX;
  const cy = (obj.points[0][1] + obj.position.y) * pxScale + offsetY;
  const r = (obj.radius ?? (obj.properties.radius as number) ?? 3) * pxScale;

  return (
    <>
      <Circle
        x={cx}
        y={cy}
        radius={r}
        fill={obj.style.fill ?? "#3a7d2c"}
        stroke={selected ? "#fff" : (obj.style.stroke ?? "#2d5a1e")}
        strokeWidth={(obj.style.strokeWidth ?? 1) * (selected ? 2 : 1)}
        opacity={obj.style.opacity ?? 0.8}
        onClick={onSelect}
        onTap={onSelect}
      />
      {selected && (
        <Circle
          x={cx}
          y={cy}
          radius={3}
          fill="#fff"
        />
      )}
    </>
  );
}
